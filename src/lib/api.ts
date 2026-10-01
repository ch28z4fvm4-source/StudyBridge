import { AUTH_TOKEN_KEY, loadToken, saveToken } from "./auth";

const API_BASE = "/api";

function headers(extra?: HeadersInit): HeadersInit {
  const token = loadToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: headers(options?.headers),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }

  if (typeof (data as { token?: string }).token === "string") {
    saveToken((data as { token: string }).token);
  }

  return data as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export interface Send2faResponse {
  ok: boolean;
  message: string;
  devCode?: string;
}

export interface HelpRequestResponse {
  ok: boolean;
  notified: number;
  tutors: string[];
  message: string;
}

export interface AuthUserPayload {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: "student" | "tutor";
  provider: "email";
  emailVerified: boolean;
}

export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  email?: string;
  grade: string;
  subjects: string[];
  bio: string;
  hours: number;
  rating: number;
  studentsHelped: number;
  avatar: string;
  available: boolean;
  founder?: boolean;
}

export interface HelpRequest {
  id: string;
  studentName: string;
  studentEmail?: string;
  subject: string;
  topic: string;
  urgency: "low" | "medium" | "high";
  requestedAt: string;
}

export interface PlatformMetrics {
  studentsHelped: number;
  tutorsActive: number;
  volunteerHours: number;
  requestsOpen: number;
}

export const api = {
  signup: (body: {
    name: string;
    email: string;
    password: string;
    role: "student" | "tutor";
    grade?: string;
    subjects?: string[];
    bio?: string;
  }) => post<{ ok: boolean; user: AuthUserPayload; token: string }>("/auth/signup", body),

  login: (email: string, password: string) =>
    post<{ ok: boolean; user: AuthUserPayload; token: string }>("/auth/login", { email, password }),

  becomeTutor: (body: { grade: string; subjects: string[]; bio: string }) =>
    post<{ ok: boolean; tutor: TutorProfile; role: "tutor"; token: string }>("/auth/become-tutor", body),

  sendTwoFactor: (_email: string, _name: string) =>
    post<Send2faResponse>("/auth/send-2fa", {}),

  verifyTwoFactor: (_email: string, code: string) =>
    post<{ ok: boolean; verified: boolean }>("/auth/verify-2fa", { code }),

  sendWelcome: (_email: string, _name: string, role: "student" | "tutor") =>
    post<{ ok: boolean; message: string }>("/auth/welcome", { role }),

  listTutors: () => request<{ tutors: TutorProfile[] }>("/tutors"),

  getTutor: (id: string) => request<{ tutor: TutorProfile }>(`/tutors/${id}`),

  listRequests: () => request<{ requests: HelpRequest[] }>("/requests"),

  metrics: () => request<PlatformMetrics>("/metrics"),

  notifyHelpRequest: (payload: {
    subject: string;
    description: string;
    urgency: string;
  }) => post<HelpRequestResponse>("/notifications/help-request", payload),
};

export { AUTH_TOKEN_KEY };
