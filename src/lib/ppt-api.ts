const API_URL = import.meta.env.VITE_API_URL || "https://nmiet-sih-backend.onrender.com";

async function api<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, init);
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.detail || "Request failed."); }
  return response.json() as Promise<T>;
}

export type PptSession = { id:string; team_name:string; reference_id:string; ps_id:string; theme:string; category:string; leader_name:string; leader_email:string; token:string; deadline?:string; submission?:{version:number;status:string;uploaded_at:string} };
export const pptApi = {
  verify: (reference_id:string, leader_email:string) => api<PptSession>("/ppt/verify", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference_id,leader_email})}),
  upload: (file:File, token:string) => { const data=new FormData(); data.append("file",file); return api<{success:boolean;version:number;uploaded_at:string;status:string}>("/ppt/upload",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:data}); },
};
