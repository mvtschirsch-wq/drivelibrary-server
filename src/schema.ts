export type LibraryEntry = {
  fileId: string;
  title: string;
  author: string;
  path: string;
  driveLink: string;
  rating: string | null;
  tags: string[];
  notes: string | null;
  createdAt: number;
  fileType: string;
  dateAdded: string | null;
};

export const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS library (
  fileId TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  path TEXT,
  driveLink TEXT NOT NULL,
  rating TEXT,
  tags TEXT,
  notes TEXT,
  createdAt INTEGER NOT NULL,
  fileType TEXT NOT NULL,
  dateAdded TEXT
);
`;
