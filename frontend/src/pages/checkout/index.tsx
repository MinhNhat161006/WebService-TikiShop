import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { CartItem } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import { validateCheckoutFields } from "@/shared/lib/validators";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import styles from "./CheckoutPage.module.css";

type CheckoutLocationState = { cartItemIds?: string[] };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ address?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);

  const checkoutFilterKey = useMemo(() => {
    const ids = (location.state as CheckoutLocationState | null)?.cartItemIds;
    if (!ids?.length) return "__ALL__";
    return [...ids].sort().join("\0");
  }, [location.state]);

  useEffect(() => {
    if (!token) {
      setCartLoading(false);
      return;
    }
    api
      .cart()
      .then((c) => {
        const stateIds =
          checkoutFilterKey === "__ALL__"
            ? undefined
            : (location.state as CheckoutLocationState | null)?.cartItemIds;
        const rows =
          stateIds && stateIds.length > 0 ? c.items.filter((i) => stateIds.includes(i.id)) : c.items;
        const nextSub = rows.reduce((s, i) => s + i.product.price * i.quantity, 0);
        setCartItems(rows);
        setSubtotal(nextSub);
        if (rows.length === 0) {
          navigate("/gio-hang", { replace: true });
        }
      })
      .catch(() => {
        setCartItems([]);
        setSubtotal(0);
      })
      .finally(() => setCartLoading(false));
  }, [token, navigate, checkoutFilterKey]);

  useEffect(() => {
    if (!token || !user?.phone) return;
    setPhone((cur) => (cur.trim() === "" ? user.phone! : cur));
  }, [token, user?.phone]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setErr(null);
    const fe = validateCheckoutFields(address, phone);
    setFieldErrors(fe);
    if (Object.keys(fe).length > 0) return;

    setLoading(true);
    try {
      const order = await api.checkout({
        address: address.trim(),
        phone: phone.trim(),
        cartItemIds: cartItems.map((i) => i.id),
      });
      try {
        const c = await api.cart();
        useCartStore.getState().setCount(c.items.reduce((s, i) => s + i.quantity, 0));
      } catch {
        useCartStore.getState().setCount(0);
      }
      navigate(`/tai-khoan/don-hang/${order.id}`, { replace: true });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={`container ${styles.shell}`}>
        <p>
          <Link to="/dang-nhap">Đăng nhập</Link> để thanh toán.
        </p>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className={`container ${styles.shell}`}>
        <p>Đang tải giỏ hàng…</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <nav className={styles.breadcrumb} aria-label="Bước đặt hàng">
        <Link to="/gio-hang">Giỏ hàng</Link>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Thanh toán &amp; đặt hàng</span>
      </nav>

      <h1 className={styles.title}>Thanh toán &amp; đặt hàng</h1>
      <p className={styles.lead}>
        Chỉ các sản phẩm bạn đã chọn ở giỏ hàng mới nằm trong đơn này; các món khác vẫn còn trong giỏ. Nhập địa chỉ giao hàng, chọn COD, đặt hàng — đơn ở trạng thái «Chờ xác nhận» cho đến khi shop xử lý.
      </p>

      <div className={styles.layout}>
        <section className={styles.formCard}>
          <h2 className={styles.sectionTitle}>Thông tin giao hàng</h2>
          <form noValidate className={styles.form} onSubmit={submit}>
            <label>
              Địa chỉ nhận hàng
              <textarea
                className={`input ${fieldErrors.address ? "input--invalid" : ""}`}
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setFieldErrors((p) => ({ ...p, address: undefined }));
                }}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố…"
                aria-invalid={Boolean(fieldErrors.address)}
              />
              {fieldErrors.address && (
                <span className="field-error" role="alert">
                  {fieldErrors.address}
                </span>
              )}
            </label>
            <label>
              Số điện thoại liên hệ
              <input
                className={`input ${fieldErrors.phone ? "input--invalid" : ""}`}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((p) => ({ ...p, phone: undefined }));
                }}
                placeholder="VD: 0912345678"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={Boolean(fieldErrors.phone)}
              />
              {fieldErrors.phone && (
                <span className="field-error" role="alert">
                  {fieldErrors.phone}
                </span>
              )}
            </label>

            <div className={styles.codBlock}>
              <h3 className={styles.codTitle}>Phương thức thanh toán</h3>
              <label className={styles.codChoice}>
                <input type="radio" name="pay" checked readOnly />
                <span>
                  <strong>Thanh toán tiền mặt khi nhận hàng (COD)</strong>
                  <span className={styles.codHint}>Bạn thanh toán bằng tiền mặt cho shipper khi nhận đơn — giống mặc định trên Tiki.</span>
                </span>
              </label>
            </div>

            {err && (
              <p className="form-alert" role="alert">
                {err}
              </p>
            )}
            <div className={styles.actions}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Đang đặt hàng…" : "Đặt hàng"}
              </button>
              <Link to="/gio-hang" className={styles.backLink}>
                ← Quay lại giỏ hàng
              </Link>
            </div>
          </form>
        </section>

        <section className={styles.summaryCard} aria-labelledby="checkout-summary-heading">
          <h2 id="checkout-summary-heading" className={styles.sectionTitle}>
            Đơn hàng ({cartItems.length} sản phẩm)
          </h2>
          <ul className={styles.lines}>
            {cartItems.map((row) => (
              <li key={row.id} className={styles.line}>
                <Link to={`/p/${row.product.slug}`} className={styles.thumb}>
                  <img src={row.product.image} alt="" width={72} height={72} loading="lazy" />
                </Link>
                <div className={styles.lineBody}>
                  <Link to={`/p/${row.product.slug}`} className={styles.pname}>
                    {row.product.name}
                  </Link>
                  <div className={styles.lineMeta}>
                    SL: {row.quantity} · {formatPrice(row.product.price)} / sản phẩm
                  </div>
                </div>
                <div className={styles.linePrice}>{formatPrice(row.product.price * row.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className={styles.subtotalRow}>
            <span>Tạm tính</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className={styles.subtotalRow}>
            <span>Phí vận chuyển</span>
            <span className={styles.muted}>Miễn phí (demo)</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tổng thanh toán</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </section>
      </div>
    </div>
  );
}
