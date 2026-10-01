import { Router } from "express";
import {
  createUser,
  deleteUser,
  findUserByEmail,
  findUserById,
  markEmailVerified,
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
import {
  assertRealEmail,
  createSessionToken,
  publicTutor,
  rateLimit,
  requireAuth,
  requireVerified,
  type AuthedRequest,
} from "../security.js";

export const authRouter = Router();
const authLimit = rateLimit(10, 15 * 60 * 1000);
const isProd = process.env.NODE_ENV === "production";

function isRole(value: unknown): value is UserRole {
  return value === "student" || value === "tutor";
}

authRouter.post("/signup", authLimit, async (req, res) => {
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
    await assertRealEmail(email);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "That email address does not exist." });
    return;
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

    const code = generateCode();
    setTwoFactorCode(user.email, code);

    try {
      const result = await sendTwoFactorEmail(user.email, user.name, code);
      if (!result.sent && process.env.SMTP_HOST) {
        deleteUser(user.id);
        res.status(400).json({ error: "That inbox could not receive a verification code. Use a real email." });
        return;
      }
    } catch (err) {
      console.error("Verification email failed:", err);
      deleteUser(user.id);
      res.status(400).json({ error: "That inbox could not receive a verification code. Use a real email." });
      return;
    }

    res.json({ ok: true, user: publicUser(user), token: createSessionToken(user) });
  } catch (err) {
    res.status(409).json({ error: err instanceof Error ? err.message : "Could not create account." });
  }
});

authRouter.post("/login", authLimit, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const user = findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.salt, user.passwordHash))) {
    res.status(401).json({ error: "Incorrect email or password." });
    return;
  }

  res.json({ ok: true, user: publicUser(user), token: createSessionToken(user) });
});

authRouter.post("/become-tutor", requireVerified, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const { grade, subjects, bio } = req.body as {
    grade?: string;
    subjects?: string[];
    bio?: string;
  };

  if (!Array.isArray(subjects) || subjects.length === 0 || !bio?.trim()) {
    res.status(400).json({ error: "Subjects and a short bio are required." });
    return;
  }

  const tutor = upsertTutorProfile({
    userId: user.id,
    name: user.name,
    email: user.email,
    grade: grade ?? "Tutor",
    subjects,
    bio,
  });

  res.json({
    ok: true,
    tutor: publicTutor(tutor),
    role: "tutor",
    token: createSessionToken({ id: user.id, email: user.email }),
  });
});

authRouter.post("/send-2fa", authLimit, requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const code = generateCode();
  setTwoFactorCode(user.email, code);

  try {
    const result = await sendTwoFactorEmail(user.email, user.name, code);
    res.json({
      ok: true,
      message: "Verification code sent.",
      devCode: !isProd && result.devPreview ? code : undefined,
    });
  } catch (err) {
    console.error("Failed to send 2FA email:", err);
    res.status(500).json({ error: "Could not send verification email. Try again." });
  }
});

authRouter.post("/verify-2fa", authLimit, requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const { code } = req.body as { code?: string };
  if (!code) {
    res.status(400).json({ error: "Code is required." });
    return;
  }

  const result = verifyTwoFactorCode(user.email, code);
  if (!result.ok) {
    res.status(401).json({ error: result.error });
    return;
  }

  markEmailVerified(user.id);
  const verified = findUserById(user.id);
  res.json({
    ok: true,
    verified: true,
    user: verified ? publicUser(verified) : undefined,
    token: createSessionToken({ id: user.id, email: user.email }),
  });
});

authRouter.post("/welcome", requireAuth, async (req: AuthedRequest, res) => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }

  const { role } = req.body as { role?: "student" | "tutor" };
  if (!role) {
    res.status(400).json({ error: "Role is required." });
    return;
  }

  if (hasWelcomeBeenSent(user.email)) {
    res.json({ ok: true, message: "Welcome email already sent." });
    return;
  }

  try {
    await sendWelcomeEmail(user.email, user.name, role);
    markWelcomeSent(user.email);
    res.json({ ok: true, message: "Welcome email sent." });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    res.status(500).json({ error: "Could not send welcome email." });
  }
});
