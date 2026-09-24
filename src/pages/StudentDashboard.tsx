import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, type TutorProfile } from "../lib/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const [tutors, setTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    api.listTutors().then((res) => setTutors(res.tutors)).catch(() => {});
  }, []);

  const available = tutors.filter((t) => t.available);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Welcome{firstName !== "there" ? `, ${firstName}` : ""}. Post what you're stuck on — tutors will see it.</p>
        </div>
        <Link to="/request" className="btn btn-primary">
          + Request Help
        </Link>
      </div>

      <div className="dashboard-grid">
        <section className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <h2>Request Help</h2>
            <span className="badge badge-green">Takes a minute</span>
          </div>
          <p className="dash-card-text">
            Describe the assignment or problem. Matching tutors get it on their dashboard and can
            email you to start a session.
          </p>
          <Link to="/request" className="btn btn-primary">
            Post a request
          </Link>
        </section>

        <section className="dash-card">
          <div className="dash-card-header">
            <h2>Tutors</h2>
            <span className="text-muted">{available.length} available</span>
          </div>
          {tutors.length === 0 ? (
            <p className="dash-card-text">Loading tutors…</p>
          ) : (
            <ul className="tutor-list">
              {tutors.slice(0, 4).map((tutor) => (
                <li key={tutor.id}>
                  <Link to={`/tutors/${tutor.id}`} className="tutor-list-item">
                    <span className="avatar">{tutor.avatar}</span>
                    <div>
                      <strong>
                        {tutor.name}
                        {tutor.founder ? " · Founder" : ""}
                      </strong>
                      <span>{tutor.subjects.join(" · ")}</span>
                    </div>
                    <span className={`status-dot${tutor.available ? " online" : ""}`} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/tutors" className="btn btn-ghost btn-block">
            Browse all tutors
          </Link>
        </section>

        <section className="dash-card dash-card-wide">
          <div className="dash-card-header">
            <h2>Want to tutor too?</h2>
          </div>
          <p className="dash-card-text">
            Publish a tutor profile in a couple of minutes. Founded by Evan Peterson — built so
            students can both get help and give it.
          </p>
          <Link to="/join" className="btn btn-secondary">
            Become a tutor
          </Link>
        </section>
      </div>
    </div>
  );
}
