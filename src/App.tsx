import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import TutorDashboard from "./pages/TutorDashboard";
import Chat from "./pages/Chat";
import VolunteerHours from "./pages/VolunteerHours";
import BrowseTutors from "./pages/BrowseTutors";
import TutorProfile from "./pages/TutorProfile";
import RequestHelp from "./pages/RequestHelp";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import JoinAsTutor from "./pages/JoinAsTutor";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout showFooter={false} />}>
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<JoinAsTutor />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/tutors" element={<BrowseTutors />} />
        <Route path="/tutors/:tutorId" element={<TutorProfile />} />
        <Route
          path="/request"
          element={
            <ProtectedRoute>
              <RequestHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tutor"
          element={
            <ProtectedRoute>
              <TutorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hours"
          element={
            <ProtectedRoute>
              <VolunteerHours />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
