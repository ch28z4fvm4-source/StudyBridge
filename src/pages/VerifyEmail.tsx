import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, markEmailVerified } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const sentOnMount = useRef(false);

  const returnTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard/student";

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.emailVerified) {
      navigate(user.role ? returnTo : "/login", { replace: true });
    }
  }, [isAuthenticated, user, navigate, returnTo]);

  useEffect(() => {
    if (!user || user.emailVerified || sentOnMount.current) return;
    sentOnMount.current = true;

    api
      .sendTwoFactor(user.email, user.name)
      .then((res) => {
        if (res.devCode) setDevCode(res.devCode);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Could not send code.");
      });
  }, [user]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || code.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      await api.verifyTwoFactor(user.email, code);
      markEmailVerified();
      navigate("/login", { state: { from: returnTo }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user) return;
    setResending(true);
    setError(null);

    try {
      const res = await api.sendTwoFactor(user.email, user.name);
      setDevCode(res.devCode ?? null);
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <Logo />
        </div>

        <h1>Check your email</h1>
        <p className="login-lead">
          We sent a 6-digit code to <strong>{user.email}</strong>. Enter it below to finish
          signing in.
        </p>

        <form className="verify-form" onSubmit={handleVerify}>
          <label htmlFor="code" className="verify-label">
            Verification code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            pattern="[0-9]{6}"
            className="verify-input"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            autoFocus
          />

          {error && <p className="login-error">{error}</p>}

          {devCode && (
            <p className="login-dev-note">
              Dev mode — your code is <strong>{devCode}</strong> (also printed in the API
              terminal).
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={code.length !== 6 || loading}
          >
            {loading ? "Verifying…" : "Verify & continue"}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost btn-block verify-resend"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>

        <p className="login-footnote">
          Codes expire after 10 minutes.{" "}
          <Link to="/login" onClick={() => {}}>
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}
