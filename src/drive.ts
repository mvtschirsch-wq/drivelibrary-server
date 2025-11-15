import { google } from "googleapis";
import { oauth2Client } from "./auth.js";
import { extractTitleAuthor, inferType } from "./utils/parse.js";
import { upsertEntry } from "./db.js";

const drive = google.drive({ version: "v3", auth: oauth2Client });

async function listChildren(folderId: string) {
  const files: any[] = [];
  let pageToken: string | undefined;
  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, parents, webViewLink, createdTime)",
      pageSize: 1000,
      pageToken
    });
    files.push(...(res.data.files || []));
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);
  return files;
}

async function resolvePath(file: any, cache: Map<string, any>) {
  const names: string[] = [];
  let parents = file.parents || [];
  while (parents.length > 0) {
    const pid = parents[0];
    let p = cache.get(pid);
    if (!p) {
      const r = await drive.files.get({ fileId: pid, fields: "id, name, parents, mimeType" });
      p = r.data;
      cache.set(pid, p);
    }
    names.unshift(p.name || "");
    parents = p.parents || [];
  }
  return names.join("/");
}

export async function scanFolder(rootFolderId: string) {
  const folderQueue = [rootFolderId];
  const folderCache = new Map<string, any>();

  while (folderQueue.length) {
    const fid = folderQueue.shift()!;
    const children = await listChildren(fid);
    for (const f of children) {
      if (f.mimeType === "application/vnd.google-apps.folder") {
        folderQueue.push(f.id);
        continue;
      }
      const path = await resolvePath(f, folderCache);
      const { title, author } = extractTitleAuthor(f.name);
      const fileType = inferType(f.name);

      upsertEntry({
        fileId: f.id,
        title,
        author,
        path,
        driveLink: f.webViewLink,
        rating: null,
        tags: [],
        notes: null,
        createdAt: Date.now(),
        fileType,
        dateAdded: f.createdTime || null
      });
    }
  }
}
