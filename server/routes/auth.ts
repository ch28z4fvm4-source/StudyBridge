import { Router } from "express";
import {
  createUser,
  findUserByEmail,
  publicUser,
  upsertTutorProfile,
  verifyPassword,
  type UserRole,
} from "../db.js";
import {
  generateCode,
  hasWelcomeBeenSent,
  markWelcomeSent,
  setTwoFactorCode,
  verifyTwoFactorCode,
} from "../store.js";
import { sendTwoFactorEmail, sendWelcomeEmail } from "../email.js";

export const authRouter = Router();

function isRole(value: unknown): value is UserRole {
  return value === "student" || value === "tutor";
}

authRouter.post("/signup", async (req, res) => {
  const { name, email, password, role, grade, subjects, bio } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    grade?: string;
    subjects?: string[];
    bio?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: "Name, email, and password are required." });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters." });
    return;
  }

  const chosenRole: UserRole = isRole(role) ? role : "student";

  if (chosenRole === "tutor") {
    if (!Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ error: "Pick at least one subject you can tutor." });
      return;
    }
    if (!bio?.trim()) {
      res.status(400).json({ error: "Add a short bio so students know how you help." });
      return;
    }
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      role: chosenRole,
    });

    if (chosenRole === "tutor") {
      upsertTutorProfile({
        userId: user.id,
        name: user.name,
        email: user.email,
        grade: grade?.trim() || "Tutor",
        subjects,
        bio: bio ?? "",
      });
    }

    try {
      if (!hasWelcomeBeenSent(user.email)) {
        await sendWelcomeEmail(user.email, user.name, chosenRole);
        markWelcomeSent(user.email);
      }
    } catch (err) {
      console.error("Welcome email failed:", err);
    }

    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : "Could not create account." });
  }
});

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "No account with that email. Sign up to get started." });
    return;
  }

  const ok = await verifyPassword(password, user.salt, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Incorrect password." });
    return;
  }

  res.json({ ok: true, user: publicUser(user) });
});

authRouter.post("/become-tutor", async (req, res) => {
  const { userId, name, email, grade, subjects, bio } = req.body as {
    userId?: string;
    name?: string;
    email?: string;
    grade?: string;
    subjects?: string[];
    bio?: string;
  };

  if (!userId || !name || !email) {
    res.status(400).json({ error: "Account details are required." });
    return;
  }

  if (!Array.isArray(subjects) || subjects.length === 0 || !bio?.trim()) {
    res.status(400).json({ error: "Subjects and a short bio are required." });
    return;
  }

  const tutor = upsertTutorProfile({
    userId,
    name,
    email,
    grade: grade ?? "Tutor",
    subjects,
    bio,
  });

  res.json({ ok: true, tutor, role: "tutor" });
});

authRouter.post("/send-2fa", async (req, res) => {
  const { email, name } = req.body as { email?: string; name?: string };

  if (!email || !name) {
    res.status(400).json({ error: "Email and name are required." });
    return;
  }

  const code = generateCode();
  setTwoFactorCode(email, code);

  try {
    const result = await sendTwoFactorEmail(email, name, code);
    res.json({
      ok: true,
      message: `Verification code sent to ${email}`,
      devCode: result.devPreview ? code : undefined,
    });
  } catch (err) {
    console.error("Failed to send 2FA email:", err);
    res.status(500).json({ error: "Could not send verification email. Try again." });
  }
});

authRouter.post("/verify-2fa", async (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };

  if (!email || !code) {
    res.status(400).json({ error: "Email and code are required." });
    return;
  }

  const result = verifyTwoFactorCode(email, code);
  if (!result.ok) {
    res.status(401).json({ error: result.error });
    return;
  }

  res.json({ ok: true, verified: true });
});

authRouter.post("/welcome", async (req, res) => {
  const { email, name, role } = req.body as {
    email?: string;
    name?: string;
    role?: "student" | "tutor";
  };

  if (!email || !name || !role) {
    res.status(400).json({ error: "Email, name, and role are required." });
    return;
  }

  if (hasWelcomeBeenSent(email)) {
    res.json({ ok: true, message: "Welcome email already sent." });
    return;
  }

  try {
    await sendWelcomeEmail(email, name, role);
    markWelcomeSent(email);
    res.json({ ok: true, message: `Welcome email sent to ${email}` });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    res.status(500).json({ error: "Could not send welcome email." });
  }
});
