const API_URL = import.meta.env.VITE_API_URL || "https://nmiet-sih-backend.onrender.com";

export type AdminUser = { name: string; email: string; role: "super_admin" | "faculty" | "judge" | "iic_member" };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/admin${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || "The request could not be completed.");
  }
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export const adminApi = {
  login: (email: string, password: string) => request<{ user: AdminUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<AdminUser>("/auth/me"),
  dashboard: () => request<{ metrics: Record<string, number>; latest: AdminRegistration[] }>("/dashboard"),
  registrations: (query = "") => request<{ data: AdminRegistration[] }>(`/registrations${query}`),
  activity: () => request<{ data: AuditEntry[] }>("/activity"),
  announcements: () => request<{ data: AdminAnnouncement[] }>("/announcements"),
  createAnnouncement: (payload: object) => request<{ id: string }>("/announcements", { method: "POST", body: JSON.stringify(payload) }),
  deleteAnnouncement: (id: string) => request(`/announcements/${id}`, { method: "DELETE" }),
  updateRegistration: (id: string, payload: object) => request(`/registrations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteRegistration: (id: string) => request(`/registrations/${id}`, { method: "DELETE" }),
};

export type AdminRegistration = { _id: string; registration_id?: string; team?: { teamName?: string; psId?: string; theme?: string; category?: string }; leader?: { name?: string; email?: string; department?: string; year?: string }; status?: string; created_at?: string; pptUrl?: string; remarks?: string };
export type AuditEntry = { _id: string; admin_name: string; action: string; detail?: string; timestamp: string };
export type AdminAnnouncement = { _id: string; title: string; body: string; is_pinned?: boolean; scheduled_for?: string; expires_at?: string };
