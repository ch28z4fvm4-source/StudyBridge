import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthProvider,
  type AuthUser,
  type UserRole,
  clearStoredUser,
  loadStoredUser,
  saveUser,
} from "../lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  signIn: (
    user: Omit<AuthUser, "role" | "emailVerified"> & { role?: UserRole; emailVerified?: boolean },
  ) => void;
  markEmailVerified: () => void;
  setRole: (role: UserRole) => void;
  signOut: () => void;
  signInWithDemo: (provider: AuthProvider) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const demoProfiles: Record<Exclude<AuthProvider, "email">, Omit<AuthUser, "role" | "emailVerified">> = {
  google: {
    id: "google-demo-evan",
    name: "Evan Peterson",
    email: "evan@gmail.com",
    picture: undefined,
    provider: "google",
  },
  apple: {
    id: "apple-demo-jordan",
    name: "Jordan Kim",
    email: "jordan@privaterelay.appleid.com",
    picture: undefined,
    provider: "apple",
  },
};

function normalizeUser(
  next: Omit<AuthUser, "role" | "emailVerified"> & { role?: UserRole; emailVerified?: boolean },
): AuthUser {
  return {
    id: next.id,
    name: next.name,
    email: next.email,
    picture: next.picture,
    provider: next.provider,
    role: next.role,
    emailVerified: next.emailVerified ?? false,
  };
}

function loadUser(): AuthUser | null {
  const stored = loadStoredUser();
  if (!stored) return null;
  if (typeof stored.emailVerified === "boolean") return stored;
  return { ...stored, emailVerified: true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadUser());

  const signIn = useCallback(
    (next: Omit<AuthUser, "role" | "emailVerified"> & { role?: UserRole; emailVerified?: boolean }) => {
      const fullUser = normalizeUser(next);
      saveUser(fullUser);
      setUser(fullUser);
    },
    [],
  );

  const markEmailVerified = useCallback(() => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, emailVerified: true };
      saveUser(updated);
      return updated;
    });
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, role };
      saveUser(updated);
      return updated;
    });
  }, []);

  const signOut = useCallback(() => {
    clearStoredUser();
    setUser(null);
  }, []);

  const signInWithDemo = useCallback(
    (provider: AuthProvider) => {
      if (provider === "email") return;
      signIn({ ...demoProfiles[provider], emailVerified: false });
    },
    [signIn],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      markEmailVerified,
      setRole,
      signOut,
      signInWithDemo,
    }),
    [user, signIn, markEmailVerified, setRole, signOut, signInWithDemo],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
