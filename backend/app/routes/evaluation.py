"""Mongo-backed evaluation configuration and restricted evaluation sessions."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import os, uuid, bcrypt, jwt
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Cookie, Response
from pydantic import BaseModel, Field
from app.config import ADMIN_JWT_SECRET
from app.mongodb import evaluation_track_collection as tracks, judge_collection as judges, track_coordinator_collection as coordinators, presentation_queue_collection as queues, evaluation_criteria_collection as criteria, evaluation_collection as evaluations, registration_collection as registrations
from app.routes.admin import require, csrf_guard

admin=APIRouter(prefix="/admin/evaluation",tags=["Evaluation"]); judge=APIRouter(prefix="/judge",tags=["Judge Evaluation"]); coordinator=APIRouter(prefix="/track",tags=["Track Queue"])
class TrackIn(BaseModel): name:str=Field(min_length=2); code:str=Field(min_length=1); theme:str; domain:str; judges_required:int=Field(ge=1); is_active:bool=True
class AccountIn(BaseModel): name:str=Field(min_length=2); track_id:str; password:str=Field(min_length=8); is_active:bool=True
class LoginIn(BaseModel): name:str; track_id:str; password:str
class QueueIn(BaseModel): team_ids:list[str]
class EvalIn(BaseModel): registration_id:str; scores:dict[str,float]
class CriterionIn(BaseModel): name:str=Field(min_length=2); description:str=""; max_marks:int=Field(ge=1); order:int=0; is_active:bool=True
def secret():
 if not ADMIN_JWT_SECRET or len(ADMIN_JWT_SECRET)<32: raise HTTPException(503,"Authentication is not configured.")
 return ADMIN_JWT_SECRET
async def active_tracks(): return [x async for x in tracks.find({"is_active":True})]
def match(reg,track):
 t=reg.get("team",{}); return t.get("theme","").strip().casefold()==track["theme"].strip().casefold() and t.get("category","").strip().casefold()==track["domain"].strip().casefold()
async def teams_for(track): return [r async for r in registrations.find({"isDeleted":{"$ne":True}}) if match(r,track)]
async def queue_for(track):
 teamdocs=await teams_for(track); ids=[x["registration_id"] for x in teamdocs]; saved=await queues.find_one({"track_id":track["track_id"]}); ordered=[x for x in (saved or {}).get("team_ids",[]) if x in ids]+[x for x in ids if x not in (saved or {}).get("team_ids",[])]; lookup={x["registration_id"]:x for x in teamdocs}; return ordered,lookup
async def auth(cookie,name,collection):
 if not cookie: raise HTTPException(401,"Authentication required.")
 try: p=jwt.decode(cookie,secret(),algorithms=["HS256"]); doc=await collection.find_one({"_id":ObjectId(p["sub"]),"is_active":True})
 except Exception: doc=None
 if not doc: raise HTTPException(401,"Session is invalid.")
 return doc
@admin.get("/overview")
async def overview(user=Depends(require("manage_evaluation"))):
 ts=await active_tracks(); js=await judges.count_documents({"is_active":True}); teams=sum([len(await teams_for(t)) for t in ts]); expected=sum([len(await teams_for(t))*t["judges_required"] for t in ts]); done=await evaluations.count_documents({"status":"submitted"}); return {"tracks":len(ts),"judges":js,"teams_assigned":teams,"evaluations_completed":done,"evaluations_expected":expected,"progress_percentage":round(done/expected*100,1) if expected else 0}
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
async def account_list(coll): return [{**x,"_id":str(x["_id"])} async for x in coll.find().sort("created_at",-1)]
async def make_account(x,coll,prefix,role):
 if not await tracks.find_one({"track_id":x.track_id,"is_active":True}): raise HTTPException(404,"Track not found.")
 if await coll.find_one({"name":x.name.strip(),"track_id":x.track_id}): raise HTTPException(409,"Name already exists in this track.")
 now=datetime.now(timezone.utc); doc={"id":prefix+uuid.uuid4().hex[:8].upper(),"name":x.name.strip(),"track_id":x.track_id,"role":role,"password_hash":bcrypt.hashpw(x.password.encode(),bcrypt.gensalt()).decode(),"is_active":x.is_active,"created_at":now,"updated_at":now}; r=await coll.insert_one(doc); return {"id":str(r.inserted_id),f"{role}_id":doc["id"]}
@admin.get("/judges")
async def get_judges(user=Depends(require("manage_evaluation"))): return {"data":await account_list(judges)}
@admin.post("/judges",dependencies=[Depends(csrf_guard)])
async def create_judge(x:AccountIn,user=Depends(require("manage_evaluation"))): return await make_account(x,judges,"JUDGE-","judge")
@admin.get("/coordinators")
async def get_coordinators(user=Depends(require("manage_evaluation"))): return {"data":await account_list(coordinators)}
@admin.post("/coordinators",dependencies=[Depends(csrf_guard)])
async def create_coordinator(x:AccountIn,user=Depends(require("manage_evaluation"))): return await make_account(x,coordinators,"COORD-","track_student_coordinator")
@admin.get("/criteria")
async def get_criteria(user=Depends(require("manage_evaluation"))): return {"data":[{**c,"_id":str(c["_id"])} async for c in criteria.find().sort("order",1)]}
@admin.post("/criteria",dependencies=[Depends(csrf_guard)])
async def create_criterion(x:CriterionIn,user=Depends(require("manage_evaluation"))):
 d=x.model_dump();d.update({"id":"CRIT-"+uuid.uuid4().hex[:8].upper(),"created_at":datetime.now(timezone.utc)});r=await criteria.insert_one(d);return {"id":str(r.inserted_id)}
@judge.get("/tracks")
@coordinator.get("/tracks")
async def public_tracks(): return {"data":[{"track_id":x["track_id"],"name":x["name"]} for x in await active_tracks()]}
async def login(x,coll,cookie,response):
 d=await coll.find_one({"name":x.name.strip(),"track_id":x.track_id,"is_active":True})
 if not d or not bcrypt.checkpw(x.password.encode(),d["password_hash"].encode()): raise HTTPException(401,"Invalid credentials.")
 response.set_cookie(cookie,jwt.encode({"sub":str(d["_id"]),"exp":datetime.now(timezone.utc)+timedelta(hours=8)},secret(),algorithm="HS256"),httponly=True,samesite="lax",secure=os.getenv("ENVIRONMENT")=="production",path="/"); return {"success":True}
@judge.post("/auth/login",dependencies=[Depends(csrf_guard)])
async def judge_login(x:LoginIn,response:Response): return await login(x,judges,"judge_session",response)
@coordinator.post("/auth/login",dependencies=[Depends(csrf_guard)])
async def coordinator_login(x:LoginIn,response:Response): return await login(x,coordinators,"coordinator_session",response)
@coordinator.get("/queue")
async def get_queue(coordinator_session:Optional[str]=Cookie(None)):
 d=await auth(coordinator_session,"coordinator",coordinators); t=await tracks.find_one({"track_id":d["track_id"]}); ids,l=await queue_for(t); return {"track":t["name"],"team_ids":ids,"teams":[{"registration_id":i,"team_name":l[i].get("team",{}).get("teamName",""),"ps_id":l[i].get("team",{}).get("psId",""),"problem_statement":l[i].get("team",{}).get("psTitle",""),"theme":l[i].get("team",{}).get("theme",""),"domain":l[i].get("team",{}).get("category","")} for i in ids]}
@coordinator.put("/queue",dependencies=[Depends(csrf_guard)])
async def put_queue(x:QueueIn,coordinator_session:Optional[str]=Cookie(None)):
 d=await auth(coordinator_session,"coordinator",coordinators); t=await tracks.find_one({"track_id":d["track_id"]}); ids,_=await queue_for(t)
 if set(x.team_ids)!=set(ids) or len(x.team_ids)!=len(ids): raise HTTPException(422,"Queue must contain this track's teams exactly once.")
 await queues.update_one({"track_id":t["track_id"]},{"$set":{"team_ids":x.team_ids,"updated_at":datetime.now(timezone.utc)}},upsert=True); return {"success":True}
@judge.get("/current-team")
async def current_team(judge_session:Optional[str]=Cookie(None)):
 d=await auth(judge_session,"judge",judges); t=await tracks.find_one({"track_id":d["track_id"]}); ids,l=await queue_for(t); done=set(await evaluations.distinct("registration_id",{"judge_id":d["id"]})); team=next((i for i in ids if i not in done),None)
 if not team:return {"team":None,"criteria":[]}
 return {"team":{"registration_id":team,"team_name":l[team].get("team",{}).get("teamName",""),"ps_id":l[team].get("team",{}).get("psId",""),"problem_statement":l[team].get("team",{}).get("psTitle",""),"theme":l[team].get("team",{}).get("theme",""),"domain":l[team].get("team",{}).get("category","")},"criteria":[{"id":c["id"],"name":c["name"],"max_marks":c["max_marks"],"description":c.get("description","")} async for c in criteria.find({"is_active":True}).sort("order",1)]}
@judge.post("/evaluations",dependencies=[Depends(csrf_guard)])
async def submit(x:EvalIn,judge_session:Optional[str]=Cookie(None)):
 d=await auth(judge_session,"judge",judges); nowteam=await current_team(judge_session)
 if not nowteam["team"] or nowteam["team"]["registration_id"]!=x.registration_id: raise HTTPException(409,"Only the current queued team can be evaluated.")
 cs={c["id"]:c async for c in criteria.find({"is_active":True})}
 if set(x.scores)!=set(cs):raise HTTPException(422,"All criteria must be scored.")
 if any(v<0 or v>cs[k]["max_marks"] for k,v in x.scores.items()):raise HTTPException(422,"Invalid score.")
 doc={"evaluation_id":"EVAL-"+uuid.uuid4().hex,"judge_id":d["id"],"judge_name":d["name"],"track_id":d["track_id"],"registration_id":x.registration_id,"scores":x.scores,"total_score":sum(x.scores.values()),"status":"submitted","submitted_at":datetime.now(timezone.utc)}
 try: await evaluations.insert_one(doc)
 except Exception: raise HTTPException(409,"Evaluation is already locked.")
 return {"success":True}
