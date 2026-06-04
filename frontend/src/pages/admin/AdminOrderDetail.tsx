import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { AdminOrderDetail as AdminOrderDetailType } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_OPTIONS, orderStatusLabel, orderStatusPillClass } from "@/shared/lib/order-status";
import styles from "./AdminPages.module.css";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrderDetailType | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setErr(null);
    setLoading(true);
    api
      .adminOrder(id)
      .then(setOrder)
      .catch((e: Error) => {
        setOrder(null);
        setErr(e.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const patchStatus = async (status: string) => {
    if (!id) return;
    setSaving(true);
    setErr(null);
    try {
      const updated = await api.adminPatchOrderStatus(id, status);
      setErr(null);
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  const removeOrder = async () => {
    if (!id) return;
    const ok = window.confirm("Xóa vĩnh viễn đơn này? Không hoàn tác.");
    if (!ok) return;
    setSaving(true);
    setErr(null);
    try {
      await api.adminDeleteOrder(id);
      navigate("/admin/don-hang");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không xóa được");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className={styles.muted}>Đang tải đơn hàng…</p>;
  }

  if (err || !order) {
    return (
      <div className={styles.panel}>
        <p className="form-alert" role="alert">
          {err || "Không tìm thấy đơn."}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link to="/admin/don-hang">← Danh sách đơn</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <nav className={styles.breadcrumb}>
        <Link to="/admin">Tổng quan</Link>
        <span> / </span>
        <Link to="/admin/don-hang">Đơn hàng</Link>
        <span> / </span>
        <span>#{order.id.slice(0, 8)}</span>
      </nav>
      <h1 className={styles.title}>Chi tiết đơn (quản trị)</h1>

      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <div className={styles.rowHead}>
          <span className={styles.mono}>#{order.id.slice(0, 8)}</span>
          <span className={`${styles.pill} ${styles[`pill_${orderStatusPillClass(order.status)}`]}`}>
            {orderStatusLabel(order.status)}
          </span>
          <span className={styles.muted}>{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
        </div>
        <label className={styles.field} style={{ marginTop: 12, maxWidth: 320 }}>
          <span className={styles.fieldLabel}>Cập nhật trạng thái</span>
          <select
            className={styles.select}
            value={order.status}
            disabled={saving}
            onChange={(e) => patchStatus(e.target.value)}
          >
            {ORDER_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {err && (
          <p className="form-alert" role="alert" style={{ marginTop: 8 }}>
            {err}
          </p>
        )}
        <div style={{ marginTop: 12 }}>
          <button type="button" className={styles.btnDanger} disabled={saving} onClick={removeOrder}>
            Xóa đơn hàng
          </button>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <h2 className={styles.subtitle}>Khách hàng</h2>
        <p>
          <strong>{order.user.name}</strong>
        </p>
        <p className={styles.muted}>{order.user.email}</p>
        {order.user.phone && <p className={styles.muted}>{order.user.phone}</p>}
      </div>

      <div className={styles.panel} style={{ marginBottom: 16 }}>
        <h2 className={styles.subtitle}>Giao hàng</h2>
        <p>{order.phone}</p>
        <p className={styles.addr}>{order.address}</p>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.subtitle}>Sản phẩm</h2>
        <p className={styles.revenue}>{formatPrice(order.total)}</p>
        <ul className={styles.miniList}>
          {order.items.map((it) => (
            <li key={it.id}>
              <Link to={`/p/${it.product.slug}`}>{it.product.name}</Link> × {it.quantity} — {formatPrice(it.price * it.quantity)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
