const base = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type JudgeTeam = {
  registration_id: string;
  reference_id: string;
  team_name: string;
  ps_id: string;
  problem_statement: string;
  theme: string;
  domain: string;
};

export type JudgeCriterion = {
  id: string;
  name: string;
  max_marks: number;
  description: string;
};

export type JudgeEvaluationRecord = {
  id: string;
  evaluation_id: string;
  scores: Record<string, number>;
  total: number;
};

export type JudgeTeamSearch = {
  team: JudgeTeam;
  evaluation: JudgeEvaluationRecord | null;
  criteria: JudgeCriterion[];
};

async function req<T>(path: string, opt: RequestInit = {}) {
  const r = await fetch(base + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...opt.headers },
    ...opt,
  });
  if (!r.ok) {
    const b = await r.json().catch(() => ({}));
    const detail = b.detail;
    throw Error(typeof detail === "string" ? detail : "Request failed");
  }
  return r.status === 204 ? (undefined as T) : (r.json() as Promise<T>);
}

export const evaluationClient = {
  tracks: () => req<{ data: { track_id: string; name: string }[] }>("/judge/tracks"),
  judgeLogin: (name: string, track_id: string, password: string) =>
    req("/judge/auth/login", { method: "POST", body: JSON.stringify({ name, track_id, password }) }),
  searchTeam: (reference_id: string) =>
    req<JudgeTeamSearch>(`/judge/search-team?reference_id=${encodeURIComponent(reference_id)}`),
  submit: (registration_id: string, scores: Record<string, number>) =>
    req<{ success: true; evaluation_id: string; total: number }>("/judge/evaluations", {
      method: "POST",
      body: JSON.stringify({ registration_id, scores }),
    }),
  update: (evaluation_id: string, registration_id: string, scores: Record<string, number>) =>
    req<{ success: true; evaluation_id: string; total: number }>(`/judge/evaluations/${evaluation_id}`, {
      method: "PATCH",
      body: JSON.stringify({ registration_id, scores }),
    }),
  coordinatorLogin: (name: string, track_id: string, password: string) =>
    req("/track/auth/login", { method: "POST", body: JSON.stringify({ name, track_id, password }) }),
  queue: () =>
    req<{
      track: string;
      team_ids: string[];
      teams: {
        registration_id: string;
        team_name: string;
        ps_id: string;
        problem_statement: string;
        theme: string;
        domain: string;
      }[];
    }>("/track/queue"),
  saveQueue: (team_ids: string[]) => req("/track/queue", { method: "PUT", body: JSON.stringify({ team_ids }) }),
};
