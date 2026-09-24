import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo className="footer-logo-lockup" />
          <p className="footer-tagline">
            joinstudybridge.academy — free tutoring for anyone. Founded by Evan Peterson.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <h4>For Students</h4>
            <Link to="/tutors">Find a Tutor</Link>
            <Link to="/request">Request Help</Link>
            <Link to="/chat">Active Chats</Link>
          </div>
          <div>
            <h4>For Tutors</h4>
            <Link to="/join">Become a Tutor</Link>
            <Link to="/hours">Volunteer Hours</Link>
          </div>
          <div>
            <h4>Community</h4>
            <Link to="/#features">The basics</Link>
            <Link to="/#impact">By the numbers</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 joinstudybridge.academy · Founded by Evan Peterson</p>
      </div>
    </footer>
  );
}
