const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
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
  email: string;
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
  studentEmail: string;
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
  }) => post<{ ok: boolean; user: AuthUserPayload }>("/auth/signup", body),

  login: (email: string, password: string) =>
    post<{ ok: boolean; user: AuthUserPayload }>("/auth/login", { email, password }),

  becomeTutor: (body: {
    userId: string;
    name: string;
    email: string;
    grade: string;
    subjects: string[];
    bio: string;
  }) => post<{ ok: boolean; tutor: TutorProfile; role: "tutor" }>("/auth/become-tutor", body),

  sendTwoFactor: (email: string, name: string) =>
    post<Send2faResponse>("/auth/send-2fa", { email, name }),

  verifyTwoFactor: (email: string, code: string) =>
    post<{ ok: boolean; verified: boolean }>("/auth/verify-2fa", { email, code }),

  sendWelcome: (email: string, name: string, role: "student" | "tutor") =>
    post<{ ok: boolean; message: string }>("/auth/welcome", { email, name, role }),

  listTutors: () => request<{ tutors: TutorProfile[] }>("/tutors"),

  getTutor: (id: string) => request<{ tutor: TutorProfile }>(`/tutors/${id}`),

  listRequests: () => request<{ requests: HelpRequest[] }>("/requests"),

  metrics: () => request<PlatformMetrics>("/metrics"),

  notifyHelpRequest: (payload: {
    studentName: string;
    studentEmail: string;
    subject: string;
    description: string;
    urgency: string;
  }) => post<HelpRequestResponse>("/notifications/help-request", payload),
};
