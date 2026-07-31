import { queryOptions } from "@tanstack/react-query";
import type { Announcement, ProblemStatement, Theme } from "@/lib/sih-data";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url} (${res.status})`);
  return (await res.json()) as T;
}

export const themesQuery = queryOptions({
  queryKey: ["themes"],
  queryFn: () => getJson<{ themes: Theme[] }>("/api/themes").then((d) => d.themes),
  staleTime: 5 * 60 * 1000,
});

export const problemStatementsQuery = queryOptions({
  queryKey: ["problem-statements"],
  queryFn: () =>
    getJson<{ problemStatements: ProblemStatement[] }>("/api/problem-statements").then(
      (d) => d.problemStatements,
    ),
  staleTime: 5 * 60 * 1000,
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: () =>
    getJson<{ announcements: Announcement[] }>("/api/announcements").then((d) => d.announcements),
  staleTime: 5 * 60 * 1000,
});

export type RegistrationPayload = Record<string, unknown>;

export async function submitRegistration(payload: RegistrationPayload) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Registration request failed");
  return (await res.json()) as { ok: boolean; reference: string };
}
