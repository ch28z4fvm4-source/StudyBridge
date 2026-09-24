import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const fromAddress = process.env.EMAIL_FROM ?? "StudyBridge <noreply@joinstudybridge.academy>";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export interface SendResult {
  sent: boolean;
  devPreview?: string;
}

async function deliver(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const transport = getTransporter();

  if (!transport) {
    const preview = `\n📧 [DEV EMAIL]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`;
    console.log(preview);
    return { sent: false, devPreview: text };
  }

  await transport.sendMail({ from: fromAddress, to, subject, html, text });
  return { sent: true };
}

export async function sendTwoFactorEmail(to: string, name: string, code: string): Promise<SendResult> {
  const subject = `${code} is your StudyBridge verification code`;
  const text = `Hi ${name},\n\nYour StudyBridge sign-in code is: ${code}\n\nThis code expires in 10 minutes. If you didn't try to sign in, you can ignore this email.\n\n— StudyBridge`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;color:#1b2838">
      <p>Hi ${name},</p>
      <p>Enter this code to finish signing in to StudyBridge:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:0.25em;color:#2d6a4f;margin:24px 0">${code}</p>
      <p style="color:#5c6778;font-size:14px">Expires in 10 minutes. Didn't request this? Ignore this email.</p>
      <p style="color:#8b95a5;font-size:12px;margin-top:32px">— StudyBridge</p>
    </div>`;

  return deliver(to, subject, html, text);
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  role: "student" | "tutor",
): Promise<SendResult> {
  const first = name.split(" ")[0];
  const isTutor = role === "tutor";

  const subject = isTutor
    ? `Welcome to StudyBridge, ${first} — you're set up as a tutor`
    : `Welcome to StudyBridge, ${first}`;

  const text = isTutor
    ? `Hi ${first},\n\nYour StudyBridge tutor account is ready. You'll get email alerts when any student posts a help request in your subjects — they don't have to go to your school.\n\nLog in to accept requests, message students, and log volunteer hours.\n\n— StudyBridge`
    : `Hi ${first},\n\nYour StudyBridge account is ready. Browse tutors from anywhere, post help requests, and join sessions for free.\n\n— StudyBridge`;

  const html = isTutor
    ? `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1b2838">
        <h1 style="font-size:22px;color:#1b2838">You're in, ${first}.</h1>
        <p>Your tutor account is active. Here's what happens next:</p>
        <ul style="line-height:1.7;color:#5c6778">
          <li>We'll email you when any student needs help in your subjects</li>
          <li>Accept requests from your tutor dashboard</li>
          <li>Verified hours count toward service requirements</li>
        </ul>
        <p style="color:#8b95a5;font-size:12px;margin-top:28px">— StudyBridge</p>
      </div>`
    : `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1b2838">
        <h1 style="font-size:22px;color:#1b2838">Welcome, ${first}.</h1>
        <p>Your StudyBridge account is ready. Browse tutors from anywhere and post help requests — every session is free.</p>
        <p style="color:#8b95a5;font-size:12px;margin-top:28px">— StudyBridge</p>
      </div>`;

  return deliver(to, subject, html, text);
}

export async function sendTutorHelpRequestEmail(
  tutorEmail: string,
  tutorName: string,
  payload: {
    studentName: string;
    subject: string;
    description: string;
    urgency: string;
  },
): Promise<SendResult> {
  const subject = `Help request: ${payload.subject} — ${payload.studentName}`;
  const text = `Hi ${tutorName.split(" ")[0]},\n\nA student needs tutoring help:\n\nStudent: ${payload.studentName}\nSubject: ${payload.subject}\nUrgency: ${payload.urgency}\n\nDetails:\n${payload.description}\n\nLog in to StudyBridge to accept this request.\n\n— StudyBridge`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1b2838">
      <p style="font-size:13px;color:#2d6a4f;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">New help request</p>
      <h1 style="font-size:20px;margin:8px 0 16px">${payload.subject}</h1>
      <table style="width:100%;font-size:14px;color:#5c6778;margin-bottom:16px">
        <tr><td style="padding:4px 0"><strong>Student</strong></td><td>${payload.studentName}</td></tr>
        <tr><td style="padding:4px 0"><strong>Urgency</strong></td><td>${payload.urgency}</td></tr>
      </table>
      <p style="background:#f3f1ec;padding:12px;border-radius:8px;line-height:1.5;font-size:14px">${payload.description}</p>
      <p style="font-size:14px;margin-top:20px">Accept this request from your <strong>tutor dashboard</strong>.</p>
      <p style="color:#8b95a5;font-size:12px;margin-top:28px">— StudyBridge</p>
    </div>`;

  return deliver(tutorEmail, subject, html, text);
}
