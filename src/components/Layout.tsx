import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  showFooter?: boolean;
}

export default function Layout({ showFooter = true }: LayoutProps) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
