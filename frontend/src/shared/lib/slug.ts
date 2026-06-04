/** Chuẩn hóa slug URL (khớp backend). */
export function normalizeProductSlug(raw: string): string {
  let s = String(raw).trim().toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/đ/g, "d");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  return s;
}
