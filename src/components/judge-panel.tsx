import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LogOut, Scale, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { evaluationClient as api, type JudgeMe } from "@/lib/evaluation-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function JudgePage({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const me = useQuery({ queryKey: ["judge", "me"], queryFn: api.me, retry: false });

  useEffect(() => {
    if (me.isError) nav({ to: "/judge/login", replace: true });
  }, [me.isError, nav]);

  if (me.isLoading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading judge workspace…</div>;
  }
  if (!me.data) return null;

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r bg-card p-5 lg:flex">
        <div className="flex items-center gap-3">
          <ShieldCheck className="rounded-xl bg-primary p-2 text-primary-foreground" size={40} />
          <div>
            <p className="font-display font-bold">NMIET SIH</p>
            <p className="text-xs text-muted-foreground">Judge workspace</p>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          <Link
            to="/judge/evaluation"
            className="flex items-center gap-3 rounded-xl bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <Scale size={18} />
            Evaluation
          </Link>
        </nav>
        <JudgeAccount me={me.data} />
      </aside>
      <main className="lg:pl-72">
        <header className="flex h-16 items-center justify-between border-b px-5 lg:hidden">
          <div>
            <p className="font-semibold">{me.data.name}</p>
            <p className="text-xs text-muted-foreground">
              {me.data.track_name} · {me.data.domain}
            </p>
          </div>
          <SignOut />
        </header>
        <div className="mx-auto max-w-3xl p-5 lg:p-9">{children}</div>
      </main>
    </div>
  );
}

function JudgeAccount({ me }: { me: JudgeMe }) {
  return (
    <div className="mt-auto rounded-2xl bg-muted p-3">
      <p className="truncate text-sm font-semibold">{me.name}</p>
      <p className="text-xs text-muted-foreground">{me.track_name}</p>
      <p className="text-xs text-muted-foreground">{me.domain}</p>
      <SignOut />
    </div>
  );
}

function SignOut() {
  const nav = useNavigate();
  return (
    <button
      className="mt-3 flex gap-2 text-xs font-semibold text-muted-foreground"
      onClick={async () => {
        try {
          await api.logout();
        } finally {
          nav({ to: "/judge/login" });
        }
      }}
    >
      <LogOut size={14} />
      Sign out
    </button>
  );
}

export function JudgeLoginPage() {
  const nav = useNavigate();
  const tracks = useQuery({ queryKey: ["public", "tracks"], queryFn: api.tracks });
  const [name, setName] = useState("");
  const [track, setTrack] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    api
      .me()
      .then(() => nav({ to: "/judge/evaluation" }))
      .catch(() => undefined);
  }, [nav]);

  const login = useMutation({
    mutationFn: () => api.judgeLogin(name, track, password),
    onSuccess: () => nav({ to: "/judge/evaluation" }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mesh-bg flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login.mutate();
        }}
        className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-lift"
      >
        <ShieldCheck className="mb-6 rounded-2xl bg-primary p-3 text-primary-foreground" size={52} />
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-primary">NMIET SIH 2026</p>
        <h1 className="mt-2 text-3xl font-bold">Judge sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Evaluate teams assigned to your track.</p>
        <Input className="mt-7" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <select
          className="mt-3 w-full rounded-xl border bg-background p-3"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          required
        >
          <option value="">Select track</option>
          {tracks.data?.data.map((item) => (
            <option value={item.track_id} key={item.track_id}>
              {item.name}
              {item.domain ? ` · ${item.domain}` : ""}
            </option>
          ))}
        </select>
        <Input
          className="mt-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <Button className="mt-5 w-full" disabled={!name || !track || password.length < 8 || login.isPending}>
          {login.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
