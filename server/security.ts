import type { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { promises as dns } from "dns";
import { findUserById, getSessionSecret, type UserRecord } from "./db.js";

export interface AuthedUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "tutor";
  emailVerified: boolean;
}

export type AuthedRequest = Request & { user?: AuthedUser };

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createSessionToken(user: Pick<UserRecord, "id" | "email">): string {
  const payload = Buffer.from(
    JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString("base64url");
  const sig = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSessionToken(token: string): AuthedUser | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      id?: string;
      exp?: number;
    };
    if (!data.id || !data.exp || Date.now() > data.exp) return null;
    const user = findUserById(data.id);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified !== false,
    };
  } catch {
    return null;
  }
}

export function getBearerUser(req: Request): AuthedUser | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return readSessionToken(header.slice(7).trim());
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = getBearerUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  req.user = user;
  next();
}

export function requireVerified(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = getBearerUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  if (!user.emailVerified) {
    res.status(403).json({ error: "Verify your email first." });
    return;
  }
  req.user = user;
  next();
}

export function requireTutor(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = getBearerUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to continue." });
    return;
  }
  if (!user.emailVerified) {
    res.status(403).json({ error: "Verify your email first." });
    return;
  }
  if (user.role !== "tutor") {
    res.status(403).json({ error: "Tutor access only." });
    return;
  }
  req.user = user;
  next();
}

const hits = new Map<string, { count: number; resetAt: number }>();

const THROW_AWAY_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "trashmail.com",
  "yopmail.com",
]);

export async function assertRealEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)) {
    throw new Error("Enter a valid email address.");
  }
  const domain = trimmed.split("@")[1];
  if (!domain || THROW_AWAY_DOMAINS.has(domain)) {
    throw new Error("Use a real email inbox, not a throwaway address.");
  }
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx.length) {
      throw new Error("That email domain cannot receive mail.");
    }
  } catch (err) {
    if (err instanceof Error && /^(Enter a valid|Use a real|That email domain)/.test(err.message)) {
      throw err;
    }
    const code = typeof err === "object" && err && "code" in err ? String((err as { code?: string }).code) : "";
    if (code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL") {
      throw new Error("That email address does not exist.");
    }
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "EAI_AGAIN") {
      console.warn("MX lookup unavailable; continuing for", domain, code);
      return;
    }
    throw new Error("That email address does not exist.");
  }
}

export function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const current = hits.get(ip);
    if (!current || now > current.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    current.count += 1;
    if (current.count > max) {
      res.status(429).json({ error: "Too many attempts. Wait a few minutes and try again." });
      return;
    }
    next();
  };
}

export function publicTutor<T extends { email?: string }>(tutor: T) {
  const { email: _email, ...rest } = tutor;
  return rest;
}
