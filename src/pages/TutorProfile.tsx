import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type TutorProfile } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function TutorProfile() {
  const { tutorId } = useParams();
  const { isAuthenticated } = useAuth();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!tutorId) return;
    api
      .getTutor(tutorId)
      .then((res) => setTutor(res.tutor))
      .catch(() => setMissing(true));
  }, [tutorId]);

  if (missing) {
    return (
      <div className="page">
        <div className="empty-state">
          <h1>Tutor not found</h1>
          <p>That profile doesn't exist or may have been removed.</p>
          <Link to="/tutors" className="btn btn-primary">
            Back to tutors
          </Link>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="page">
        <p className="text-muted">Loading profile…</p>
      </div>
    );
  }

  const requestPath = isAuthenticated ? "/request" : "/login";

  return (
    <div className="page">
      <Link to="/tutors" className="back-link">
        ← All tutors
      </Link>

      <div className="profile-layout">
        <div className="profile-main">
          <div className="profile-header">
            <span className="avatar avatar-xl">{tutor.avatar}</span>
            <div>
              <h1>
                {tutor.name}
                {tutor.founder ? <span className="founder-pill">Founder</span> : null}
              </h1>
              <p className="profile-grade">{tutor.grade}</p>
              <p className={`profile-status${tutor.available ? " online" : ""}`}>
                {tutor.available ? "Available now" : "Not available"}
              </p>
            </div>
          </div>

          <section className="profile-section">
            <h2>About</h2>
            <p>{tutor.bio}</p>
          </section>

          <section className="profile-section">
            <h2>Subjects</h2>
            <div className="tutor-card-subjects">
              {tutor.subjects.map((s) => (
                <span key={s} className="subject-chip">
                  {s}
                </span>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <h2>Stats</h2>
            <dl className="profile-stats">
              <div>
                <dt>Rating</dt>
                <dd>★ {tutor.rating}</dd>
              </div>
              <div>
                <dt>Students helped</dt>
                <dd>{tutor.studentsHelped}</dd>
              </div>
              <div>
                <dt>Volunteer hours</dt>
                <dd>{tutor.hours}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="profile-sidebar">
          <div className="profile-actions-card">
            <h2>Get help from {tutor.name.split(" ")[0]}</h2>
            <a href={`mailto:${tutor.email}`} className="btn btn-primary btn-block">
              Email {tutor.name.split(" ")[0]}
            </a>
            <Link
              to={requestPath}
              state={{ tutorName: tutor.name, subject: tutor.subjects[0] }}
              className="btn btn-secondary btn-block"
            >
              Request a session
            </Link>
            <p className="profile-actions-note">
              Sessions are free. {tutor.name.split(" ")[0]} logs volunteer hours after each
              meeting.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
