import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/store/authStore";

/**
 * Bảo vệ /admin/*: cần đăng nhập và role ADMIN (xác minh qua API /me).
 */
export default function RequireAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);

    (async () => {
      if (!token) {
        const next = `/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`;
        navigate(next, { replace: true, state: { from: location.pathname } });
        return;
      }
      try {
        const u = await api.me();
        if (!active) return;
        setUser(u);
        if (u.role !== "ADMIN") {
          navigate("/", { replace: true });
          return;
        }
        setReady(true);
      } catch {
        if (!active) return;
        navigate(`/dang-nhap?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
    })();

    return () => {
      active = false;
    };
  }, [token, location.pathname, navigate, setUser]);

  if (!ready) {
    return (
      <div style={{ padding: 48, textAlign: "center", fontFamily: "system-ui, sans-serif", color: "#64748b" }}>
        Đang xác thực quyền quản trị…
      </div>
    );
  }

  return <Outlet />;
}
