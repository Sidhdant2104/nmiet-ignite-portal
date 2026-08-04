const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nmiet-sih-backend.onrender.com";

import { queryOptions } from "@tanstack/react-query";
import type { Announcement } from "@/lib/sih-data";

/** Theme shape returned by the SIH backend's GET /themes/ endpoint. */
export type Theme = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type ThemesResponse = {
  success: boolean;
  data: Array<Omit<Theme, "id" | "icon"> & { id?: string; _id?: string; icon?: string | null }>;
};

/** Backend problem statement shape from GET /problems/ */
export type ProblemStatement = {
  ps_number: string;
  title: string;
  organization: string;
  department: string | null;
  category: string;
  theme: string;
  description: string | null;
  submitted_ideas: number;
  deadline: string | null;
  source_url: string | null;
  is_active: boolean;
};

type ProblemStatementsResponse = {
  success: boolean;
  count: number;
  data: ProblemStatement[];
};



async function getJson<T>(url: string): Promise<T> {
  console.log("➡️ Fetching:", `${API_URL}${url}`);

  const res = await fetch(`${API_URL}${url}`);

  console.log("⬅️ Status:", res.status);

  if (!res.ok) {
    throw new Error(`Request failed: ${url} (${res.status})`);
  }

  return (await res.json()) as T;
}

export const themesQuery = queryOptions({
  queryKey: ["themes"],
  queryFn: () =>
    getJson<ThemesResponse>("/themes/").then((response) =>
      response.data.map(({ _id, id, icon, ...theme }) => ({
        ...theme,
        id: id ?? _id ?? theme.name,
        icon: icon ?? "",
      })),
    ),
  staleTime: 5 * 60 * 1000,
});

export const problemStatementsQuery = queryOptions({
  queryKey: ["problem-statements"],
  queryFn: () => getJson<ProblemStatementsResponse>("/problems/").then((d) => d.data),
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
  const res = await fetch(`${API_URL}/registrations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}
