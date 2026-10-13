export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const ACCEPT = ALLOWED_TYPES.join(",");
export const MAX_SIZE = 5 * 1024 * 1024;

export function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return "Only JPG, PNG, GIF or WebP images";
  if (file.size > MAX_SIZE) return "Image must be under 5 MB";
  return "";
}