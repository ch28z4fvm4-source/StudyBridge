/** In-memory stores — replace with Redis/DB in production */

interface CodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const twoFactorCodes = new Map<string, CodeEntry>();
const welcomeSent = new Set<string>();

export function setTwoFactorCode(email: string, code: string, ttlMs = 10 * 60 * 1000) {
  twoFactorCodes.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + ttlMs,
    attempts: 0,
  });
}

export function verifyTwoFactorCode(email: string, code: string): { ok: boolean; error?: string } {
  const key = email.toLowerCase();
  const entry = twoFactorCodes.get(key);

  if (!entry) {
    return { ok: false, error: "No code found. Request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    twoFactorCodes.delete(key);
    return { ok: false, error: "Code expired. Request a new one." };
  }

  if (entry.attempts >= 5) {
    twoFactorCodes.delete(key);
    return { ok: false, error: "Too many attempts. Request a new code." };
  }

  entry.attempts += 1;

  if (entry.code !== code.trim()) {
    return { ok: false, error: "Incorrect code. Try again." };
  }

  twoFactorCodes.delete(key);
  return { ok: true };
}

export function markWelcomeSent(email: string) {
  welcomeSent.add(email.toLowerCase());
}

export function hasWelcomeBeenSent(email: string): boolean {
  return welcomeSent.has(email.toLowerCase());
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
