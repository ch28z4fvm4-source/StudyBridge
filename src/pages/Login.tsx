import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "../components/Logo";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AppleSignInButton from "../components/AppleSignInButton";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { dashboardPathForRole, isAppleConfigured, isGoogleConfigured, type UserRole } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { user, isAuthenticated, signIn, setRole } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const intendedRole: UserRole = params.get("as") === "tutor" ? "tutor" : "student";

  const returnTo = useMemo(() => {
    const from = (location.state as { from?: string } | null)?.from;
    if (from) return from;
    return intendedRole === "tutor" ? "/dashboard/tutor" : "/dashboard/student";
  }, [location.state, intendedRole]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.provider !== "email" && !user?.emailVerified) {
      navigate("/verify", { state: { from: returnTo }, replace: true });
      return;
    }
    if (user?.role) {
      navigate(dashboardPathForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, returnTo]);

  const handleAuthSuccess = () => {
    setError(null);
    navigate("/verify", { state: { from: returnTo } });
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setBusy(true);
    setError(null);

    try {
      const result =
        mode === "signup"
          ? await api.signup({ name, email, password, role: intendedRole })
          : await api.login(email, password);
      signIn(result.user);
      if (result.user.role === "student" && intendedRole === "tutor") {
        navigate("/join", { replace: true });
        return;
      }
      navigate(dashboardPathForRole(result.user.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleRolePick = async (role: UserRole) => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await api.sendWelcome(user.email, user.name, role);
    } catch {
      /* continue even if email fails */
    }
    setRole(role);
    if (role === "tutor") {
      navigate("/join", { replace: true });
      return;
    }
    navigate(dashboardPathForRole(role), { replace: true });
    setBusy(false);
  };

  const showRoleStep = isAuthenticated && user?.emailVerified && !user?.role;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Logo />
        </div>

        {showRoleStep ? (
          <>
            <h1>Welcome, {user?.name.split(" ")[0]}</h1>
            <p className="login-lead">How do you want to use StudyBridge?</p>
            <div className="login-options">
              <button type="button" className="login-option" onClick={() => handleRolePick("student")} disabled={busy}>
                <strong>I'm a student</strong>
                <span>Find tutors and post help requests</span>
              </button>
              <button type="button" className="login-option" onClick={() => handleRolePick("tutor")} disabled={busy}>
                <strong>I want to tutor</strong>
                <span>Create a public tutor profile students can request</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h1>{mode === "signup" ? "Create your account" : "Sign in"}</h1>
            <p className="login-lead">
              {intendedRole === "tutor"
                ? "Join as a volunteer tutor. Students will be able to find you and request help."
                : "Free tutoring from student volunteers. Sign up in under a minute."}
            </p>

            <form className="auth-form" onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <label>
                  Full name
                  <input name="name" type="text" autoComplete="name" required placeholder="Evan Peterson" />
                </label>
              )}
              <label>
                Email
                <input name="email" type="email" autoComplete="email" required placeholder="you@email.com" />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={mode === "signup" ? 8 : undefined}
                  placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                />
              </label>
              {error && <p className="login-error">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="auth-switch">
              {mode === "login" ? (
                <>
                  New here?{" "}
                  <button type="button" className="link-btn" onClick={() => { setMode("signup"); setError(null); }}>
                    Create an account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => { setMode("login"); setError(null); }}>
                    Sign in
                  </button>
                </>
              )}
            </p>

            {intendedRole === "tutor" && (
              <p className="login-footnote">
                After you sign up, add the subjects you teach on the{" "}
                <Link to="/join">tutor profile</Link> page.
              </p>
            )}

            {(isGoogleConfigured || isAppleConfigured) && (
              <>
                <div className="auth-divider">or</div>
                <div className="sso-stack">
                  <GoogleSignInButton onSuccess={handleAuthSuccess} onError={(message) => setError(message)} />
                  <AppleSignInButton onSuccess={handleAuthSuccess} onError={(message) => setError(message)} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
