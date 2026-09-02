import { Link } from "@tanstack/react-router"; import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query"; import { useEffect, useState } from "react"; import { AdminPage } from "@/components/admin-panel"; import { evaluationApi,type Criterion,type EvaluationAccount,type EvaluationTrack } from "@/lib/admin-api"; import { Button } from "@/components/ui/button"; import { Input } from "@/components/ui/input"; import { toast } from "sonner";
const wrap=(children:React.ReactNode)=><AdminPage page="dashboard">{children}</AdminPage>;
export function EvaluationOverview(){const q=useQuery({queryKey:["eval","overview"],queryFn:evaluationApi.overview});if(q.isLoading)return wrap(<p>Loading evaluation…</p>);if(q.isError)return wrap(<p>{q.error.message}</p>);const d=q.data;return wrap(<><h1 className="text-3xl font-bold">Evaluation</h1><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[["Tracks",d.tracks],["Judges",d.judges],["Coordinators",d.coordinators],["Teams assigned",d.teams_assigned],["Evaluations",`${d.evaluations_completed} / ${d.evaluations_expected}`]].map(([a,b])=><section key={String(a)} className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">{a}</p><p className="mt-2 text-2xl font-bold">{b}</p></section>)}</div><nav className="mt-8 flex flex-wrap gap-2">{[["Tracks","/admin/evaluation/tracks"],["Judges","/admin/evaluation/judges"],["Coordinators","/admin/evaluation/coordinators"],["Criteria","/admin/evaluation/criteria"],["Leaderboard","/admin/evaluation/leaderboard"]].map(([a,to])=><Link key={a} to={to as "/admin/evaluation/tracks"}><Button variant="outline">{a}</Button></Link>)}</nav></>)}
function TrackForm({initial,onSave}:{initial?:EvaluationTrack;onSave:()=>void}){const [x,setX]=useState({name:initial?.name||"",code:initial?.code||"",theme:initial?.theme||"",domain:initial?.domain||"",judges_required:initial?.judges_required||1,is_active:initial?.is_active??true});const m=useMutation({mutationFn:()=>initial?evaluationApi.updateTrack(initial.track_id,x):evaluationApi.createTrack(x),onSuccess:()=>{toast.success(initial?"Track updated":"Track created");onSave()},onError:(e:Error)=>toast.error(e.message)});return <div className="grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-3">{([['name','Track name'],['code','Track code'],['theme','Theme'],['domain','Domain']] as const).map(([k,p])=><Input key={k} placeholder={p} value={x[k]} onChange={e=>setX({...x,[k]:e.target.value})}/>) }<Input type="number" min={1} value={x.judges_required} onChange={e=>setX({...x,judges_required:Number(e.target.value)})}/><p className="md:col-span-3 text-sm text-muted-foreground">Teams are matched to this track by domain. Judges assigned here can only evaluate teams in that domain.</p><Button disabled={m.isPending||!x.name||!x.code||!x.theme||!x.domain} onClick={()=>m.mutate()}>{initial?"Save changes":"Create track"}</Button></div>}
export function Tracks(){const c=useQueryClient(),q=useQuery({queryKey:["eval","tracks"],queryFn:evaluationApi.tracks}),[edit,setEdit]=useState<EvaluationTrack>();if(q.isLoading)return wrap(<p>Loading tracks…</p>);return wrap(<><h1 className="text-3xl font-bold">Tracks</h1><div className="mt-6"><TrackForm initial={edit} onSave={()=>{setEdit(undefined);c.invalidateQueries({queryKey:["eval"]})}}/></div><div className="mt-6 space-y-3">{q.data?.data.map(t=><article className="rounded-2xl border bg-card p-5" key={t.track_id}><div className="flex justify-between gap-3"><div><b>{t.name}</b><p className="text-sm text-muted-foreground">{t.code} · {t.theme} · {t.domain} · {t.team_count} teams · {t.judges_required} judges</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setEdit(t)}>Edit</Button><Button size="sm" variant="destructive" onClick={()=>evaluationApi.deactivateTrack(t.track_id).then(()=>c.invalidateQueries({queryKey:["eval"]})).catch((e:Error)=>toast.error(e.message))}>Deactivate</Button></div></div></article>)}</div></>)}
function Accounts({kind}:{kind:"judges"|"coordinators"}){const c=useQueryClient(),tracks=useQuery({queryKey:["eval","tracks"],queryFn:evaluationApi.tracks}),q=useQuery({queryKey:["eval",kind],queryFn:kind==="judges"?evaluationApi.judges:evaluationApi.coordinators}),[name,setName]=useState(""),[track,setTrack]=useState(""),[password,setPassword]=useState("");const m=useMutation({mutationFn:()=>kind==="judges"?evaluationApi.createJudge({name,track_id:track,password}):evaluationApi.createCoordinator({name,track_id:track,password}),onSuccess:()=>{setName("");setPassword("");toast.success(kind==="judges"?"Judge created":"Coordinator created");c.invalidateQueries({queryKey:["eval",kind]})},onError:(e:Error)=>toast.error(e.message)});const toggle=(x:EvaluationAccount)=>{const call=kind==="judges"?evaluationApi.updateJudge:evaluationApi.updateCoordinator;call(x.id,{is_active:!x.is_active}).then(()=>c.invalidateQueries({queryKey:["eval",kind]})).catch((e:Error)=>toast.error(e.message))};return wrap(<><h1 className="text-3xl font-bold">{kind==="judges"?"Judges":"Track coordinators"}</h1><section className="mt-6 grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-4"><Input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/><select className="rounded-xl border bg-background px-3" value={track} onChange={e=>setTrack(e.target.value)}><option value="">Select track</option>{tracks.data?.data.filter(t=>t.is_active).map(t=><option key={t.track_id} value={t.track_id}>{t.name}</option>)}</select><Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><Button disabled={!name||!track||password.length<8||m.isPending} onClick={()=>m.mutate()}>Create</Button></section><div className="mt-6 space-y-2">{q.data?.data.map(x=><div key={x.id} className="flex justify-between rounded-xl border bg-card p-4"><div><b>{x.name}</b><span className="ml-3 text-sm text-muted-foreground">{tracks.data?.data.find(t=>t.track_id===x.track_id)?.name||x.track_id}</span></div><Button size="sm" variant={x.is_active?"destructive":"outline"} onClick={()=>toggle(x)}>{x.is_active?"Deactivate":"Activate"}</Button></div>)}</div></>)} export const Judges=()=> <Accounts kind="judges"/>; export const Coordinators=()=> <Accounts kind="coordinators"/>;
export function Criteria(){const c=useQueryClient(),q=useQuery({queryKey:["eval","criteria"],queryFn:evaluationApi.criteria}),[name,setName]=useState(""),[description,setDescription]=useState(""),[max,setMax]=useState(10),[order,setOrder]=useState(0),m=useMutation({mutationFn:()=>evaluationApi.createCriterion({name,description,max_marks:max,order,is_active:true}),onSuccess:()=>{setName("");setDescription("");setOrder((q.data?.data.length||0)+1);c.invalidateQueries({queryKey:["eval","criteria"]})},onError:(e:Error)=>toast.error(e.message)}),update=(x:Criterion,change:Partial<Criterion>)=>evaluationApi.updateCriterion(x.id,{...x,...change}).then(()=>c.invalidateQueries({queryKey:["eval","criteria"]})).catch((e:Error)=>toast.error(e.message));return wrap(<><h1 className="text-3xl font-bold">Evaluation criteria</h1><section className="mt-6 grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-5"><Input placeholder="Criterion name" value={name} onChange={e=>setName(e.target.value)}/><Input placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)}/><Input className="w-24" type="number" min={1} value={max} onChange={e=>setMax(Number(e.target.value))}/><Input className="w-24" type="number" min={0} value={order} onChange={e=>setOrder(Number(e.target.value))}/><Button disabled={!name||max<1||order<0||m.isPending} onClick={()=>m.mutate()}>Add criterion</Button></section><div className="mt-6 space-y-2">{q.data?.data.map(x=><div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4" key={x.id}><div><b>{x.order + 1}. {x.name}</b><span className="ml-2 text-muted-foreground">/ {x.max_marks}</span>{x.description&&<p className="text-sm text-muted-foreground">{x.description}</p>}</div><Button size="sm" variant={x.is_active?"destructive":"outline"} onClick={()=>update(x,{is_active:!x.is_active})}>{x.is_active?"Deactivate":"Activate"}</Button></div>)}</div></>)}
export function Leaderboard(){
  const tracks=useQuery({queryKey:["eval","tracks"],queryFn:evaluationApi.tracks});
  const [search,setSearch]=useState("");
  const [debouncedSearch,setDebouncedSearch]=useState("");
  const [domain,setDomain]=useState("");
  const [trackId,setTrackId]=useState("");
  useEffect(()=>{const id=window.setTimeout(()=>setDebouncedSearch(search),300);return ()=>window.clearTimeout(id)},[search]);
  const q=useQuery({queryKey:["eval","leaderboard",debouncedSearch,domain,trackId],queryFn:()=>evaluationApi.leaderboard({search:debouncedSearch||undefined,domain:domain||undefined,track_id:trackId||undefined})});
  const domains=[...new Set((tracks.data?.data||[]).map(t=>t.domain).filter(Boolean))];
  if(q.isError)return wrap(<p>{q.error.message}</p>);
  return wrap(<>
    <h1 className="text-3xl font-bold">Leaderboard</h1>
    <section className="mt-6 grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-3">
      <Input placeholder="Search team or reference ID" value={search} onChange={e=>setSearch(e.target.value)}/>
      <select className="rounded-xl border bg-background px-3" value={domain} onChange={e=>setDomain(e.target.value)}>
        <option value="">All domains</option>
        {domains.map(d=><option key={d} value={d}>{d}</option>)}
      </select>
      <select className="rounded-xl border bg-background px-3" value={trackId} onChange={e=>setTrackId(e.target.value)}>
        <option value="">All tracks</option>
        {tracks.data?.data.map(t=><option key={t.track_id} value={t.track_id}>{t.name}</option>)}
      </select>
    </section>
    <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-muted-foreground">
          <tr>
            <th className="p-4">Rank</th>
            <th className="p-4">Team</th>
            <th className="p-4">Reference ID</th>
            <th className="p-4">Domain</th>
            <th className="p-4">Score</th>
          </tr>
        </thead>
        <tbody>
          {q.isLoading ? <tr><td className="p-4 text-muted-foreground" colSpan={5}>Loading leaderboard…</td></tr> : q.data?.data.length ? q.data.data.map(row=>(
            <tr className="border-b last:border-0" key={row.registration_id}>
              <td className="p-4 font-bold">{row.rank}</td>
              <td className="p-4">{row.team_name}</td>
              <td className="p-4 font-mono">{row.reference_id}</td>
              <td className="p-4">{row.domain}</td>
              <td className="p-4">{row.score} / {row.max_score}</td>
            </tr>
          )) : <tr><td className="p-4 text-muted-foreground" colSpan={5}>No evaluations yet.</td></tr>}
        </tbody>
      </table>
    </div>
  </>);
}
