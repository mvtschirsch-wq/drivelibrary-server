import { Router } from "express";
import { getAll } from "../db.js";

const router = Router();

router.get("/export.csv", (_req, res) => {
  const rows = getAll();
  const headers = [
    "fileId","title","author","path","driveLink","rating","tags","notes","createdAt","fileType","dateAdded"
  ];
  const lines = [
    headers.join(","),
    ...rows.map(r => {
      const vals = [
        r.fileId,
        r.title?.replace(/"/g, '""') || "",
        r.author?.replace(/"/g, '""') || "",
        r.path?.replace(/"/g, '""') || "",
        r.driveLink || "",
        r.rating || "",
        (r.tags || []).join("|").replace(/"/g, '""'),
        (r.notes || "").replace(/"/g, '""'),
        String(r.createdAt || ""),
        r.fileType || "",
        r.dateAdded || ""
      ];
      return vals.map(v => `"${v}"`).join(",");
    })
  ];
  res.setHeader("Content-Type", "text/csv");
  res.send(lines.join("\n"));
});

export default router;
