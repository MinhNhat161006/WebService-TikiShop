import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { Order, User } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import {
  orderCanCustomerCancel,
  orderStatusLabel,
  orderTimelineSteps,
  ORDER_STATUS_OPTIONS,
} from "@/shared/lib/order-status";
import { isAdmin, roleLabel } from "@/shared/lib/roles";
import { validateAccountFields } from "@/shared/lib/validators";
import { useAuthStore } from "@/store/authStore";
import { useToast, ConfirmModal } from "@/shared/ui";
import styles from "./AccountPage.module.css";

/* ===== Tab types ===== */
type Tab = "profile" | "orders" | "order-detail" | "settings";

/* ===== Sidebar navigation items ===== */
const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
  { tab: "profile", icon: "👤", label: "Thông tin cá nhân" },
  { tab: "orders", icon: "📦", label: "Đơn hàng của tôi" },
  { tab: "settings", icon: "⚙️", label: "Cài đặt" },
];

/* ===== Main Account Dashboard ===== */
export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: orderIdParam } = useParams<{ id?: string }>();
  const token = useAuthStore((s) => s.token);
  const storeUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  // Determine active tab from URL
  const getTabFromPath = (): Tab => {
    const path = location.pathname;
    if (orderIdParam && path.includes("/don-hang/")) return "order-detail";
    if (path.includes("/don-hang")) return "orders";
    if (path.includes("/cai-dat")) return "settings";
    return "profile";
  };

  const [activeTab, setActiveTab] = useState<Tab>(getTabFromPath);

  useEffect(() => {
    setActiveTab(getTabFromPath());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, orderIdParam]);

  const switchTab = (tab: Tab) => {
    switch (tab) {
      case "orders":
        navigate("/tai-khoan/don-hang");
        break;
      case "settings":
        navigate("/tai-khoan/cai-dat");
        break;
      default:
        navigate("/tai-khoan");
    }
  };

  if (!token) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.authPrompt}>
          <h2>Chưa đăng nhập</h2>
          <p>Vui lòng đăng nhập để xem tài khoản của bạn.</p>
          <Link to="/dang-nhap" className="btn btn-primary">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.dashboard}>
        {/* --- Sidebar --- */}
        <aside className={styles.sidebar}>
          {storeUser && (
            <div className={styles.profileCard}>
              <div className={styles.avatar}>
                {storeUser.name.charAt(0)}
              </div>
              <div className={styles.profileName}>{storeUser.name}</div>
              <div className={styles.profileEmail}>{storeUser.email}</div>
              <span className={`${styles.roleBadge} ${isAdmin(storeUser) ? styles.roleAdmin : styles.roleUser}`}>
                {roleLabel(storeUser.role)}
              </span>
            </div>
          )}
          <ul className={styles.navMenu}>
            {NAV_ITEMS.map((item) => (
              <li key={item.tab} className={styles.navItem}>
                <button
                  type="button"
                  className={`${styles.navLink} ${activeTab === item.tab || (item.tab === "orders" && activeTab === "order-detail") ? styles.navLinkActive : ""}`}
                  onClick={() => switchTab(item.tab)}
                >
                  <span className={styles.navIcon} aria-hidden>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
            {isAdmin(storeUser) && (
              <>
                <li><div className={styles.navDivider} /></li>
                <li className={styles.navItem}>
                  <Link to="/admin" className={styles.navLink}>
                    <span className={styles.navIcon} aria-hidden>🔧</span>
                    Bảng quản trị
                  </Link>
                </li>
              </>
            )}
            <li><div className={styles.navDivider} /></li>
            <li className={styles.navItem}>
              <button
                type="button"
                className={`${styles.navLink} ${styles.logoutBtn}`}
                onClick={() => { logout(); navigate("/"); }}
              >
                <span className={styles.navIcon} aria-hidden>🚪</span>
                Đăng xuất
              </button>
            </li>
          </ul>
        </aside>

        {/* --- Content area --- */}
        <main className={styles.content}>
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "orders" && <OrdersTab onViewDetail={(id) => navigate(`/tai-khoan/don-hang/${id}`)} />}
          {activeTab === "order-detail" && orderIdParam && (
            <OrderDetailTab orderId={orderIdParam} onBack={() => navigate("/tai-khoan/don-hang")} />
          )}
          {activeTab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE TAB
   ========================================================= */
function ProfileTab() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const storeUser = useAuthStore((s) => s.user);
  const toast = useToast();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.me()
      .then((u: User) => { setName(u.name); setPhone(u.phone || ""); })
      .catch(() => {
        if (storeUser) { setName(storeUser.name); setPhone(storeUser.phone || ""); }
      });
  }, [token, storeUser]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const fe = validateAccountFields(name, phone);
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    setSaving(true);
    try {
      const u = await api.updateProfile({ name: name.trim(), phone: phone.trim() || null });
      setAuth(token, u);
      toast({ type: "success", message: "Đã lưu thông tin tài khoản." });
    } catch (e) {
      toast({ type: "error", message: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.contentPanel}>
      <h2 className={styles.contentTitle}>Thông tin cá nhân</h2>

      {/* Read-only info */}
      {storeUser && (
        <div style={{ marginBottom: 20 }}>
          <div className={styles.profileInfoRow}>
            <span className={styles.profileInfoLabel}>Email</span>
            <span className={styles.profileInfoValue}>{storeUser.email}</span>
          </div>
          <div className={styles.profileInfoRow}>
            <span className={styles.profileInfoLabel}>Ngày tham gia</span>
            <span className={styles.profileInfoValue}>{new Date(storeUser.createdAt).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      )}

      {/* Editable form */}
      <form noValidate className={styles.profileForm} onSubmit={submit}>
        <label>
          Họ tên
          <input
            className={`input ${fieldErrors.name ? "input--invalid" : ""}`}
            value={name}
            onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: undefined })); }}
            aria-invalid={Boolean(fieldErrors.name)}
          />
          {fieldErrors.name && <span className="field-error" role="alert">{fieldErrors.name}</span>}
        </label>
        <label>
          Số điện thoại
          <input
            className={`input ${fieldErrors.phone ? "input--invalid" : ""}`}
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setFieldErrors((p) => ({ ...p, phone: undefined })); }}
            placeholder="Để trống nếu không muốn cập nhật"
            inputMode="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
          />
          {fieldErrors.phone && <span className="field-error" role="alert">{fieldErrors.phone}</span>}
        </label>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   ORDERS TAB
   ========================================================= */
function OrdersTab({ onViewDetail }: { onViewDetail: (id: string) => void }) {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.orders()
      .then(setOrders)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const FILTERS = [
    { value: "all", label: "Tất cả" },
    ...ORDER_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  ];

  return (
    <div className={styles.contentPanel}>
      <h2 className={styles.contentTitle}>Đơn hàng của tôi</h2>

      {/* Filter tabs */}
      <div className={styles.orderFilters}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            {f.value !== "all" && (
              <> ({orders.filter((o) => o.status === f.value).length})</>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: 32, textAlign: "center" }}>
          <div className="spinner spinner-lg" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Đang tải đơn hàng…</p>
        </div>
      )}

      {err && <p className="form-alert" role="alert">{err}</p>}

      {!loading && !err && filtered.length === 0 && (
        <div className="empty-state" style={{ padding: "32px 16px" }}>
          <h3>{filter === "all" ? "Chưa có đơn hàng" : "Không có đơn hàng"}</h3>
          <p>{filter === "all" ? "Hãy mua sắm và đặt hàng đầu tiên nhé!" : `Không có đơn hàng ở trạng thái "${FILTERS.find((f) => f.value === filter)?.label}".`}</p>
          {filter === "all" && (
            <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              Mua sắm ngay
            </Link>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <ul className={styles.ordersList}>
          {filtered.map((o) => (
            <li key={o.id} className={styles.orderCard} onClick={() => onViewDetail(o.id)}>
              <div className={styles.orderHead}>
                <span className={styles.orderId}>#{o.id.slice(0, 8)}</span>
                <span className={styles.statusBadge} data-st={o.status}>
                  {orderStatusLabel(o.status)}
                </span>
                <span className={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString("vi-VN")}</span>
              </div>
              <div className={styles.orderBody}>
                <span className={styles.orderTotal}>{formatPrice(o.total)}</span>
                <span>· {o.phone}</span>
              </div>
              <div className={styles.orderItems}>
                {o.items.slice(0, 3).map((it) => it.product.name).join(", ")}
                {o.items.length > 3 && ` +${o.items.length - 3} sản phẩm`}
              </div>
              <span className={styles.orderViewLink}>Xem chi tiết →</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================
   ORDER DETAIL TAB
   ========================================================= */
function OrderDetailTab({ orderId, onBack }: { orderId: string; onBack: () => void }) {
  const token = useAuthStore((s) => s.token);
  const toast = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    if (!token || !orderId) return;
    setLoading(true);
    setErr(null);
    api.order(orderId)
      .then(setOrder)
      .catch((e: Error) => { setOrder(null); setErr(e.message); })
      .finally(() => setLoading(false));
  }, [token, orderId]);

  const doCancel = async () => {
    if (!order) return;
    setCancelConfirm(false);
    setCancelBusy(true);
    try {
      const updated = await api.cancelOrder(orderId);
      setOrder(updated);
      toast({ type: "success", message: "Đã hủy đơn hàng." });
    } catch (e) {
      toast({ type: "error", message: (e as Error).message });
    } finally {
      setCancelBusy(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.contentPanel} style={{ textAlign: "center", padding: 40 }}>
        <div className="spinner spinner-lg" style={{ margin: "0 auto 12px" }} />
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Đang tải chi tiết đơn hàng…</p>
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className={styles.contentPanel}>
        <button type="button" className={styles.backBtn} onClick={onBack}>← Quay lại đơn hàng</button>
        <p className="form-alert" role="alert">{err || "Không tìm thấy đơn hàng."}</p>
      </div>
    );
  }

  const steps = orderTimelineSteps(order.status);

  return (
    <div className={styles.contentPanel}>
      <button type="button" className={styles.backBtn} onClick={onBack}>← Quay lại đơn hàng</button>
      <h2 className={styles.contentTitle}>Chi tiết đơn hàng</h2>

      {order.status === "cancelled" && (
        <div className={styles.cancelBanner} role="status">
          Đơn hàng đã hủy. Nếu bạn đã thanh toán trước, tiền sẽ được hoàn theo chính sách.
        </div>
      )}

      <div className={styles.detailHead}>
        <span className={styles.orderId}>Mã đơn: #{order.id.slice(0, 8)}</span>
        <span className={styles.statusBadge} data-st={order.status}>
          {orderStatusLabel(order.status)}
        </span>
        <span className={styles.detailMeta}>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
      </div>

      {order.status !== "cancelled" && (
        <ol className={styles.timeline} aria-label="Tiến trình giao hàng">
          {steps.map((s) => (
            <li key={s.code} className={styles.tlItem} data-state={s.state}>
              <span className={styles.tlDot} aria-hidden />
              <div>
                <div className={styles.tlTitle}>{s.label}</div>
                <div className={styles.tlHint}>{s.hint}</div>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className={styles.detailTotal}>{formatPrice(order.total)}</div>
      <p className={styles.detailInfo}><strong>Thanh toán:</strong> COD — thanh toán khi nhận hàng</p>
      <p className={styles.detailInfo}><strong>Điện thoại:</strong> {order.phone}</p>
      <p className={styles.detailInfo}><strong>Địa chỉ:</strong> {order.address}</p>

      {orderCanCustomerCancel(order.status) && (
        <div className={styles.cancelRow}>
          <button type="button" className={styles.btnCancel} disabled={cancelBusy} onClick={() => setCancelConfirm(true)}>
            {cancelBusy ? "Đang hủy…" : "Hủy đơn hàng"}
          </button>
          <span className={styles.cancelHint}>Chỉ hủy được khi đơn chưa chuyển sang giao hàng.</span>
        </div>
      )}

      <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "20px 0 8px" }}>Sản phẩm</h3>
      <ul className={styles.detailItems}>
        {order.items.map((it) => (
          <li key={it.id} className={styles.detailLine}>
            <Link to={`/p/${it.product.slug}`} className={styles.detailPname}>
              {it.product.name}
            </Link>
            <span>× {it.quantity} · {formatPrice(it.price)} / sp</span>
            <span className={styles.detailSubtot}>{formatPrice(it.price * it.quantity)}</span>
          </li>
        ))}
      </ul>

      <ConfirmModal
        open={cancelConfirm}
        title="Hủy đơn hàng?"
        message={`Bạn có chắc muốn hủy đơn hàng #${order.id.slice(0, 8)}? Hành động này không thể hoàn tác.`}
        confirmLabel="Hủy đơn"
        danger
        onConfirm={doCancel}
        onCancel={() => setCancelConfirm(false)}
      />
    </div>
  );
}

/* =========================================================
   SETTINGS TAB
   ========================================================= */
function SettingsTab() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className={styles.contentPanel}>
      <h2 className={styles.contentTitle}>Cài đặt</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
        <Link to="/gioi-thieu" className="btn btn-outline btn-sm" style={{ justifyContent: "flex-start" }}>
          📖 Giới thiệu
        </Link>
        <a href="/api-docs" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ justifyContent: "flex-start" }}>
          📡 API Documentation
        </a>
        <hr className="divider" />
        <button
          type="button"
          className="btn btn-danger btn-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={() => {
            logout();
            toast({ type: "info", message: "Đã đăng xuất." });
            navigate("/");
          }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}
