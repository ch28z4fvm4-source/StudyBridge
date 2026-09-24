import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type TutorProfile } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function BrowseTutors() {
  const { isAuthenticated } = useAuth();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listTutors()
      .then((res) => setTutors(res.tutors))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load tutors."));
  }, []);

  const available = tutors.filter((t) => t.available).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Browse tutors</h1>
          <p>
            {available} tutor{available === 1 ? "" : "s"} available — including founder Evan
            Peterson. Sign up to add yourself.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/join" className="btn btn-secondary">
            Become a tutor
          </Link>
          <Link to={isAuthenticated ? "/request" : "/login"} className="btn btn-primary">
            Request help
          </Link>
        </div>
      </div>

      {error && <p className="login-error">{error}</p>}

      {tutors.length === 0 && !error ? (
        <p className="text-muted">Loading tutors…</p>
      ) : (
        <ul className="tutor-grid">
          {tutors.map((tutor) => (
            <li key={tutor.id}>
              <Link to={`/tutors/${tutor.id}`} className="tutor-card">
                <div className="tutor-card-top">
                  <span className="avatar avatar-lg">{tutor.avatar}</span>
                  <span className={`status-dot${tutor.available ? " online" : ""}`} />
                </div>
                <h2>
                  {tutor.name}
                  {tutor.founder ? <span className="founder-pill">Founder</span> : null}
                </h2>
                <p className="tutor-card-grade">{tutor.grade}</p>
                <p className="tutor-card-bio">{tutor.bio}</p>
                <div className="tutor-card-subjects">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="subject-chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="tutor-card-meta">
                  <span>★ {tutor.rating}</span>
                  <span>{tutor.studentsHelped} students</span>
                  <span>{tutor.hours} hrs logged</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
