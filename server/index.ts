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
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === "production";

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, emailMode: process.env.SMTP_HOST ? "smtp" : "dev-console" });
});

app.use("/api/auth", authRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api", platformRouter);

if (isProd) {
  const distPath = path.join(__dirname, "../dist");
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`StudyBridge running at http://0.0.0.0:${PORT}`);
});
