# StudyBridge

A community-driven tutoring network that connects students seeking help with volunteer tutors who earn verified service hours.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

## Sign in (Google & Apple)

Copy `.env.example` to `.env` and add your OAuth credentials:

```bash
cp .env.example .env
```

| Variable | Where to get it |
|----------|-----------------|
| `VITE_GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — OAuth 2.0 Web client. Add `http://127.0.0.1:5173` as an authorized JavaScript origin. |
| `VITE_APPLE_CLIENT_ID` | [Apple Developer](https://developer.apple.com/account/resources/identifiers/list/serviceId) — Services ID with Sign in with Apple enabled. |
| `VITE_APPLE_REDIRECT_URI` | Must match the return URL registered with Apple (default: `http://127.0.0.1:5173/login`). |

**Without OAuth keys**, the login page still works using a local demo sign-in so you can test the full flow.

After sign-in, pick **student** or **tutor** once — your session persists in the browser.

## Email & 2FA

The API server (`npm run dev` starts both web + API) handles:

| Email | When it's sent |
|-------|----------------|
| **2FA code** | After Google/Apple sign-in — 6-digit code, 10 min expiry |
| **Welcome email** | After you pick student or tutor role |
| **Tutor alert** | When a student posts a help request matching the tutor's subject |

Without SMTP configured, emails print to the **API terminal** and the 2FA code appears on the verify screen in dev mode.

Add to `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=StudyBridge <you@gmail.com>
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, live impact metrics, and features |
| `/login` | Role picker (student or tutor) |
| `/tutors` | Browse all tutors |
| `/tutors/:id` | Tutor profile |
| `/request` | Post a help request |
| `/dashboard/tutor` | Tutor dashboard — requests, hours, reviews, badges |
| `/chat` | Discord-style messaging interface |
| `/hours` | Volunteer hours tracking and downloadable service report |

## Tech Stack

- React 19 + TypeScript
- Vite
- React Router

## Design

Warm academic palette with deep navy and forest green accents. Built to feel like a student community initiative — not an AI startup.
