const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://nmiet-sih-backend.onrender.com";

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    console.log("API REQUEST:", `${API_URL}${path}`);

    const response = await fetch(`${API_URL}${path}`, init);

    console.log("API STATUS:", response.status);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));

      throw new Error(
        errorBody.detail || `Request failed (${response.status})`
      );
    }

    // Handle empty responses safely
    const text = await response.text();

    if (!text) {
      console.log("EMPTY RESPONSE BODY");
      return {} as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      console.warn("Invalid JSON response:", text);
      return text as T;
    }

  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
}


export type PptSession = {
  id: string;
  team_name: string;
  reference_id: string;
  ps_id: string;
  theme: string;
  category: string;
  leader_name: string;
  leader_email: string;
  token: string;
  deadline?: string;

  submission?: {
    version: number;
    status: string;
    uploaded_at: string;
  };
};


export type PptUploadResponse = {
  success: boolean;
  version: number;
  uploaded_at: string;
  status: string;
};


export const pptApi = {

  verify: (
    reference_id: string,
    leader_email: string
  ) =>
    api<PptSession>(
      "/ppt/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference_id,
          leader_email,
        }),
      }
    ),


  upload: (
    file: File,
    token: string
  ) => {

    const data = new FormData();

    data.append("file", file);

    return api<PptUploadResponse>(
      "/ppt/upload",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: data,
      }
    );
  },

};