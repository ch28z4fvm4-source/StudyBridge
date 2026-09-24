import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SUBJECTS } from "../data/subjects";

export default function RequestHelp() {
  const location = useLocation();
  const { user } = useAuth();
  const prefilled = (location.state as { tutorName?: string; subject?: string }) ?? {};
  const [submitted, setSubmitted] = useState(false);
  const [postedSubject, setPostedSubject] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const form = new FormData(e.currentTarget);
    const subject = String(form.get("subject") ?? "");
    const urgency = String(form.get("urgency") ?? "medium");
    const description = String(form.get("description") ?? "");

    setSubmitting(true);
    setError(null);

    try {
      const result = await api.notifyHelpRequest({
        studentName: user.name,
        studentEmail: user.email,
        subject,
        description,
        urgency,
      });
      setPostedSubject(subject);
      setNotifyMessage(result.message);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="success-state">
          <h1>Request posted</h1>
          <p>{notifyMessage}</p>
          <p className="success-sub">
            Tutors who teach <strong>{postedSubject}</strong> were emailed with your request.
            You'll get a message when someone accepts.
          </p>
          <div className="success-actions">
            <Link to="/dashboard/student" className="btn btn-primary">
              Go to dashboard
            </Link>
            <Link to="/tutors" className="btn btn-ghost">
              Browse tutors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <Link to="/dashboard/student" className="back-link">
        ← Student dashboard
      </Link>

      <div className="page-header">
        <div>
          <h1>Request help</h1>
          <p>
            Describe what you're stuck on. Available tutors in that subject get emailed
            immediately.
          </p>
        </div>
      </div>

      <form className="request-form request-form-page" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            Subject
            <select name="subject" defaultValue={prefilled.subject ?? ""} required>
              <option value="" disabled>
                Select a subject
              </option>
              {SUBJECTS.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
          <label>
            When do you need help?
            <select name="urgency" defaultValue="medium">
              <option value="low">This week</option>
              <option value="medium">Within 2 days</option>
              <option value="high">Today</option>
            </select>
          </label>
        </div>
        {prefilled.tutorName && (
          <p className="form-note">
            Requesting help from <strong>{prefilled.tutorName}</strong> — any qualified tutor can
            still respond.
          </p>
        )}
        <label>
          What do you need help with?
          <textarea
            name="description"
            rows={5}
            required
            placeholder="Describe the topic, assignment, or paste the problem you're stuck on..."
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Posting & notifying tutors…" : "Post request"}
          </button>
          <Link to="/tutors" className="btn btn-ghost">
            Browse tutors instead
          </Link>
        </div>
      </form>
    </div>
  );
}
