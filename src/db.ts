import Database from "better-sqlite3";
import { CREATE_TABLE_SQL, LibraryEntry } from "./schema.js";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import dotenv from "dotenv";
dotenv.config();

const dbPath = process.env.DB_PATH || "./drivelibrary.sqlite";
if (!existsSync(dirname(dbPath))) mkdirSync(dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.exec(CREATE_TABLE_SQL);

const upsertStmt = db.prepare(`
INSERT INTO library (fileId, title, author, path, driveLink, rating, tags, notes, createdAt, fileType, dateAdded)
VALUES (@fileId, @title, @author, @path, @driveLink, @rating, @tags, @notes, @createdAt, @fileType, @dateAdded)
ON CONFLICT(fileId) DO UPDATE SET
  title=excluded.title,
  author=excluded.author,
  path=excluded.path,
  driveLink=excluded.driveLink,
  fileType=excluded.fileType,
  dateAdded=excluded.dateAdded
`);

export function upsertEntry(entry: LibraryEntry) {
  const payload = { ...entry, tags: JSON.stringify(entry.tags || []) };
  upsertStmt.run(payload);
}

export function setUserFields(fileId: string, fields: Partial<Pick<LibraryEntry, "tags" | "notes" | "rating">>) {
  const stmt = db.prepare(`
    UPDATE library SET
      tags = COALESCE(@tags, tags),
      notes = COALESCE(@notes, notes),
      rating = COALESCE(@rating, rating)
    WHERE fileId = @fileId
  `);
  stmt.run({
    fileId,
    tags: fields.tags ? JSON.stringify(fields.tags) : undefined,
    notes: fields.notes,
    rating: fields.rating
  });
}

export function getAll() {
  const rows = db.prepare("SELECT * FROM library ORDER BY title COLLATE NOCASE").all();
  return rows.map((r: any) => ({ ...r, tags: r.tags ? JSON.parse(r.tags) : [] })) as LibraryEntry[];
}

export function getById(fileId: string) {
  const r = db.prepare("SELECT * FROM library WHERE fileId = ?").get(fileId);
  return r ? { ...r, tags: r.tags ? JSON.parse(r.tags) : [] } as LibraryEntry : null;
}
