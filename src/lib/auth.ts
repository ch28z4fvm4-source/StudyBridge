export type UserRole = "student" | "tutor";
export type AuthProvider = "google" | "apple" | "email";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  provider: AuthProvider;
  role?: UserRole;
  emailVerified: boolean;
}

export const AUTH_STORAGE_KEY = "studybridge_auth";

export function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function saveUser(user: AuthUser) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function dashboardPathForRole(role: UserRole): string {
  return role === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
}

export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
export const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID ?? "";
export const appleRedirectUri =
  import.meta.env.VITE_APPLE_REDIRECT_URI ??
  `${typeof window !== "undefined" ? window.location.origin : ""}/login`;

export const isGoogleConfigured = googleClientId.length > 0;
export const isAppleConfigured = appleClientId.length > 0;
