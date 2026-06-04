/** Chuẩn hóa slug URL: chữ thường, số, gạch — hỗ trợ bỏ dấu tiếng Việt. */
export function normalizeProductSlug(raw: string): string {
  let s = String(raw).trim().toLowerCase();
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/đ/g, "d");
  s = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-");
  return s;
}
