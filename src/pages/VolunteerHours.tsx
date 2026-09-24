import { useAuth } from "../context/AuthContext";

function downloadReport(name: string) {
  const rows = [
    ["StudyBridge — Volunteer Service Report"],
    ["Tutor", name],
    ["Generated", new Date().toLocaleDateString()],
    [""],
    ["Total Hours", "0"],
    ["Verified Hours", "0"],
    ["Pending Verification", "0"],
    [""],
    ["Date", "Student", "Subject", "Hours", "Verified"],
  ];

  const csv = rows.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "studybridge-volunteer-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function VolunteerHours() {
  const { user } = useAuth();

  return (
    <div className="hours-page">
      <div className="hours-header">
        <div>
          <h1>Volunteer Hours</h1>
          <p>Log sessions as you complete them. Download a report for school or NHS requirements.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => downloadReport(user?.name ?? "Tutor")}>
          Download Service Report
        </button>
      </div>

      <div className="hours-summary">
        <div className="hours-card hours-card-primary">
          <span className="hours-card-label">Total hours</span>
          <span className="hours-card-value">0</span>
          <span className="hours-card-sub">No sessions logged yet</span>
        </div>
        <div className="hours-card">
          <span className="hours-card-label">Verified hours</span>
          <span className="hours-card-value">0</span>
          <span className="hours-card-sub">Verified after a session</span>
        </div>
        <div className="hours-card">
          <span className="hours-card-label">Pending verification</span>
          <span className="hours-card-value">0</span>
          <span className="hours-card-sub">Usually verified within 48 hrs</span>
        </div>
      </div>

      <section className="hours-sessions">
        <h2>Session Log</h2>
        <p className="dash-card-text">
          After you tutor someone, hours will show up here. Until then, your report downloads with a
          clean log you can add to as you go.
        </p>
      </section>
    </div>
  );
}
