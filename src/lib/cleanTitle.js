// src/lib/cleanTitle.js
export function cleanTitle(text) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/(?:^|\s)decrypt\.co\/\S+/gi, "")
    .replace(/\bDecrypt\b[.:]?\s*/gi, "")
    .replace(/[.…]+$/, "")
    .trim();
}
