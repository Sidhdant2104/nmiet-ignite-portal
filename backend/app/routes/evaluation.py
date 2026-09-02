"""Mongo-backed evaluation configuration and restricted evaluation sessions."""
from datetime import datetime, timedelta, timezone
from math import isfinite
from typing import Optional
import re, uuid, bcrypt, jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Cookie, Query, Response
from pymongo.errors import DuplicateKeyError
from pydantic import BaseModel, Field
from app.config import ADMIN_JWT_SECRET
from app.mongodb import evaluation_track_collection as tracks, judge_collection as judges, track_coordinator_collection as coordinators, presentation_queue_collection as queues, evaluation_criteria_collection as criteria, evaluation_collection as evaluations, registration_collection as registrations
from app.routes.admin import require, csrf_guard

admin=APIRouter(prefix="/admin/evaluation",tags=["Evaluation"]); judge=APIRouter(prefix="/judge",tags=["Judge Evaluation"]); coordinator=APIRouter(prefix="/track",tags=["Track Queue"])
class TrackIn(BaseModel):
    name: str = Field(min_length=2)
    code: str = Field(min_length=1)
    theme: str = Field(min_length=2)
    domain: str = Field(min_length=2)
    judges_required: int = Field(ge=1)
    is_active: bool = True
class AccountIn(BaseModel): name:str=Field(min_length=2); track_id:str; password:str=Field(min_length=8); is_active:bool=True
class AccountUpdate(BaseModel): name:Optional[str]=Field(None,min_length=2); track_id:Optional[str]=None; password:Optional[str]=Field(None,min_length=8); is_active:Optional[bool]=None
class LoginIn(BaseModel): name:str; track_id:str; password:str
class QueueIn(BaseModel): team_ids:list[str]
class EvalIn(BaseModel): registration_id:str; scores:dict[str,float]
class CriterionIn(BaseModel): name:str=Field(min_length=2); description:str=""; max_marks:int=Field(ge=1); order:int=0; is_active:bool=True
def secret():
 if not ADMIN_JWT_SECRET or len(ADMIN_JWT_SECRET)<32: raise HTTPException(503,"Authentication is not configured.")
 return ADMIN_JWT_SECRET
async def active_tracks(): return [x async for x in tracks.find({"is_active":True})]
def match(reg,track):
 t=reg.get("team",{}); return t.get("category","").strip().casefold()==track["domain"].strip().casefold()
async def teams_for(track): return [r async for r in registrations.find({"isDeleted":{"$ne":True}}) if match(r,track)]
async def queue_for(track):
 teamdocs=await teams_for(track); ids=[x["registration_id"] for x in teamdocs]; saved=await queues.find_one({"track_id":track["track_id"]}); ordered=[x for x in (saved or {}).get("team_ids",[]) if x in ids]+[x for x in ids if x not in (saved or {}).get("team_ids",[])]; lookup={x["registration_id"]:x for x in teamdocs}; return ordered,lookup
def public_team(reg):
 t=reg.get("team",{})
 return {"registration_id":reg.get("registration_id",""),"reference_id":reg.get("registration_id",""),"team_name":t.get("teamName",""),"ps_id":t.get("psId",""),"problem_statement":t.get("psTitle",""),"theme":t.get("theme",""),"domain":t.get("category","")}
def evaluation_payload(ev):
 if not ev: return None
 return {"id":ev.get("evaluation_id"),"evaluation_id":ev.get("evaluation_id"),"scores":ev.get("scores",{}),"total":ev.get("total_score",0)}
async def criteria_payload():
 return [{"id":c["id"],"name":c["name"],"max_marks":c["max_marks"],"description":c.get("description","")} async for c in criteria.find({"is_active":True}).sort("order",1)]
async def find_registration(reference_id:str):
 ref=(reference_id or "").strip()
 if not ref: return None
 return await registrations.find_one({"isDeleted":{"$ne":True},"registration_id":{"$regex":f"^{re.escape(ref)}$","$options":"i"}})
async def judge_context(judge_session):
 d=await auth(judge_session,"judge",judges); t=await tracks.find_one({"track_id":d["track_id"],"is_active":True})
 if not t: raise HTTPException(403,"This track is inactive.")
 return d,t
async def score_total(scores:dict[str,float]):
 cs={c["id"]:c async for c in criteria.find({"is_active":True})}
 if not cs: raise HTTPException(409,"Evaluation criteria must be configured before evaluations can begin.")
 if set(scores)!=set(cs): raise HTTPException(422,"All criteria must be scored.")
 if any(not isfinite(v) or v<0 or v>cs[k]["max_marks"] for k,v in scores.items()): raise HTTPException(422,"Invalid score.")
 return sum(scores.values())
async def auth(cookie,name,collection):
 if not cookie: raise HTTPException(401,"Authentication required.")
 try: p=jwt.decode(cookie,secret(),algorithms=["HS256"]); doc=await collection.find_one({"_id":ObjectId(p["sub"]),"is_active":True})
 except Exception: doc=None
 if not doc: raise HTTPException(401,"Session is invalid.")
 return doc
@admin.get("/overview")
async def overview(user=Depends(require("manage_evaluation"))):
 ts=await active_tracks(); js=await judges.count_documents({"is_active":True}); cs=await coordinators.count_documents({"is_active":True}); teams=sum([len(await teams_for(t)) for t in ts]); expected=sum([len(await teams_for(t))*t["judges_required"] for t in ts]); done=await evaluations.count_documents({"status":"submitted"}); return {"tracks":len(ts),"judges":js,"coordinators":cs,"teams_assigned":teams,"evaluations_completed":done,"evaluations_expected":expected,"progress_percentage":round(done/expected*100,1) if expected else 0}
@admin.get("/tracks")
async def get_tracks(user=Depends(require("manage_evaluation"))):
 out=[]
 async for t in tracks.find().sort("created_at",-1): out.append({**t,"_id":str(t["_id"]),"team_count":len(await teams_for(t))})
 return {"data":out}
@admin.post("/tracks",dependencies=[Depends(csrf_guard)])
async def create_track(x:TrackIn,user=Depends(require("manage_evaluation"))):
 if await tracks.find_one({"code":x.code.strip().upper()}): raise HTTPException(409,"Track code already exists.")
 now=datetime.now(timezone.utc); doc=x.model_dump(); doc.update({"track_id":"TRACK-"+uuid.uuid4().hex[:8].upper(),"code":x.code.strip().upper(),"created_at":now,"updated_at":now}); r=await tracks.insert_one(doc); return {"id":str(r.inserted_id),"track_id":doc["track_id"]}
@admin.patch("/tracks/{track_id}",dependencies=[Depends(csrf_guard)])
async def update_track(track_id:str,x:TrackIn,user=Depends(require("manage_evaluation"))):
 r=await tracks.update_one({"track_id":track_id},{"$set":{**x.model_dump(),"code":x.code.strip().upper(),"updated_at":datetime.now(timezone.utc)}})
 if not r.matched_count: raise HTTPException(404,"Track not found.")
 return {"success":True}
@admin.delete("/tracks/{track_id}",dependencies=[Depends(csrf_guard)])
async def deactivate_track(track_id:str,user=Depends(require("manage_evaluation"))):
 r=await tracks.update_one({"track_id":track_id},{"$set":{"is_active":False,"updated_at":datetime.now(timezone.utc)}})
 if not r.matched_count: raise HTTPException(404,"Track not found.")
 return {"success":True}
async def account_list(coll):
 out=[]
 async for x in coll.find().sort("created_at",-1):
  x["_id"]=str(x["_id"]);x.pop("password_hash",None);out.append(x)
 return out
async def make_account(x, coll, prefix, role):
    try:
        print("DEBUG: creating account:", x.model_dump())

        track = await tracks.find_one({
            "track_id": x.track_id,
            "is_active": True
        })
        print("DEBUG: track:", track)

        if not track:
            raise HTTPException(404, "Track not found.")

        if coll is coordinators and await coordinators.find_one({
            "track_id": x.track_id
        }):
            raise HTTPException(
                409,
                "A coordinator is already assigned to this track."
            )

        if await coll.find_one({
            "name": x.name.strip(),
            "track_id": x.track_id
        }):
            raise HTTPException(409, "Name already exists in this track.")

        now = datetime.now(timezone.utc)

        password_hash = bcrypt.hashpw(
            x.password.encode(),
            bcrypt.gensalt()
        ).decode()

        account_id = prefix + uuid.uuid4().hex[:8].upper()

        doc = {
            "id": account_id,
            "name": x.name.strip(),
            "track_id": x.track_id,
            "role": role,
            "password_hash": password_hash,
            "is_active": x.is_active,
            "created_at": now,
            "updated_at": now,
        }

        if role == "judge":
            doc["judge_id"] = account_id
       

        print("DEBUG: inserting:", doc)

        r = await coll.insert_one(doc)

        print("DEBUG: inserted:", r.inserted_id)

        return {
            "id": str(r.inserted_id),
            f"{role}_id": doc["id"]
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Account creation failed: {str(e)}")
@admin.get("/judges")
async def get_judges(user=Depends(require("manage_evaluation"))):
    return {"data": await account_list(judges)}
@admin.post("/judges",dependencies=[Depends(csrf_guard)])
async def create_judge(x:AccountIn,user=Depends(require("manage_evaluation"))): return await make_account(x,judges,"JUDGE-","judge")
async def update_account(account_id,x,coll):
 d=x.model_dump(exclude_none=True)
 if "track_id" in d and not await tracks.find_one({"track_id":d["track_id"],"is_active":True}): raise HTTPException(404,"Track not found.")
 if "password" in d:d["password_hash"]=bcrypt.hashpw(d.pop("password").encode(),bcrypt.gensalt()).decode()
 d["updated_at"]=datetime.now(timezone.utc);r=await coll.update_one({"id":account_id},{"$set":d})
 if not r.matched_count:raise HTTPException(404,"Account not found.")
 return {"success":True}
@admin.patch("/judges/{account_id}",dependencies=[Depends(csrf_guard)])
async def update_judge(account_id:str,x:AccountUpdate,user=Depends(require("manage_evaluation"))): return await update_account(account_id,x,judges)
@admin.get("/coordinators")
async def get_coordinators(user=Depends(require("manage_evaluation"))): return {"data":await account_list(coordinators)}
@admin.post("/coordinators",dependencies=[Depends(csrf_guard)])
async def create_coordinator(x:AccountIn,user=Depends(require("manage_evaluation"))): return await make_account(x,coordinators,"COORD-","track_student_coordinator")
@admin.patch("/coordinators/{account_id}",dependencies=[Depends(csrf_guard)])
async def update_coordinator(account_id:str,x:AccountUpdate,user=Depends(require("manage_evaluation"))): return await update_account(account_id,x,coordinators)
@admin.get("/criteria")
async def get_criteria(user=Depends(require("manage_evaluation"))): return {"data":[{**c,"_id":str(c["_id"])} async for c in criteria.find().sort("order",1)]}
@admin.post("/criteria", dependencies=[Depends(csrf_guard)])
async def create_criterion(
    x: CriterionIn,
    user=Depends(require("manage_evaluation"))
):
    d = x.model_dump()

    criterion_id = "CRIT-" + uuid.uuid4().hex[:8].upper()

    d.update({
        "id": criterion_id,
        "criterion_id": criterion_id,
        "created_at": datetime.now(timezone.utc)
    })

    r = await criteria.insert_one(d)

    return {
        "id": str(r.inserted_id),
        "criterion_id": criterion_id
    }
@admin.patch("/criteria/{criterion_id}",dependencies=[Depends(csrf_guard)])
async def update_criterion(criterion_id:str,x:CriterionIn,user=Depends(require("manage_evaluation"))):
 r=await criteria.update_one({"id":criterion_id},{"$set":{**x.model_dump(),"updated_at":datetime.now(timezone.utc)}})
 if not r.matched_count: raise HTTPException(404,"Criterion not found.")
 return {"success":True}
@admin.get("/leaderboard")
async def leaderboard(search:Optional[str]=None,domain:Optional[str]=None,track_id:Optional[str]=None,user=Depends(require("manage_evaluation"))):
 cs=[c async for c in criteria.find({"is_active":True})]; max_score=sum(c.get("max_marks",0) for c in cs)
 track=await tracks.find_one({"track_id":track_id}) if track_id else None
 if track_id and not track: raise HTTPException(404,"Track not found.")
 grouped={}
 async for ev in evaluations.find({"status":"submitted"}):
  grouped.setdefault(ev["registration_id"],[]).append(float(ev.get("total_score") or 0))
 regs={r["registration_id"]:r async for r in registrations.find({"isDeleted":{"$ne":True},"registration_id":{"$in":list(grouped.keys())}})} if grouped else {}
 q=(search or "").strip().casefold(); domain_q=(domain or "").strip().casefold(); rows=[]
 for rid,scores in grouped.items():
  reg=regs.get(rid)
  if not reg: continue
  if track and not match(reg,track): continue
  team=public_team(reg)
  if domain_q and team["domain"].strip().casefold()!=domain_q: continue
  if q:
   hay=" ".join([team["reference_id"],team["team_name"],team["ps_id"],team["theme"],team["domain"]]).casefold()
   if q not in hay: continue
  rows.append({**team,"score":round(sum(scores)/len(scores),2),"max_score":max_score,"judges_count":len(scores)})
 rows.sort(key=lambda r:(-r["score"],r["team_name"].casefold())); 
 for i,row in enumerate(rows,1): row["rank"]=i
 return {"data":rows}
@judge.get("/tracks")
@coordinator.get("/tracks")
async def public_tracks(): return {"data":[{"track_id":x["track_id"],"name":x["name"]} for x in await active_tracks()]}
async def login(x,coll,cookie,response):
 d=await coll.find_one({"name":x.name.strip(),"track_id":x.track_id,"is_active":True})
 if not d or not bcrypt.checkpw(x.password.encode(),d["password_hash"].encode()): raise HTTPException(401,"Invalid credentials.")
 response.set_cookie(
    cookie,
    jwt.encode(
        {"sub": str(d["_id"]),
         "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
        secret(),
        algorithm="HS256"
    ),
    httponly=True,
    samesite="none",
    secure=True,
    path="/"
); return {"success":True}
@judge.post("/auth/login",dependencies=[Depends(csrf_guard)])
async def judge_login(x:LoginIn,response:Response): return await login(x,judges,"judge_session",response)
@coordinator.post("/auth/login",dependencies=[Depends(csrf_guard)])
async def coordinator_login(x:LoginIn,response:Response): return await login(x,coordinators,"coordinator_session",response)
@coordinator.get("/queue")
async def get_queue(coordinator_session:Optional[str]=Cookie(None)):
 d=await auth(coordinator_session,"coordinator",coordinators); t=await tracks.find_one({"track_id":d["track_id"],"is_active":True})
 if not t: raise HTTPException(403,"This track is inactive.")
 ids,l=await queue_for(t); completed=set(await evaluations.distinct("registration_id",{"track_id":t["track_id"],"status":"submitted"})); return {"track":t["name"],"team_ids":ids,"teams":[{"registration_id":i,"team_name":l[i].get("team",{}).get("teamName",""),"ps_id":l[i].get("team",{}).get("psId",""),"problem_statement":l[i].get("team",{}).get("psTitle",""),"theme":l[i].get("team",{}).get("theme",""),"domain":l[i].get("team",{}).get("category",""),"status":"Evaluated" if i in completed else "Not evaluated"} for i in ids]}
@coordinator.put("/queue",dependencies=[Depends(csrf_guard)])
async def put_queue(x:QueueIn,coordinator_session:Optional[str]=Cookie(None)):
 d=await auth(coordinator_session,"coordinator",coordinators); t=await tracks.find_one({"track_id":d["track_id"],"is_active":True})
 if not t: raise HTTPException(403,"This track is inactive.")
 ids,_=await queue_for(t)
 if set(x.team_ids)!=set(ids) or len(x.team_ids)!=len(ids): raise HTTPException(422,"Queue must contain this track's teams exactly once.")
 await queues.update_one({"track_id":t["track_id"]},{"$set":{"team_ids":x.team_ids,"updated_at":datetime.now(timezone.utc)}},upsert=True); return {"success":True}
@judge.get("/search-team")
async def search_team(reference_id:str=Query(...),judge_session:Optional[str]=Cookie(None)):
 d,t=await judge_context(judge_session)
 reg=await find_registration(reference_id)
 if not reg: raise HTTPException(404,"No team found for this reference ID.")
 if not match(reg,t): raise HTTPException(403,"This team does not belong to your assigned track.")
 ev=await evaluations.find_one({"judge_id":d["id"],"registration_id":reg["registration_id"]})
 return {"team":public_team(reg),"evaluation":evaluation_payload(ev),"criteria":await criteria_payload()}
@judge.post("/evaluations",dependencies=[Depends(csrf_guard)])
async def submit(x:EvalIn,judge_session:Optional[str]=Cookie(None)):
 d,t=await judge_context(judge_session)
 reg=await find_registration(x.registration_id)
 if not reg: raise HTTPException(404,"No team found for this reference ID.")
 if not match(reg,t): raise HTTPException(403,"This team does not belong to your assigned track.")
 total=await score_total(x.scores); now=datetime.now(timezone.utc)
 doc={"evaluation_id":"EVAL-"+uuid.uuid4().hex,"judge_id":d["id"],"judge_name":d["name"],"track_id":d["track_id"],"registration_id":reg["registration_id"],"reference_id":reg["registration_id"],"scores":x.scores,"total_score":total,"status":"submitted","submitted_at":now,"updated_at":now}
 try: await evaluations.insert_one(doc)
 except DuplicateKeyError: raise HTTPException(409,"Evaluation already exists. Update it instead.")
 return {"success":True,"evaluation_id":doc["evaluation_id"],"total":total}
@judge.patch("/evaluations/{evaluation_id}",dependencies=[Depends(csrf_guard)])
async def update_evaluation(evaluation_id:str,x:EvalIn,judge_session:Optional[str]=Cookie(None)):
 d,t=await judge_context(judge_session)
 ev=await evaluations.find_one({"evaluation_id":evaluation_id})
 if not ev: raise HTTPException(404,"Evaluation not found.")
 if ev.get("judge_id")!=d["id"]: raise HTTPException(403,"You can only modify your own evaluation.")
 if x.registration_id and x.registration_id!=ev["registration_id"]: raise HTTPException(422,"Registration ID does not match this evaluation.")
 reg=await find_registration(ev["registration_id"])
 if not reg or not match(reg,t): raise HTTPException(403,"This team does not belong to your assigned track.")
 total=await score_total(x.scores)
 await evaluations.update_one({"evaluation_id":evaluation_id,"judge_id":d["id"]},{"$set":{"scores":x.scores,"total_score":total,"status":"submitted","updated_at":datetime.now(timezone.utc)}})
 return {"success":True,"evaluation_id":evaluation_id,"total":total}
