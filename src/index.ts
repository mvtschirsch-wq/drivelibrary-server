import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import nodeCron from "node-cron";
import { getAuthUrl, exchangeCode, initToken } from "./auth.js";
import scanRouter from "./routes/scan.js";
import libraryRouter from "./routes/library.js";
import exportRouter from "./routes/export.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_, res) => res.send("DriveLibrary server running"));

app.get("/oauth2/start", (_req, res) => {
  res.redirect(getAuthUrl());
});

app.get("/oauth2/callback", async (req, res) => {
  const code = String(req.query.code || "");
  if (!code) return res.status(400).send("Missing code");
  try {
    await exchangeCode(code);
    res.send("Auth successful. You can close this tab and use the app.");
  } catch (e: any) {
    res.status(500).send("Auth failed: " + e.message);
  }
});

app.use(scanRouter);
app.use(libraryRouter);
app.use(exportRouter);

const port = Number(process.env.PORT || 4000);
initToken().then((ok) => {
  const schedule = process.env.CRON_SCHEDULE;
  if (ok && schedule) {
    nodeCron.schedule(schedule, async () => {
      console.log("Running scheduled scan...");
      const { scanFolder } = await import("./drive.js");
      await scanFolder(process.env.DRIVE_FOLDER_ID!);
      console.log("Scheduled scan done.");
    });
  }
  app.listen(port, () => console.log(`Server on port ${port}`));
});
