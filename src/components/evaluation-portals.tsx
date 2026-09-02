import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query"; import {useNavigate} from "@tanstack/react-router"; import {useState,useEffect} from "react"; import {Button} from "@/components/ui/button"; import {Input} from "@/components/ui/input"; import {evaluationClient as api} from "@/lib/evaluation-client"; import {toast} from "sonner";
export function Login({role}:{role:"judge"|"coordinator"}){const nav=useNavigate(),tracks=useQuery({queryKey:["public","tracks"],queryFn:api.tracks}),[name,setName]=useState(""),[track,setTrack]=useState(""),[password,setPassword]=useState("");const m=useMutation({mutationFn:()=>role==="judge"?api.judgeLogin(name,track,password):api.coordinatorLogin(name,track,password),onSuccess:()=>nav({to:role==="judge"?"/judge/evaluation":"/track/queue"}),onError:(e:Error)=>toast.error(e.message)});return <main className="mesh-bg flex min-h-dvh items-center justify-center p-4"><form onSubmit={e=>{e.preventDefault();m.mutate()}} className="w-full max-w-md rounded-3xl border bg-card p-8"><h1 className="text-3xl font-bold">{role==="judge"?"Judge":"Track coordinator"} sign in</h1><Input className="mt-6" placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/><select className="mt-3 w-full rounded-xl border bg-background p-3" value={track} onChange={e=>setTrack(e.target.value)}><option value="">Select track</option>{tracks.data?.data.map(t=><option value={t.track_id} key={t.track_id}>{t.name}</option>)}</select><Input className="mt-3" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/><Button className="mt-5 w-full" disabled={!name||!track||password.length<8||m.isPending}>Sign in</Button></form></main>}
function scoreValue(raw: string, max: number) {
  if (raw.trim() === "") return 0;
  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, value));
}

export function JudgeEvaluation() {
  const [query, setQuery] = useState("");
  const [reference, setReference] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(true);
  const team = useQuery({
    queryKey: ["judge", "team", reference],
    queryFn: () => api.searchTeam(reference),
    enabled: Boolean(reference),
    retry: false,
  });

  useEffect(() => {
    if (!team.data) return;
    const next: Record<string, number> = {};
    team.data.criteria.forEach((criterion) => {
      next[criterion.id] = team.data.evaluation?.scores?.[criterion.id] ?? 0;
    });
    setScores(next);
    setSaved(Boolean(team.data.evaluation));
    setEditing(!team.data.evaluation);
  }, [team.data]);

  const save = useMutation({
    mutationFn: () => {
      const registrationId = team.data!.team.registration_id;
      const evaluationId = team.data?.evaluation?.id || team.data?.evaluation?.evaluation_id;
      return evaluationId
        ? api.update(evaluationId, registrationId, scores)
        : api.submit(registrationId, scores);
    },
    onSuccess: async () => {
      toast.success(team.data?.evaluation ? "Evaluation updated." : "Evaluation saved.");
      setSaved(true);
      setEditing(false);
      await team.refetch();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const search = (value = query) => {
    const next = value.trim();
    if (!next) return toast.error("Enter a team reference ID.");
    setQuery(next);
    setSaved(false);
    setEditing(true);
    setReference(next);
  };

  const resetSearch = () => {
    setQuery("");
    setReference("");
    setScores({});
    setSaved(false);
    setEditing(true);
  };

  const t = team.data?.team;
  const criteria = team.data?.criteria || [];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxTotal = criteria.reduce((a, c) => a + c.max_marks, 0);
  const invalid = criteria.some((c) => {
    const value = scores[c.id];
    return value == null || !Number.isFinite(value) || value < 0 || value > c.max_marks;
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">Judge dashboard</h1>
      <section className="mt-5 rounded-2xl border bg-card p-5">
        <h2 className="text-xl font-bold">Search team by reference ID</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="SIH2026-0127"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
          />
          <Button disabled={team.isFetching} onClick={search}>
            {team.isFetching ? "Searching…" : "Search team"}
          </Button>
        </div>
      </section>
      {team.isError && <p className="mt-4 text-sm text-destructive">{team.error.message}</p>}
      {t && (
        <>
          <section className="mt-5 grid gap-2 rounded-2xl border bg-card p-5">
            <h2 className="text-xl font-bold">Team details</h2>
            <b>{t.reference_id} · {t.team_name}</b>
            <p>PS ID: {t.ps_id}</p>
            <p>Problem statement: {t.problem_statement}</p>
            <p>{t.theme} · {t.domain}</p>
          </section>
          {saved && !editing ? (
            <section className="mt-5 rounded-2xl border bg-card p-5">
              <p className="font-bold">✓ Evaluation saved</p>
              {criteria.map((x) => (
                <p key={x.id} className="mt-2 text-sm">{x.name}: {scores[x.id] ?? 0} / {x.max_marks}</p>
              ))}
              <p className="mt-2">Total score: {total} / {maxTotal}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetSearch}>← Back</Button>
                <Button onClick={() => setEditing(true)}>Edit evaluation</Button>
              </div>
              <div className="mt-5 border-t pt-5">
                <p className="text-sm font-medium">Search another team</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Reference ID"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                  />
                  <Button onClick={() => search()}>Search</Button>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-5 rounded-2xl border bg-card p-5">
              <h2 className="text-xl font-bold">{team.data?.evaluation ? "Edit evaluation" : "Evaluation"}</h2>
              {criteria.map((x) => (
                <label className="mt-4 flex items-center justify-between gap-4" key={x.id}>
                  <span>
                    <span className="font-medium">{x.name}</span>
                    {x.description && <span className="block text-sm text-muted-foreground">{x.description}</span>}
                  </span>
                  <span className="flex items-center gap-2">
                    <Input
                      className="w-24"
                      type="number"
                      min={0}
                      max={x.max_marks}
                      value={scores[x.id] ?? 0}
                      onChange={(e) => setScores({ ...scores, [x.id]: scoreValue(e.target.value, x.max_marks) })}
                    />
                    / {x.max_marks}
                  </span>
                </label>
              ))}
              <p className="mt-5 font-bold">Total: {total} / {maxTotal}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline" onClick={resetSearch}>← Back</Button>
                <Button disabled={save.isPending || invalid || !criteria.length} onClick={() => save.mutate()}>
                  {team.data?.evaluation ? "Update evaluation" : "Submit evaluation"}
                </Button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
export function Queue(){const c=useQueryClient(),q=useQuery({queryKey:["queue"],queryFn:api.queue,refetchInterval:4000}),m=useMutation({mutationFn:(ids:string[])=>api.saveQueue(ids),onSuccess:()=>c.invalidateQueries({queryKey:["queue"]}),onError:(e:Error)=>toast.error(e.message)});if(q.isLoading)return <p className="p-10">Loading queue…</p>;if(q.isError)return <p className="p-10">{q.error.message}</p>;const move=(i:number,d:number)=>{const ids=[...q.data!.team_ids];[ids[i],ids[i+d]]=[ids[i+d],ids[i]];m.mutate(ids)};return <main className="mx-auto max-w-4xl p-6"><h1 className="text-3xl font-bold">{q.data?.track} queue</h1><div className="mt-6 space-y-3">{q.data?.teams.map((t,i)=><article className="rounded-2xl border bg-card p-4" key={t.registration_id}><div className="flex justify-between gap-4"><div><b>{i+1}. {t.registration_id} · {t.team_name}</b><p className="text-sm">{t.problem_statement} · {t.ps_id} · {t.theme} · {t.domain}</p></div><div className="flex gap-2"><Button size="sm" disabled={i===0||m.isPending} onClick={()=>move(i,-1)}>Up</Button><Button size="sm" disabled={i===q.data!.teams.length-1||m.isPending} onClick={()=>move(i,1)}>Down</Button></div></div></article>)}</div></main>}
