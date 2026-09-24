import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCb);
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, "data");
const dbPath = resolve(dataDir, "db.json");

export type UserRole = "student" | "tutor";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  picture?: string;
  createdAt: string;
}

export interface TutorRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  grade: string;
  subjects: string[];
  bio: string;
  hours: number;
  rating: number;
  studentsHelped: number;
  avatar: string;
  available: boolean;
  founder?: boolean;
}

export interface HelpRequestRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  topic: string;
  urgency: "low" | "medium" | "high";
  requestedAt: string;
  createdAt: number;
}

interface Database {
  users: UserRecord[];
  tutors: TutorRecord[];
  requests: HelpRequestRecord[];
}

const founderTutor: TutorRecord = {
  id: "founder",
  userId: "founder",
  name: "Evan Peterson",
  email: "evan@joinstudybridge.academy",
  grade: "Founder",
  subjects: ["Algebra II", "English", "Study Skills"],
  bio: "I founded StudyBridge so any student can get free help — and anyone can sign up to tutor. Message me if you're stuck or want to help grow the network.",
  hours: 0,
  rating: 5,
  studentsHelped: 0,
  avatar: "EP",
  available: true,
  founder: true,
};

function emptyDb(): Database {
  return { users: [], tutors: [founderTutor], requests: [] };
}

function load(): Database {
  if (!existsSync(dbPath)) {
    mkdirSync(dataDir, { recursive: true });
    const initial = emptyDb();
    writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }

  try {
    const parsed = JSON.parse(readFileSync(dbPath, "utf8")) as Partial<Database>;
    const db: Database = {
      users: parsed.users ?? [],
      tutors: parsed.tutors ?? [],
      requests: parsed.requests ?? [],
    };
    if (!db.tutors.some((t) => t.id === "founder")) {
      db.tutors.unshift(founderTutor);
      save(db);
    }
    return db;
  } catch {
    return emptyDb();
  }
}

function save(db: Database) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, hash: derived.toString("hex") };
}

export async function verifyPassword(password: string, salt: string, hash: string): Promise<boolean> {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(hash, "hex");
  if (derived.length !== stored.length) return false;
  return timingSafeEqual(derived, stored);
}

export function publicUser(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    role: user.role,
    provider: "email" as const,
    emailVerified: true,
  };
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return load().users.find((u) => u.email === email.toLowerCase().trim());
}

export function findUserById(id: string): UserRecord | undefined {
  return load().users.find((u) => u.id === id);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserRecord> {
  const db = load();
  const email = input.email.toLowerCase().trim();
  if (db.users.some((u) => u.email === email)) {
    throw new Error("An account with that email already exists.");
  }

  const { hash, salt } = await hashPassword(input.password);
  const user: UserRecord = {
    id: randomBytes(8).toString("hex"),
    name: input.name.trim(),
    email,
    passwordHash: hash,
    salt,
    role: input.role,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  save(db);
  return user;
}

export function upsertTutorProfile(input: {
  userId: string;
  name: string;
  email: string;
  grade: string;
  subjects: string[];
  bio: string;
}): TutorRecord {
  const db = load();
  const existing = db.tutors.find((t) => t.userId === input.userId && t.id !== "founder");
  const record: TutorRecord = {
    id: existing?.id ?? input.userId,
    userId: input.userId,
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    grade: input.grade.trim() || "Tutor",
    subjects: input.subjects,
    bio: input.bio.trim(),
    hours: existing?.hours ?? 0,
    rating: existing?.rating ?? 5,
    studentsHelped: existing?.studentsHelped ?? 0,
    avatar: initials(input.name),
    available: true,
    founder: existing?.founder,
  };

  if (existing) {
    Object.assign(existing, record);
  } else {
    db.tutors.push(record);
  }

  const user = db.users.find((u) => u.id === input.userId);
  if (user) user.role = "tutor";

  save(db);
  return record;
}

export function listTutors(): TutorRecord[] {
  return load().tutors;
}

export function getTutor(id: string): TutorRecord | undefined {
  return load().tutors.find((t) => t.id === id);
}

export function listRequests(): HelpRequestRecord[] {
  return load()
    .requests.slice()
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addRequest(input: {
  studentName: string;
  studentEmail: string;
  subject: string;
  topic: string;
  urgency: "low" | "medium" | "high";
}): HelpRequestRecord {
  const db = load();
  const request: HelpRequestRecord = {
    id: randomBytes(6).toString("hex"),
    studentName: input.studentName.trim(),
    studentEmail: input.studentEmail.toLowerCase().trim(),
    subject: input.subject,
    topic: input.topic.trim(),
    urgency: input.urgency,
    requestedAt: "just now",
    createdAt: Date.now(),
  };
  db.requests.unshift(request);
  save(db);
  return request;
}

export function tutorsForSubject(subject: string): TutorRecord[] {
  return listTutors().filter(
    (t) => t.available && t.subjects.some((s) => s.toLowerCase() === subject.toLowerCase()),
  );
}

export function metrics() {
  const db = load();
  return {
    studentsHelped: db.users.filter((u) => u.role === "student").length,
    tutorsActive: db.tutors.filter((t) => t.available).length,
    volunteerHours: db.tutors.reduce((sum, t) => sum + t.hours, 0),
    requestsOpen: db.requests.length,
  };
}
