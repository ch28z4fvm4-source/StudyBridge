import { Router } from "express";
import { sendTutorHelpRequestEmail } from "../email.js";
import { addRequest, tutorsForSubject } from "../db.js";

export const notificationsRouter = Router();

notificationsRouter.post("/help-request", async (req, res) => {
  const { studentName, studentEmail, subject, description, urgency } = req.body as {
    studentName?: string;
    studentEmail?: string;
    subject?: string;
    description?: string;
    urgency?: string;
  };

  if (!studentName || !subject || !description) {
    res.status(400).json({ error: "Student name, subject, and description are required." });
    return;
  }

  addRequest({
    studentName,
    studentEmail: studentEmail ?? "",
    subject,
    topic: description,
    urgency: urgency === "high" || urgency === "low" ? urgency : "medium",
  });

  const tutors = tutorsForSubject(subject);

  if (tutors.length === 0) {
    res.json({
      ok: true,
      notified: 0,
      message: "No available tutors matched that subject. Request saved — check back soon.",
    });
    return;
  }

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
    notified,
    tutors: tutors.map((t) => t.name),
    message: `${notified} tutor${notified === 1 ? "" : "s"} emailed about your ${subject} request.`,
    studentConfirmationSent: Boolean(studentEmail),
  });
});
