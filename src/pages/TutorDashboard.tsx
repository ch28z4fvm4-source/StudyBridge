import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, type HelpRequest, type TutorProfile } from "../lib/api";

export default function TutorDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [profile, setProfile] = useState<TutorProfile | null>(null);

  useEffect(() => {
    api.listRequests().then((res) => setRequests(res.requests)).catch(() => {});
    if (!user) return;
    api
      .listTutors()
      .then((res) => {
        const mine = res.tutors.find((t) => t.userId === user.id || t.email === user.email);
        setProfile(mine ?? null);
      })
      .catch(() => {});
  }, [user]);

  const mySubjects = profile?.subjects ?? [];
  const matching = useMemo(
    () =>
      mySubjects.length === 0
        ? requests
        : requests.filter((req) =>
            mySubjects.some((s) => s.toLowerCase() === req.subject.toLowerCase()),
          ),
    [requests, mySubjects],
  );

  const isNew = !profile || (profile.hours === 0 && profile.studentsHelped === 0 && !profile.founder);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Tutor Dashboard</h1>
          <p>
            Hi {firstName}.{" "}
            {matching.length
              ? `${matching.length} student request${matching.length === 1 ? "" : "s"} waiting.`
              : "No matching requests yet — keep your profile live."}
          </p>
        </div>
        <div className="page-header-actions">
          {!profile && (
            <Link to="/join" className="btn btn-primary">
              Publish tutor profile
            </Link>
          )}
          <Link to="/hours" className="btn btn-secondary">
            View Hours
          </Link>
        </div>
      </div>

      {profile && (
        <p className="dash-live-note">
          Your profile is live on the <Link to={`/tutors/${profile.id}`}>tutors page</Link>
          {profile.founder ? " · StudyBridge founder" : ""}.
        </p>
      )}

      <div className="stats-row">
        <Link to="/hours" className="stat-box stat-box-link">
          <span className="stat-box-value">{profile?.hours ?? 0}</span>
          <span className="stat-box-label">Hours earned</span>
        </Link>
        <div className="stat-box">
          <span className="stat-box-value">{profile?.studentsHelped ?? 0}</span>
          <span className="stat-box-label">Students helped</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-value">{profile?.rating ?? "—"}</span>
          <span className="stat-box-label">Average rating</span>
        </div>
        <div className="stat-box">
          <span className="stat-box-value">{matching.length}</span>
          <span className="stat-box-label">Open requests</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <h2>Incoming Requests</h2>
            <span className="badge badge-navy">{matching.length} open</span>
          </div>
          {matching.length === 0 ? (
            <p className="dash-card-text">
              When a student posts a request in your subjects, it shows up here with their email so
              you can reach them.
            </p>
          ) : (
            <ul className="request-list">
              {matching.map((req) => (
                <li key={req.id} className="request-item">
                  <div className="request-info">
                    <strong>{req.studentName}</strong>
                    <span>
                      {req.subject} — {req.topic}
                    </span>
                    <span className="text-muted">{req.studentEmail}</span>
                  </div>
                  <span className={`urgency urgency-${req.urgency}`}>{req.urgency}</span>
                  <div className="request-actions">
                    <a href={`mailto:${req.studentEmail}?subject=StudyBridge: ${req.subject}`} className="btn btn-sm btn-primary">
                      Accept
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dash-card">
          <div className="dash-card-header">
            <h2>{isNew ? "Getting started" : "Reviews"}</h2>
          </div>
          {isNew ? (
            <p className="dash-card-text">
              Complete a session, then students can rate you. Hours stay at 0 until you log them.
            </p>
          ) : (
            <p className="dash-card-text">Reviews appear after students complete sessions with you.</p>
          )}
        </section>
      </div>
    </div>
  );
}
