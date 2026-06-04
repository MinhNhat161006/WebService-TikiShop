import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { Order } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import { orderStatusLabel } from "@/shared/lib/order-status";
import { useAuthStore } from "@/store/authStore";
import styles from "./OrdersPage.module.css";

export default function OrdersPage() {
  const token = useAuthStore((s) => s.token);
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .orders()
      .then(setOrders)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className={`container ${styles.shell}`}>
        <p>
          <Link to="/dang-nhap">Đăng nhập</Link> để xem đơn hàng.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`container ${styles.shell}`}>
        <p>Đang tải đơn hàng…</p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>Đơn hàng của tôi</h1>
      <p className={styles.lead}>
        Theo dõi trạng thái giống Tiki: chờ xác nhận → chuẩn bị hàng → đang giao → hoàn thành. Bạn có thể hủy khi đơn còn ở bước đầu.
      </p>
      {err && (
        <p className="form-alert" role="alert">
          {err}
        </p>
      )}
      {orders.length === 0 && !err && <p>Chưa có đơn hàng.</p>}
      <ul className={styles.list}>
        {orders.map((o) => (
          <li key={o.id} className={styles.card}>
            <div className={styles.head}>
              <span>#{o.id.slice(0, 8)}</span>
              <span className={styles.statusBadge} data-st={o.status}>
                {orderStatusLabel(o.status)}
              </span>
              <span>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
            </div>
            <p>
              {formatPrice(o.total)} · {o.phone}
            </p>
            <p className={styles.addr}>{o.address}</p>
            <ul className={styles.items}>
              {o.items.map((it) => (
                <li key={it.id}>
                  {it.product.name} × {it.quantity}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>
              <Link to={`/don-hang/${o.id}`}>Xem chi tiết →</Link>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
