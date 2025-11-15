import { Router } from "express";
import { scanFolder } from "../drive.js";

const router = Router();

router.post("/scan", async (_req, res) => {
  try {
    await scanFolder(process.env.DRIVE_FOLDER_ID!);
    res.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
