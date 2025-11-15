import { Router } from "express";
import { getAll, getById, setUserFields } from "../db.js";

const router = Router();

router.get("/library", (_req, res) => {
  res.json(getAll());
});

router.get("/library/:id", (req, res) => {
  const item = getById(req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.patch("/library/:id", (req, res) => {
  const { rating, tags, notes } = req.body || {};
  setUserFields(req.params.id, { rating, tags, notes });
  res.json({ ok: true });
});

export default router;
