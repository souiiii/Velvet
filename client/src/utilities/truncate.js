export default function truncateFilename(filename, maxLength = 28) {
  if (!filename) return "";

  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) {
    return filename.length > maxLength
      ? filename.slice(0, maxLength - 1) + "…"
      : filename;
  }

  const name = filename.slice(0, lastDot);
  const ext = filename.slice(lastDot);

  if (filename.length <= maxLength) return filename;

  const allowedNameLength = maxLength - ext.length - 1;
  return name.slice(0, allowedNameLength) + "…" + ext;
}
