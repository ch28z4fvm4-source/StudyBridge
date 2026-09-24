import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type PlatformMetrics } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const basics = [
  {
    title: "Tutoring is free",
    description:
      "No payment, no credits. Tutors volunteer because they're logging service hours — same reason you'd help at a food drive.",
  },
  {
    title: "Anyone can tutor",
    description:
      "Sign up, pick the subjects you know, and your profile goes live. Students can request you the same day.",
  },
  {
    title: "Hours actually count",
    description:
      "Tutors log sessions on StudyBridge and download a service report for NHS, clubs, or graduation requirements.",
  },
  {
    title: "Open to everyone",
    description:
      "Any email works. Tutors help students anywhere — not just people from their own school.",
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);

  useEffect(() => {
    api.metrics().then(setMetrics).catch(() => {});
  }, []);

  const tutorCta = isAuthenticated && user?.role === "tutor" ? "/dashboard/tutor" : "/join";
  const studentCta = isAuthenticated ? "/tutors" : "/login";

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Live now · Founded by Evan Peterson</div>
          <h1>
            Free tutoring. Real tutors. <em>You can join today.</em>
          </h1>
          <p className="hero-sub">
            joinstudybridge.academy is free tutoring from real volunteers: get help, or sign up to tutor
            and earn hours. Founded by Evan Peterson.
          </p>
          <div className="hero-actions">
            <Link to={studentCta} className="btn btn-primary btn-lg">
              Get help
            </Link>
            <Link to={tutorCta} className="btn btn-secondary btn-lg">
              Become a tutor
            </Link>
          </div>
          <p className="hero-note">
            {metrics
              ? `${metrics.tutorsActive} tutor${metrics.tutorsActive === 1 ? "" : "s"} live · ${metrics.requestsOpen} open request${metrics.requestsOpen === 1 ? "" : "s"}`
              : "Create an account with your email — no school login required."}
          </p>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-main">
            <div className="hero-card-header">
              <span className="avatar avatar-sm">EP</span>
              <div>
                <strong>Evan Peterson</strong>
                <span>Founder · tutoring Algebra II</span>
              </div>
            </div>
            <div className="hero-card-messages">
              <div className="mini-msg">
                <span className="avatar avatar-xs">EP</span>
                <p>Post what you're stuck on. A real tutor — including me — can pick it up.</p>
              </div>
              <div className="mini-msg own">
                <p>I'm lost on factoring when the first number isn't 1.</p>
              </div>
              <div className="mini-msg">
                <span className="avatar avatar-xs">EP</span>
                <p>That's the AC method. Sign up and send a request — I'll walk through it with you.</p>
              </div>
            </div>
          </div>
          <div className="hero-card hero-card-requests">
            <p className="requests-heading">How it works</p>
            <ul className="requests-list">
              <li>
                <div className="request-row">
                  <span className="request-subject">1</span>
                  <span className="request-detail">Create a free account</span>
                </div>
              </li>
              <li>
                <div className="request-row">
                  <span className="request-subject">2</span>
                  <span className="request-detail">Students post a request · tutors publish a profile</span>
                </div>
              </li>
              <li>
                <div className="request-row">
                  <span className="request-subject">3</span>
                  <span className="request-detail">Meet, help, log volunteer hours</span>
                </div>
              </li>
            </ul>
            <Link to="/join" className="requests-footer-link">
              Start tutoring →
            </Link>
          </div>
        </div>
      </section>

      <section className="impact" id="impact">
        <div className="impact-inner">
          <p className="impact-intro">
            StudyBridge is live. These numbers update as real people sign up on joinstudybridge.academy.
          </p>
          <dl className="impact-stats">
            <div className="impact-stat">
              <dt>{(metrics?.studentsHelped ?? 0).toLocaleString()}</dt>
              <dd>students signed up</dd>
            </div>
            <div className="impact-stat">
              <dt>{(metrics?.tutorsActive ?? 0).toLocaleString()}</dt>
              <dd>tutors on the network</dd>
            </div>
            <div className="impact-stat">
              <dt>{(metrics?.requestsOpen ?? 0).toLocaleString()}</dt>
              <dd>help requests posted</dd>
            </div>
          </dl>
          <p className="impact-footnote">Founded by Evan Peterson · community-powered and free</p>
        </div>
      </section>

      <section className="basics" id="features">
        <h2>The basics</h2>
        <ol className="basics-list">
          {basics.map((item) => (
            <li key={item.title} className="basics-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-banner">
        <div className="cta-content">
          <h2>Need help, or want to volunteer?</h2>
          <p>Sign up with your email. You can be a student, a tutor, or both.</p>
          <div className="hero-actions">
            <Link to={studentCta} className="btn btn-primary btn-lg">
              Find a tutor
            </Link>
            <Link to={tutorCta} className="btn btn-outline-light btn-lg">
              Become a tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
