import express from "express";
import cors from "cors";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { authRouter } from "./routes/auth.js";
import { notificationsRouter } from "./routes/notifications.js";
import { platformRouter } from "./routes/platform.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set("trust proxy", 1);
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: [
      "https://www.joinstudybridge.academy",
      "https://joinstudybridge.academy",
      "https://studybridge-ejsf.onrender.com",
      "http://127.0.0.1:5173",
      "http://localhost:5173",
    ],
  }),
);
app.use(express.json({ limit: "32kb" }));
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, emailMode: process.env.SMTP_HOST ? "smtp" : "dev-console" });
});

app.use("/api/auth", authRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api", platformRouter);

app.get("/googleee422880ffd0b347.html", (_req, res) => {
  res
    .type("text/html")
    .send("google-site-verification: googleee422880ffd0b347.html");
});

if (isProd) {
  const distPath = path.join(__dirname, "../dist");
  if (existsSync(distPath)) {
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`StudyBridge running at http://0.0.0.0:${PORT}`);
});
