const API_URL = import.meta.env.VITE_API_URL || "https://nmiet-sih-backend.onrender.com";
const ADMIN_TOKEN_STORAGE_KEY = "nmiet_admin_token";

export function clearAdminToken() {
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

function adminToken() {
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}
export const statuses = [
  "Registered",
  "PPT Submitted",
  "Under Review",
  "Revision Requested",
  "Approved",
  "Shortlisted",
  "Rejected",
  "Qualified",
] as const;
export type Status = (typeof statuses)[number];
export type AdminUser = {
  name: string;
  email: string;
  role: "super_admin" | "faculty" | "judge" | "iic_member";
};
export type Person = {
  name?: string;
  email?: string;
  mobile?: string;
  department?: string;
  year?: string;
  division?: string;
  roll?: string;
  college?: string;
  institute?: string;
};
export type AdminRegistration = {
  _id: string;
  registration_id?: string;
  team?: {
    teamName?: string;
    psId?: string;
    psTitle?: string;
    theme?: string;
    category?: string;
    college?: string;
  };
  leader?: Person;
  members?: Person[];
  mentor?: Person;
  status?: Status;
  created_at?: string;
  updated_at?: string;
  pptUrl?: string;
  ppt?: { url?: string; filename?: string; uploaded_at?: string };
  isDeleted?: boolean;
  deleted_at?: string;
  deleted_by?: string;
  remarks?: string;
};
export type PptReviewStatus =
  | "Awaiting PPT"
  | "PPT Submitted"
  | "Under Review"
  | "Revision Requested"
  | "Approved"
  | "Rejected"
  | "Qualified";
export type PptFile = {
  version: number;
  filename?: string;
  original_filename?: string;
  file_name?: string;
  size: number;
  content_type?: string;
  uploaded_at: string;
  last_modified?: string;
  status: PptReviewStatus;
  reason?: string;
  reviewer_remarks?: string;
  internal_notes?: string;
};
export type PptRegistration = AdminRegistration & {
  ppt?: { current?: PptFile; history?: PptFile[] };
};
export type PptThemeSummary = {
  theme: string;
  total_teams: number;
  ppt_submitted: number;
  pending_review: number;
  approved: number;
  revision_requested: number;
  rejected: number;
};
export type AuditEntry = {
  _id: string;
  admin_name: string;
  action: string;
  registration_id?: string;
  detail?: string;
  timestamp: string;
};
export type AdminAnnouncement = {
  _id: string;
  title: string;
  body: string;
  tag?: string;
  is_pinned?: boolean;
  is_published?: boolean;
  is_archived?: boolean;
  scheduled_for?: string;
  expires_at?: string;
};
export type ManagedAdmin = {
  _id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at?: string;
};

function unavailableMessage() {
  return "The admin API is unavailable (Render returned 502/503). Open the Render dashboard, confirm nmiet-sih-backend is Live, then try again. Hibernated free instances often fail to wake.";
}

function detailMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  return fallback;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = adminToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    if (response.status === 401 && path !== "/auth/login") {
      clearAdminToken();
      throw new Error("Your admin session has expired. Please log in again.");
    }
    if (response.status === 502 || response.status === 503) {
      throw new Error(unavailableMessage());
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(detailMessage(body, "The request could not be completed."));
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
async function requestFile(path: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/admin${path}`, {
    credentials: "include",
    headers: adminToken() ? { Authorization: `Bearer ${adminToken()}` } : undefined,
  });
  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
      throw new Error("Your admin session has expired. Please log in again.");
    }
    if (response.status === 502 || response.status === 503) {
      throw new Error(unavailableMessage());
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(detailMessage(body, "The export could not be completed."));
  }
  return response.blob();
}

type PptZipManifest = { filename: string; files: { path: string; url: string }[] };

async function requestPptZip(path: string) {
  const response = await fetch(`${API_URL}/admin${path}`, {
    credentials: "include",
    headers: adminToken() ? { Authorization: `Bearer ${adminToken()}` } : undefined,
  });
  if (!response.ok) {
    if (response.status === 401) {
      clearAdminToken();
      throw new Error("Your admin session has expired. Please log in again.");
    }
    if (response.status === 502 || response.status === 503) {
      throw new Error(unavailableMessage());
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(detailMessage(body, "The export could not be completed."));
  }
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/zip") || type.includes("octet-stream")) {
    return response.blob();
  }
  const manifest = (await response.json()) as PptZipManifest;
  const { zipStoredFiles } = await import("./zip-store");
  return zipStoredFiles(manifest.files);
}
const query = (params: Record<string, string | boolean | undefined>) => {
  const value = new URLSearchParams();
  Object.entries(params).forEach(([key, item]) => {
    if (item !== undefined && item !== "") value.set(key, String(item));
  });
  return value.toString() ? `?${value}` : "";
};
export const adminApi = {
  login: async (email: string, password: string) => {
    const result = await request<{ token: string; user: AdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, result.token);
    return result.user;
  },
  logout: async () => {
    clearAdminToken();
    await request<void>("/auth/logout", { method: "POST" });
  },
  me: () => request<AdminUser>("/auth/me"),
  dashboard: () =>
    request<{
      registration_open: boolean;
      metrics: Record<string, number>;
      status_distribution: Record<string, number>;
      theme_distribution: { theme: string; count: number }[];
      latest: AdminRegistration[];
      activity: AuditEntry[];
    }>("/dashboard"),
  registrations: (params: Record<string, string | boolean | undefined> = {}) =>
    request<{ data: AdminRegistration[] }>(`/registrations${query(params)}`),
  registration: (id: string, includeDeleted = false) =>
    request<AdminRegistration>(
      `/registrations/${id}${includeDeleted ? "?include_deleted=true" : ""}`,
    ),
  exportRegistrations: (
    format: "csv" | "xlsx",
    params: Record<string, string | boolean | undefined>,
  ) => requestFile(`/registrations/export${query({ ...params, format })}`),
  updateRegistration: (id: string, payload: object) =>
    request(`/registrations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteRegistration: (id: string) => request(`/registrations/${id}`, { method: "DELETE" }),
  restoreRegistration: (id: string) => request(`/registrations/${id}/restore`, { method: "POST" }),
  activity: () => request<{ data: AuditEntry[] }>("/activity"),
  announcements: () => request<{ data: AdminAnnouncement[] }>("/announcements"),
  createAnnouncement: (payload: object) =>
    request<{ id: string }>("/announcements", { method: "POST", body: JSON.stringify(payload) }),
  updateAnnouncement: (id: string, payload: object) =>
    request(`/announcements/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteAnnouncement: (id: string) => request(`/announcements/${id}`, { method: "DELETE" }),
  users: (search = "") =>
    request<{ data: ManagedAdmin[] }>(
      `/users${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    ),
  createUser: (payload: object) =>
    request<{ id: string }>("/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id: string, payload: object) =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteUser: (id: string) => request(`/users/${id}`, { method: "DELETE" }),
  pptSubmissions: () => request<{ data: PptRegistration[] }>("/ppt"),
  pptThemes: () => request<{ data: PptThemeSummary[] }>("/ppt/themes"),
  pptSubmission: (id: string) => request<PptRegistration>(`/ppt/${id}`),
  pptDownload: (id: string, version?: number) =>
    request<{ url: string; expires_in: number }>(
      `/ppt/${id}/download${version ? `?version=${version}` : ""}`,
    ),
  pptThemeDownload: (theme: string) =>
    requestPptZip(`/ppt/themes/${encodeURIComponent(theme)}/download`),
  pptDownloadAll: () => requestPptZip("/ppt/download-all"),
  reviewPpt: (
    id: string,
    payload: { status: PptReviewStatus; reviewer_remarks: string; internal_notes: string },
  ) => request(`/ppt/submissions/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  pptPreview: (id: string, version?: number) =>
    request<{ url: string; expires_in: number }>(
      `/ppt/${id}/preview${version ? `?version=${version}` : ""}`,
    ),
  registrationControl: () => request<{ is_open: boolean }>("/registration-control"),
  setRegistrationControl: (is_open: boolean) =>
    request<{ is_open: boolean }>("/registration-control", {
      method: "PUT",
      body: JSON.stringify({ is_open }),
    }),
};

export type EvaluationTrack = {
  track_id: string;
  name: string;
  code: string;
  theme: string;
  domain: string;
  themes?: string[];
  domains?: string[];
  judges_required: number;
  is_active: boolean;
  team_count?: number;
};
export type EvaluationAccount = { id: string; name: string; track_id: string; is_active: boolean };
export type Criterion = {
  id: string;
  name: string;
  description: string;
  max_marks: number;
  order: number;
  is_active: boolean;
};
export type LeaderboardRow = {
  rank: number;
  registration_id: string;
  reference_id: string;
  team_name: string;
  theme: string;
  domain: string;
  track_id: string;
  track_name: string;
  score: number;
  max_score: number;
  judges_count: number;
  judges_required: number;
};
const evaluationRequest = <T>(path: string, options: RequestInit = {}) =>
  request<T>(`/evaluation${path}`, options);
export const evaluationApi = {
  overview: () =>
    evaluationRequest<{
      tracks: number;
      judges: number;
      coordinators: number;
      teams_assigned: number;
      evaluations_completed: number;
      evaluations_expected: number;
      progress_percentage: number;
    }>("/overview"),
  tracks: () => evaluationRequest<{ data: EvaluationTrack[] }>("/tracks"),
  options: () => evaluationRequest<{ themes: string[]; domains: string[] }>("/options"),
  createOption: (kind: "theme" | "domain", value: string) =>
    evaluationRequest("/options", { method: "POST", body: JSON.stringify({ kind, value }) }),
  createTrack: (x: Omit<EvaluationTrack, "track_id" | "team_count">) =>
    evaluationRequest("/tracks", { method: "POST", body: JSON.stringify(x) }),
  updateTrack: (id: string, x: Omit<EvaluationTrack, "track_id" | "team_count">) =>
    evaluationRequest(`/tracks/${id}`, { method: "PATCH", body: JSON.stringify(x) }),
  deactivateTrack: (id: string) => evaluationRequest(`/tracks/${id}`, { method: "DELETE" }),
  judges: () => evaluationRequest<{ data: EvaluationAccount[] }>("/judges"),
  createJudge: (x: { name: string; track_id: string; password: string }) =>
    evaluationRequest("/judges", { method: "POST", body: JSON.stringify(x) }),
  updateJudge: (
    id: string,
    x: Partial<{ name: string; track_id: string; password: string; is_active: boolean }>,
  ) => evaluationRequest(`/judges/${id}`, { method: "PATCH", body: JSON.stringify(x) }),
  coordinators: () => evaluationRequest<{ data: EvaluationAccount[] }>("/coordinators"),
  createCoordinator: (x: { name: string; track_id: string; password: string }) =>
    evaluationRequest("/coordinators", { method: "POST", body: JSON.stringify(x) }),
  updateCoordinator: (
    id: string,
    x: Partial<{ name: string; track_id: string; password: string; is_active: boolean }>,
  ) => evaluationRequest(`/coordinators/${id}`, { method: "PATCH", body: JSON.stringify(x) }),
  criteria: () => evaluationRequest<{ data: Criterion[] }>("/criteria"),
  createCriterion: (x: Omit<Criterion, "id">) =>
    evaluationRequest("/criteria", { method: "POST", body: JSON.stringify(x) }),
  updateCriterion: (id: string, x: Omit<Criterion, "id">) =>
    evaluationRequest(`/criteria/${id}`, { method: "PATCH", body: JSON.stringify(x) }),
  leaderboard: (params?: { search?: string; domain?: string; track_id?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.domain) query.set("domain", params.domain);
    if (params?.track_id) query.set("track_id", params.track_id);
    const suffix = query.toString() ? `?${query}` : "";
    return evaluationRequest<{ data: LeaderboardRow[] }>(`/leaderboard${suffix}`);
  },
};
