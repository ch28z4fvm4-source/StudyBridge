import { Router } from "express";
import { sendTutorHelpRequestEmail } from "../email.js";
import { addRequest, tutorsForSubject } from "../db.js";
import { requireAuth, type AuthedRequest } from "../security.js";

export const notificationsRouter = Router();

notificationsRouter.post("/help-request", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const { subject, description, urgency } = req.body as {
    subject?: string;
    description?: string;
    urgency?: string;
  };

  if (!subject || !description) {
    res.status(400).json({ error: "Subject and description are required." });
    return;
  }

  const topic = description.slice(0, 4000);

  addRequest({
    studentName: user.name,
    studentEmail: user.email,
    subject,
    topic,
    urgency: urgency === "high" || urgency === "low" ? urgency : "medium",
  });

  const tutors = tutorsForSubject(subject);

  if (tutors.length === 0) {
    res.json({
      ok: true,
      notified: 0,
      tutors: [],
      message: "No available tutors matched that subject. Request saved — check back soon.",
    });
    return;
  }

  const urgencyLabel =
    urgency === "high" ? "Today" : urgency === "medium" ? "Within 2 days" : "This week";

  const results = await Promise.allSettled(
    tutors.map((tutor) =>
      sendTutorHelpRequestEmail(tutor.email, tutor.name, {
        studentName: user.name,
        subject,
        description: topic,
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
    studentConfirmationSent: true,
  });
});
