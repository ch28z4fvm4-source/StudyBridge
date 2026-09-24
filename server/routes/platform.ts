import { Router } from "express";
import { addRequest, listRequests, listTutors, metrics, getTutor, tutorsForSubject } from "../db.js";
import { sendTutorHelpRequestEmail } from "../email.js";

export const platformRouter = Router();

platformRouter.get("/tutors", (_req, res) => {
  res.json({ tutors: listTutors() });
});

platformRouter.get("/tutors/:id", (req, res) => {
  const tutor = getTutor(req.params.id);
  if (!tutor) {
    res.status(404).json({ error: "Tutor not found." });
    return;
  }
  res.json({ tutor });
});

platformRouter.get("/requests", (_req, res) => {
  res.json({ requests: listRequests() });
});

platformRouter.get("/metrics", (_req, res) => {
  res.json(metrics());
});

platformRouter.post("/requests", async (req, res) => {
  const { studentName, studentEmail, subject, description, urgency } = req.body as {
    studentName?: string;
    studentEmail?: string;
    subject?: string;
    description?: string;
    urgency?: "low" | "medium" | "high";
  };

  if (!studentName || !studentEmail || !subject || !description) {
    res.status(400).json({ error: "Name, email, subject, and description are required." });
    return;
  }

  const request = addRequest({
    studentName,
    studentEmail,
    subject,
    topic: description,
    urgency: urgency ?? "medium",
  });

  const tutors = tutorsForSubject(subject);
  const urgencyLabel =
    urgency === "high" ? "Today" : urgency === "medium" ? "Within 2 days" : "This week";

  const results = await Promise.allSettled(
    tutors.map((tutor) =>
      sendTutorHelpRequestEmail(tutor.email, tutor.name, {
        studentName,
        subject,
        description,
        urgency: urgencyLabel,
      }),
    ),
  );

  const notified = results.filter((r) => r.status === "fulfilled").length;

  res.json({
    ok: true,
    request,
    notified,
    tutors: tutors.map((t) => t.name),
    message:
      notified > 0
        ? `${notified} tutor${notified === 1 ? "" : "s"} notified about your ${subject} request.`
        : "Request posted. Tutors who teach this subject will see it on their dashboard.",
  });
});
