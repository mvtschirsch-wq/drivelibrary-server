const pdfExt = /\.pdf$/i;
const epubExt = /\.epub$/i;
const docExt = /\.(docx?|gdoc)$/i;

export function inferType(name: string): "pdf" | "epub" | "doc" | "other" {
  if (pdfExt.test(name)) return "pdf";
  if (epubExt.test(name)) return "epub";
  if (docExt.test(name)) return "doc";
  return "other";
}

export function extractTitleAuthor(filename: string) {
  const base = filename.replace(/\.[^/.]+$/, "");
  let title = base;
  let author = "";

  const pattern1 = /^(.+?)\s*-\s*(.+)$/;       // Author - Title
  const pattern2 = /^(.+?)\s*\((.+?)\)$/;      // Title (Author)

  if (pattern1.test(base)) {
    const m = base.match(pattern1)!;
    author = m[1].trim();
    title = m[2].trim();
  } else if (pattern2.test(base)) {
    const m = base.match(pattern2)!;
    title = m[1].trim();
    author = m[2].trim();
  } else {
    title = base.trim();
  }
  return { title, author };
}
