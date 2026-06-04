import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/client";
import { ApiError } from "@/shared/lib/api-error";
import { isAdmin } from "@/shared/lib/roles";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import SearchBox from "./SearchBox";
import TikiLogo from "./TikiLogo";
import styles from "./Header.module.css";

const HOT_KEYS = ["iphone 15", "samsung a54", "laptop", "tai nghe", "nồi chiên không dầu"];

function IconCart({ className }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 8V6a4 4 0 118 0v2M4 8h16l-1.2 9.6A2 2 0 0116.82 20H7.18a2 2 0 01-1.98-1.6L4 8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 20v-1a5 5 0 0110 0v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconMapPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-10a7 7 0 10-14 0c0 5.65 7 10 7 10z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="11" r="2" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const { user, token, logout, setUser } = useAuthStore();
  const cartCount = useCartStore((s) => s.count);

  useEffect(() => {
    if (!token) return;
    api
      .me()
      .then((u) => setUser(u))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) logout();
      });
  }, [token, setUser, logout]);

  useEffect(() => {
    if (!token) {
      useCartStore.getState().setCount(0);
      return;
    }
    api
      .cart()
      .then((c) => useCartStore.getState().setCount(c.items.reduce((s, i) => s + i.quantity, 0)))
      .catch(() => useCartStore.getState().setCount(0));
  }, [token]);

  return (
    <header className={styles.header}>
      <div className={styles.preTop}>
        <div className="container">
          <div className={styles.preInner}>
            <span className={styles.preItem}>
              <IconMapPin className={styles.preIcon} />
              Giao đến: <strong>Hà Nội</strong>
              <span className={styles.preSep} aria-hidden>
                |
              </span>
              <span className={styles.prePromo}>Freeship+ đơn từ 45k · Giao nhanh 2h</span>
            </span>
            <div className={styles.preLinks}>
              <a href="#footer">Trở thành nhà bán hàng</a>
              <span className={styles.dot} />
              <a href="#footer">Tải ứng dụng</a>
              <span className={styles.dot} />
              <span>Chăm sóc khách hàng</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <div className="container">
          <div className={styles.row}>
            <TikiLogo />

            <div className={styles.searchCol}>
              <SearchBox />
              <div className={styles.hot}>
                <span className={styles.hotLabel}>Tìm nhiều:</span>
                {HOT_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={styles.hotBtn}
                    onClick={() => navigate(`/tim-kiem?q=${encodeURIComponent(k)}`)}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/gio-hang" className={styles.cart}>
                <span className={styles.cartIconWrap}>
                  <IconCart />
                  {cartCount > 0 && (
                    <span className={styles.badge}>{cartCount > 99 ? "99+" : cartCount}</span>
                  )}
                </span>
                <span className={styles.cartLabel}>Giỏ hàng</span>
              </Link>

              <div className={styles.account}>
                <IconUser className={styles.accountIcon} />
                {user ? (
                  <div className={styles.accountText}>
                    <Link to="/tai-khoan" className={styles.accountName}>
                      {user.name}
                    </Link>
                    <button type="button" className={styles.logout} onClick={() => logout()}>
                      Thoát
                    </button>
                  </div>
                ) : (
                  <div className={styles.accountText}>
                    <Link to="/dang-nhap" className={styles.loginLine}>
                      Đăng nhập
                    </Link>
                    <Link to="/dang-ky" className={styles.subLine}>
                      Đăng ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navInner}>
            <Link to="/danh-muc" className={styles.navHighlight}>
              <span className={styles.navIcon} aria-hidden>
                ≡
              </span>
              Danh mục sản phẩm
            </Link>
            <div className={styles.navLinks}>
              <Link to="/">Trang chủ</Link>
              <Link to="/tim-kiem?q=a54">Điện thoại</Link>
              <Link to="/tim-kiem?q=laptop">Laptop</Link>
              <Link to="/danh-muc/dien-tu-dien-may">Điện tử</Link>
              <Link to="/tai-khoan">Tài khoản</Link>
              <Link to="/gioi-thieu">Giới thiệu</Link>
              {isAdmin(user) && (
                <Link to="/admin" className={styles.navAdmin}>
                  Quản trị
                </Link>
              )}
              <a href="/api-docs" target="_blank" rel="noreferrer" className={styles.navMuted}>
                API
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
