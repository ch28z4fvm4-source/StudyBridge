import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { GRADES, SUBJECTS } from "../data/subjects";
import { api } from "../lib/api";

export default function JoinAsTutor() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signIn, setRole } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);

  const needsAccount = !isAuthenticated;

  const toggleSubject = (subject: string) => {
    setSubjects((current) =>
      current.includes(subject) ? current.filter((s) => s !== subject) : [...current, subject],
    );
  };

  const title = useMemo(
    () => (needsAccount ? "Become a tutor" : "Finish your tutor profile"),
    [needsAccount],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? user?.name ?? "").trim();
    const email = String(form.get("email") ?? user?.email ?? "").trim();
    const password = String(form.get("password") ?? "");
    const grade = String(form.get("grade") ?? "");
    const bio = String(form.get("bio") ?? "").trim();

    if (subjects.length === 0) {
      setError("Pick at least one subject you can tutor.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (needsAccount) {
        const result = await api.signup({
          name,
          email,
          password,
          role: "tutor",
          grade,
          subjects,
          bio,
        });
        signIn(result.user);
      } else if (user) {
        await api.becomeTutor({
          userId: user.id,
          name,
          email,
          grade,
          subjects,
          bio,
        });
        setRole("tutor");
      }
      navigate("/dashboard/tutor", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create tutor profile.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card login-card-wide">
        <div className="login-brand">
          <Logo />
        </div>
        <h1>{title}</h1>
        <p className="login-lead">
          StudyBridge is free. Students request help, you show up, and you log volunteer hours.
          Founded by Evan Peterson · joinstudybridge.academy
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Full name
              <input
                name="name"
                type="text"
                required
                defaultValue={user?.name ?? ""}
                autoComplete="name"
                placeholder="Your name"
              />
            </label>
            <label>
              Grade / level
              <select name="grade" defaultValue="11th grade" required>
                {GRADES.map((grade) => (
                  <option key={grade}>{grade}</option>
                ))}
              </select>
            </label>
          </div>

          {needsAccount && (
            <>
              <label>
                Email
                <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </label>
            </>
          )}

          <fieldset className="subject-fieldset">
            <legend>Subjects you can tutor</legend>
            <div className="subject-picks">
              {SUBJECTS.map((subject) => (
                <label key={subject} className={`subject-pick${subjects.includes(subject) ? " selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={subjects.includes(subject)}
                    onChange={() => toggleSubject(subject)}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            Short bio
            <textarea
              name="bio"
              rows={4}
              required
              placeholder="What classes you're strongest in, how you like to help, and when you're usually free."
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Publishing profile…" : "Publish my tutor profile"}
          </button>
        </form>

        <p className="login-footnote">
          {needsAccount ? (
            <>
              Already have an account? <Link to="/login?as=tutor">Sign in</Link>
            </>
          ) : (
            <>Your profile goes live immediately on the tutors page.</>
          )}
        </p>
      </div>
    </div>
  );
}
