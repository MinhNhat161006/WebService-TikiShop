/** Email đơn giản, đủ cho form đăng nhập/đăng ký */
export function isValidEmail(s: string): boolean {
  const t = s.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/** Số điện thoại VN: cho phép +84 / 0 đầu, 8–15 chữ số sau khi normalize */
export function isValidVnPhone(s: string): boolean {
  const digits = s.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 11;
}

export type LoginFieldErrors = Partial<Record<"email" | "password", string>>;
export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const out: LoginFieldErrors = {};
  const em = email.trim();
  if (!em) out.email = "Vui lòng nhập email.";
  else if (!isValidEmail(em)) out.email = "Email không đúng định dạng (ví dụ: ban@email.com).";
  if (!password) out.password = "Vui lòng nhập mật khẩu.";
  return out;
}

export type RegisterFieldErrors = Partial<Record<"name" | "email" | "password" | "phone", string>>;
export function validateRegisterFields(
  name: string,
  email: string,
  password: string,
  phone: string
): RegisterFieldErrors {
  const out: RegisterFieldErrors = {};
  if (!name.trim()) out.name = "Vui lòng nhập họ tên.";
  const em = email.trim();
  if (!em) out.email = "Vui lòng nhập email.";
  else if (!isValidEmail(em)) out.email = "Email không đúng định dạng.";
  if (!password) out.password = "Vui lòng nhập mật khẩu.";
  else if (password.length < 6) out.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  const ph = phone.trim();
  if (ph && !isValidVnPhone(ph)) {
    out.phone = "Số điện thoại không hợp lệ (nhập 8–11 chữ số, có thể bắt đầu bằng 0).";
  }
  return out;
}

export type CheckoutFieldErrors = Partial<Record<"address" | "phone", string>>;
export function validateCheckoutFields(address: string, phone: string): CheckoutFieldErrors {
  const out: CheckoutFieldErrors = {};
  const ad = address.trim();
  if (!ad) out.address = "Vui lòng nhập địa chỉ giao hàng.";
  else if (ad.length < 5)
    out.address = "Địa chỉ quá ngắn — ghi rõ số nhà, đường, phường/quận (ít nhất 5 ký tự).";
  const ph = phone.trim().replace(/\s/g, "");
  if (!ph) out.phone = "Vui lòng nhập số điện thoại liên hệ.";
  else if (!isValidVnPhone(ph)) out.phone = "Số điện thoại không hợp lệ (cần ít nhất 8 chữ số).";
  return out;
}

export type AccountFieldErrors = Partial<Record<"name" | "phone", string>>;
export function validateAccountFields(name: string, phone: string): AccountFieldErrors {
  const out: AccountFieldErrors = {};
  if (!name.trim()) out.name = "Vui lòng nhập họ tên.";
  const ph = phone.trim();
  if (ph && !isValidVnPhone(ph)) {
    out.phone = "Số điện thoại không hợp lệ.";
  }
  return out;
}
