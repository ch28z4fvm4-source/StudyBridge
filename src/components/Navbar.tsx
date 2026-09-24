import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import { dashboardPathForRole } from "../lib/auth";

const navLinks = [
  { to: "/", label: "Home", match: (path: string) => path === "/" },
  {
    to: "/dashboard/student",
    label: "Student",
    match: (path: string) => path.startsWith("/dashboard/student") || path === "/request",
  },
  {
    to: "/dashboard/tutor",
    label: "Tutor",
    match: (path: string) => path.startsWith("/dashboard/tutor"),
  },
  { to: "/chat", label: "Messages", match: (path: string) => path.startsWith("/chat") },
  { to: "/tutors", label: "Tutors", match: (path: string) => path.startsWith("/tutors") },
  { to: "/hours", label: "Hours", match: (path: string) => path === "/hours" },
];

function userInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const dashboardLink = user?.role ? dashboardPathForRole(user.role) : "/dashboard/student";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <Logo />
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${match(location.pathname) ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {isAuthenticated && user ? (
            <div className="nav-user">
              <Link to={dashboardLink} className="nav-user-profile">
                {user.picture ? (
                  <img src={user.picture} alt="" className="nav-user-photo" />
                ) : (
                  <span className="avatar avatar-sm nav-user-avatar">{userInitials(user.name)}</span>
                )}
                <span className="nav-user-name">{user.name.split(" ")[0]}</span>
              </Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link to="/join" className="btn btn-primary btn-sm">
                Become a Tutor
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
