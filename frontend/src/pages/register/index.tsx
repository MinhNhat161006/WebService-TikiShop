import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/client";
import { validateRegisterFields } from "@/shared/lib/validators";
import { useAuthStore } from "@/store/authStore";
import styles from "@/shared/styles/auth-page.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"name" | "email" | "password" | "phone", string>>
  >({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const fe = validateRegisterFields(name, email, password, phone);
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    try {
      const r = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      setAuth(r.token, r.user);
      navigate("/", { replace: true });
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 0 60px" }}>
      <div className={styles.box}>
        <h1 className={styles.title}>Tạo tài khoản</h1>
        <p className={styles.hint}>
          Đăng ký chỉ tạo tài khoản <strong>khách (USER)</strong>. Tài khoản quản trị do hệ thống cấp (seed / nội bộ),
          không tự đăng ký qua form này.
        </p>
        <form noValidate onSubmit={submit} className={styles.form}>
          <label>
            Họ tên
            <input
              className={`input ${fieldErrors.name ? "input--invalid" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
            />
            {fieldErrors.name && (
              <span className="field-error" role="alert">
                {fieldErrors.name}
              </span>
            )}
          </label>
          <label>
            Email
            <input
              className={`input ${fieldErrors.email ? "input--invalid" : ""}`}
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              autoComplete="email"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <span className="field-error" role="alert">
                {fieldErrors.email}
              </span>
            )}
          </label>
          <label>
            Mật khẩu (tối thiểu 6 ký tự)
            <input
              className={`input ${fieldErrors.password ? "input--invalid" : ""}`}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              autoComplete="new-password"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <span className="field-error" role="alert">
                {fieldErrors.password}
              </span>
            )}
          </label>
          <label>
            Số điện thoại (tuỳ chọn)
            <input
              className={`input ${fieldErrors.phone ? "input--invalid" : ""}`}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setFieldErrors((p) => ({ ...p, phone: undefined }));
              }}
              inputMode="tel"
              autoComplete="tel"
              placeholder="VD: 0912345678"
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && (
              <span className="field-error" role="alert">
                {fieldErrors.phone}
              </span>
            )}
          </label>
          {err && (
            <p className="form-alert" role="alert">
              {err}
            </p>
          )}
          <button type="submit" className="btn btn-primary">
            Đăng ký
          </button>
        </form>
        <p className={styles.switch}>
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
