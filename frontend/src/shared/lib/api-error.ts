/** Chuẩn hóa Zod flatten() từ backend Express */
export type ZodFlatten = {
  formErrors: string[];
  fieldErrors: Record<string, string[] | undefined>;
};

const FIELD_VI: Record<string, string> = {
  email: "Email",
  password: "Mật khẩu",
  name: "Họ tên",
  phone: "Số điện thoại",
  address: "Địa chỉ giao hàng",
  slug: "Slug URL",
  description: "Mô tả",
  quantity: "Số lượng",
};

function translateZodField(field: string, msg: string): string {
  const label = FIELD_VI[field] ?? field;
  if (/invalid email/i.test(msg)) return `${label} không đúng định dạng.`;
  if (/too small|must contain at least/i.test(msg)) {
    const n = msg.match(/(\d+)/)?.[1];
    if (field === "password") return `Mật khẩu phải có ít nhất ${n ?? 6} ký tự.`;
    if (field === "name") return `Vui lòng nhập ${label.toLowerCase()} (ít nhất ${n ?? 1} ký tự).`;
    if (field === "address") return `Địa chỉ cần ít nhất ${n ?? 5} ký tự.`;
    if (field === "phone") return `Số điện thoại cần ít nhất ${n ?? 8} ký số hoặc ký tự.`;
    return `${label}: nhập ít nhất ${n} ký tự.`;
  }
  if (/too big|must contain at most/i.test(msg)) {
    const n = msg.match(/(\d+)/)?.[1];
    if (field === "quantity") return `Số lượng tối đa là ${n ?? 99}.`;
    return `${label}: không được vượt quá giới hạn.`;
  }
  if (/invalid/i.test(msg) && field === "email") return `${label} không đúng định dạng.`;
  return `${label}: ${msg}`;
}

function formatZodFlatten(details: ZodFlatten): string {
  const parts: string[] = [];
  for (const [field, msgs] of Object.entries(details.fieldErrors ?? {})) {
    if (!msgs?.length) continue;
    for (const m of msgs) parts.push(translateZodField(field, m));
  }
  for (const fe of details.formErrors ?? []) {
    if (fe.trim()) parts.push(fe);
  }
  return parts.length > 0 ? parts.join(" ") : "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
}

/** Đọc body lỗi JSON từ API → một dòng/câu thông báo rõ ràng (tiếng Việt khi có thể). */
export function formatApiErrorBody(data: unknown): string {
  if (data == null || typeof data !== "object") {
    return "Không thực hiện được. Vui lòng thử lại.";
  }
  const o = data as Record<string, unknown>;

  if (o.error === "Validation" && o.details && typeof o.details === "object") {
    return formatZodFlatten(o.details as ZodFlatten);
  }

  const err = o.error ?? o.message;
  if (typeof err === "string") {
    if (err === "Validation") return "Dữ liệu không hợp lệ. Vui lòng kiểm tra các ô nhập.";
    return err;
  }

  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
