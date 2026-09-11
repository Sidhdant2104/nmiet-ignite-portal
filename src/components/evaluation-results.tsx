import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AdminPage } from "@/components/admin-panel";
import { evaluationApi, type LeaderboardRow, type TrackStat } from "@/lib/admin-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const wrap = (children: React.ReactNode) => <AdminPage page="evaluation">{children}</AdminPage>;
const FINALIST_OPTIONS = [30, 36, 50, 100];

type SortKey =
  | "overall_rank"
  | "team_name"
  | "track_name"
  | "raw_percentage"
  | "normalized_score"
  | "track_rank";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function fmt(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

function statusLabel(status: string | undefined) {
  if (status === "ok") return "Normalized";
  if (status === "zero_variance") return "Zero variance";
  if (status === "unreliable_small_sample") return "Small sample";
  if (status === "pending" || status === "no_evaluated_teams") return "Pending";
  return status || "—";
}

function sortRows(rows: LeaderboardRow[], key: SortKey, direction: "asc" | "desc") {
  const copy = [...rows];
  copy.sort((a, b) => {
    const left = a[key];
    const right = b[key];
    let comparison = 0;
    if (typeof left === "number" && typeof right === "number") comparison = left - right;
    else if (left == null && right == null) comparison = 0;
    else if (left == null) comparison = 1;
    else if (right == null) comparison = -1;
    else comparison = String(left).localeCompare(String(right), undefined, { sensitivity: "base" });
    return direction === "asc" ? comparison : -comparison;
  });
  return copy;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </section>
  );
}

function SortButton({
  label,
  active,
  direction,
  onClick,
}: {
  label: string;
  active: boolean;
  direction: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button type="button" className="inline-flex items-center gap-1 font-medium" onClick={onClick}>
      {label}
      {active ? <span className="text-xs">{direction === "asc" ? "↑" : "↓"}</span> : null}
    </button>
  );
}

export function Leaderboard() {
  const tracks = useQuery({ queryKey: ["eval", "tracks"], queryFn: evaluationApi.tracks });
  const stats = useQuery({
    queryKey: ["eval", "leaderboard-tracks"],
    queryFn: evaluationApi.trackStats,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trackId, setTrackId] = useState("");
  const [status, setStatus] = useState<"completed" | "pending" | "all">("completed");
  const [finalists, setFinalists] = useState(36);
  const [rankFilter, setRankFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("overall_rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(id);
  }, [search]);
  const q = useQuery({
    queryKey: ["eval", "leaderboard", debouncedSearch, trackId, status, finalists],
    queryFn: () => {
      const params: {
        search?: string;
        track_id?: string;
        status: "completed" | "pending" | "all";
        finalists: number;
      } = { status, finalists };
      if (debouncedSearch) params.search = debouncedSearch;
      if (trackId) params.track_id = trackId;
      return evaluationApi.leaderboard(params);
    },
  });
  const exportFile = useMutation({
    mutationFn: () => evaluationApi.exportResults(finalists),
    onSuccess: (blob) => {
      downloadBlob(blob, `sih-evaluation-results-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Excel export downloaded");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDirection(
        key === "team_name" || key === "track_name"
          ? "asc"
          : key === "overall_rank" || key === "track_rank"
            ? "asc"
            : "desc",
      );
    }
  };
  const rows = useMemo(() => {
    const data = q.data?.data || [];
    const rankLimit = Number(rankFilter);
    const filtered =
      rankLimit > 0
        ? data.filter((row) => row.overall_rank != null && row.overall_rank <= rankLimit)
        : data;
    return sortRows(filtered, sortKey, sortDirection);
  }, [q.data?.data, rankFilter, sortKey, sortDirection]);
  const summary = q.data?.summary || stats.data?.summary;
  if (q.isError) return wrap(<p>{q.error.message}</p>);
  return wrap(
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Evaluation Results</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Teams are ranked by track-normalized score so judges who mark strictly or generously can
            be compared fairly. Raw scores are preserved. Finalist badges are a view cutoff only —
            they do not change registration records.
          </p>
        </div>
        <Button disabled={exportFile.isPending} onClick={() => exportFile.mutate()}>
          {exportFile.isPending ? "Exporting…" : "Export Excel"}
        </Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracks" value={summary?.tracks ?? "—"} />
        <StatCard label="Total teams" value={summary?.total_teams ?? "—"} />
        <StatCard label="Evaluated" value={summary?.evaluated ?? "—"} />
        <StatCard label="Pending" value={summary?.pending ?? "—"} />
      </div>
      <section className="mt-6 grid gap-3 rounded-2xl border bg-card p-5 md:grid-cols-2 xl:grid-cols-5">
        <Input
          placeholder="Search team or registration ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-xl border bg-background px-3"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
        >
          <option value="">All tracks</option>
          {tracks.data?.data.map((track) => (
            <option key={track.track_id} value={track.track_id}>
              {track.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border bg-background px-3"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="completed">Evaluated</option>
          <option value="pending">Pending</option>
          <option value="all">All statuses</option>
        </select>
        <Input
          placeholder="Show ranks 1–N"
          value={rankFilter}
          onChange={(e) => setRankFilter(e.target.value)}
        />
        <select
          className="rounded-xl border bg-background px-3"
          value={finalists}
          onChange={(e) => setFinalists(Number(e.target.value))}
        >
          {FINALIST_OPTIONS.map((count) => (
            <option key={count} value={count}>
              Top {count} finalists
            </option>
          ))}
        </select>
      </section>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-4">
                <SortButton
                  label="Rank"
                  active={sortKey === "overall_rank"}
                  direction={sortDirection}
                  onClick={() => toggleSort("overall_rank")}
                />
              </th>
              <th className="p-4">
                <SortButton
                  label="Team"
                  active={sortKey === "team_name"}
                  direction={sortDirection}
                  onClick={() => toggleSort("team_name")}
                />
              </th>
              <th className="p-4">
                <SortButton
                  label="Track"
                  active={sortKey === "track_name"}
                  direction={sortDirection}
                  onClick={() => toggleSort("track_name")}
                />
              </th>
              <th className="p-4">
                <SortButton
                  label="Raw %"
                  active={sortKey === "raw_percentage"}
                  direction={sortDirection}
                  onClick={() => toggleSort("raw_percentage")}
                />
              </th>
              <th className="p-4">
                <SortButton
                  label="Normalized score"
                  active={sortKey === "normalized_score"}
                  direction={sortDirection}
                  onClick={() => toggleSort("normalized_score")}
                />
              </th>
              <th className="p-4">
                <SortButton
                  label="Track rank"
                  active={sortKey === "track_rank"}
                  direction={sortDirection}
                  onClick={() => toggleSort("track_rank")}
                />
              </th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={7}>
                  Loading leaderboard…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => (
                <tr
                  className="border-b last:border-0"
                  key={`${row.track_id}-${row.registration_id}`}
                >
                  <td className="p-4 font-bold">{row.overall_rank ?? "—"}</td>
                  <td className="p-4">
                    <Link
                      className="font-medium hover:underline"
                      to="/admin/evaluation/results/$registrationId"
                      params={{ registrationId: row.registration_id }}
                    >
                      {row.team_name || row.registration_id}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{row.registration_id}</p>
                  </td>
                  <td className="p-4">
                    <Link
                      className="hover:underline"
                      to="/admin/evaluation/leaderboard/$trackId"
                      params={{ trackId: row.track_id }}
                    >
                      {row.track_name}
                    </Link>
                  </td>
                  <td className="p-4">
                    {fmt(row.raw_percentage)}
                    <p className="text-xs text-muted-foreground">
                      {fmt(row.raw_score)} / {fmt(row.max_score, 0)}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold">{fmt(row.normalized_score)}</span>
                    {row.is_finalist ? (
                      <Badge className="ml-2 border-0 bg-emerald-500/15 text-emerald-700">
                        FINALIST
                      </Badge>
                    ) : null}
                  </td>
                  <td className="p-4">{row.track_rank ?? "—"}</td>
                  <td className="p-4">
                    <Badge
                      variant={row.evaluation_status === "completed" ? "secondary" : "outline"}
                    >
                      {row.evaluation_status === "completed"
                        ? statusLabel(row.normalization_status)
                        : "Pending"}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={7}>
                  No evaluations match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TrackStatsList stats={stats.data?.data || []} loading={stats.isLoading} />
    </>,
  );
}

function TrackStatsList({ stats, loading }: { stats: TrackStat[]; loading: boolean }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Tracks</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Open a track to inspect mean, standard deviation, and within-track ranks.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading track statistics…</p>
        ) : null}
        {stats.map((track) => (
          <Link
            key={track.track_id}
            to="/admin/evaluation/leaderboard/$trackId"
            params={{ trackId: track.track_id }}
            className="rounded-2xl border bg-card p-5 hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{track.track_name}</p>
                <p className="text-sm text-muted-foreground">
                  {track.judge_names.join(", ") || "No active judge listed"}
                </p>
              </div>
              <Badge variant="outline">{statusLabel(track.normalization_status)}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {track.evaluated_teams} evaluated · {track.pending_teams} pending · mean{" "}
              {fmt(track.mean_raw_score)} · σ {fmt(track.stddev)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrackLeaderboard({ trackId }: { trackId: string }) {
  const stats = useQuery({
    queryKey: ["eval", "leaderboard-tracks"],
    queryFn: evaluationApi.trackStats,
  });
  const q = useQuery({
    queryKey: ["eval", "leaderboard", trackId, "completed"],
    queryFn: () => evaluationApi.leaderboard({ track_id: trackId, status: "completed" }),
  });
  const track = stats.data?.data.find((item) => item.track_id === trackId);
  if (q.isError) return wrap(<p>{q.error.message}</p>);
  return wrap(
    <>
      <p className="text-sm">
        <Link to="/admin/evaluation/leaderboard" className="text-primary hover:underline">
          ← All results
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-bold">{track?.track_name || "Track"}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Judge: {track?.judge_names.join(", ") || "—"} · {track?.evaluated_teams ?? "—"} evaluated ·{" "}
        {track?.pending_teams ?? "—"} pending
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mean raw score" value={fmt(track?.mean_raw_score)} />
        <StatCard label="Standard deviation" value={fmt(track?.stddev)} />
        <StatCard label="Minimum" value={fmt(track?.minimum)} />
        <StatCard label="Maximum" value={fmt(track?.maximum)} />
      </div>
      <div className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-4">Track rank</th>
              <th className="p-4">Team</th>
              <th className="p-4">Raw score</th>
              <th className="p-4">Raw %</th>
              <th className="p-4">Normalized score</th>
            </tr>
          </thead>
          <tbody>
            {q.isLoading ? (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  Loading track results…
                </td>
              </tr>
            ) : q.data?.data.length ? (
              q.data.data.map((row) => (
                <tr className="border-b last:border-0" key={row.registration_id}>
                  <td className="p-4 font-bold">{row.track_rank}</td>
                  <td className="p-4">
                    <Link
                      className="font-medium hover:underline"
                      to="/admin/evaluation/results/$registrationId"
                      params={{ registrationId: row.registration_id }}
                    >
                      {row.team_name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{row.registration_id}</p>
                  </td>
                  <td className="p-4">
                    {fmt(row.raw_score)} / {fmt(row.max_score, 0)}
                  </td>
                  <td className="p-4">{fmt(row.raw_percentage)}</td>
                  <td className="p-4 text-lg font-bold">{fmt(row.normalized_score)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  No completed evaluations in this track.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>,
  );
}

export function TeamEvaluationResult({ registrationId }: { registrationId: string }) {
  const [finalists, setFinalists] = useState(36);
  const q = useQuery({
    queryKey: ["eval", "result", registrationId, finalists],
    queryFn: () => evaluationApi.teamResult(registrationId, finalists),
  });
  if (q.isLoading) return wrap(<p>Loading result…</p>);
  if (q.isError) return wrap(<p>{q.error.message}</p>);
  if (!q.data) return wrap(<p>Loading result…</p>);
  const result = q.data;
  return wrap(
    <>
      <p className="text-sm">
        <Link to="/admin/evaluation/leaderboard" className="text-primary hover:underline">
          ← All results
        </Link>
        {result.track_id ? (
          <>
            {" · "}
            <Link
              className="text-primary hover:underline"
              to="/admin/evaluation/leaderboard/$trackId"
              params={{ trackId: result.track_id }}
            >
              {result.track_name}
            </Link>
          </>
        ) : null}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{result.team_name}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{result.registration_id}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {result.problem_statement} · {result.theme} · {result.domain}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Track {result.track_name} · Judge {result.judge_name || result.judge_id}
          </p>
        </div>
        <select
          className="rounded-xl border bg-background px-3 py-2"
          value={finalists}
          onChange={(e) => setFinalists(Number(e.target.value))}
        >
          {FINALIST_OPTIONS.map((count) => (
            <option key={count} value={count}>
              Top {count} finalists
            </option>
          ))}
        </select>
      </div>
      {result.is_finalist ? (
        <Badge className="mt-4 border-0 bg-emerald-500/15 text-emerald-700">FINALIST</Badge>
      ) : null}
      <section className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="p-4">Criterion</th>
              <th className="p-4">Score / Max</th>
            </tr>
          </thead>
          <tbody>
            {result.criteria.map((criterion) => (
              <tr className="border-b last:border-0" key={criterion.criterion_id}>
                <td className="p-4">
                  <p className="font-medium">{criterion.name}</p>
                  {criterion.description ? (
                    <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  ) : null}
                </td>
                <td className="p-4 font-semibold">
                  {fmt(criterion.score, 1)} / {criterion.max_marks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Raw score"
          value={`${fmt(result.raw_score)} / ${fmt(result.max_score, 0)}`}
        />
        <StatCard label="Raw percentage" value={fmt(result.raw_percentage)} />
        <StatCard label="Track average" value={fmt(result.track_mean)} />
        <StatCard label="Track standard deviation" value={fmt(result.track_stddev)} />
        <StatCard label="Normalized score" value={fmt(result.normalized_score)} />
        <StatCard label="Track rank" value={result.track_rank ?? "—"} />
        <StatCard label="Overall rank" value={result.overall_rank ?? "—"} />
        <StatCard label="Normalization" value={statusLabel(result.normalization_status)} />
      </div>
      <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
        {result.normalization_explanation}
      </p>
    </>,
  );
}
