import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { AdminStats } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import { orderStatusLabel, orderStatusPillClass } from "@/shared/lib/order-status";
import styles from "./AdminPages.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className={styles.panel}>
        <p className="form-alert" role="alert">
          {err}
        </p>
      </div>
    );
  }

  if (!stats) {
    return <p className={styles.muted}>Đang tải số liệu…</p>;
  }

  const cards = [
    { label: "Người dùng", value: stats.users, to: "/admin/nguoi-dung" },
    { label: "Đơn hàng", value: stats.orders, to: "/admin/don-hang" },
    { label: "Sản phẩm", value: stats.products, to: "/admin/san-pham" },
    { label: "Danh mục", value: stats.categories, to: "/admin/danh-muc" },
  ];

  return (
    <div>
      <h1 className={styles.title}>Tổng quan</h1>
      <p className={styles.lead}>Thống kê và hoạt động gần đây.</p>
      <div className={styles.grid}>
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className={styles.card}>
            <span className={styles.cardLabel}>{c.label}</span>
            <span className={styles.cardValue}>{c.value.toLocaleString("vi-VN")}</span>
          </Link>
        ))}
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.panel}>
          <h2 className={styles.subtitle}>Doanh thu (đã giao)</h2>
          <p className={styles.revenue}>{formatPrice(stats.revenueTotal)}</p>
          <p className={styles.muted}>Chỉ cộng các đơn ở trạng thái «Đã giao».</p>
        </div>
        <div className={styles.panel}>
          <h2 className={styles.subtitle}>Doanh thu 30 ngày (đã giao)</h2>
          <p className={styles.revenueSecondary}>{formatPrice(stats.revenueLast30Days)}</p>
          <p className={styles.muted}>Đơn đã giao có ngày tạo trong 30 ngày gần nhất.</p>
        </div>
        <div className={styles.panel}>
          <h2 className={styles.subtitle}>Người mới (7 ngày)</h2>
          <p className={styles.metricBig}>{stats.newUsersLast7Days.toLocaleString("vi-VN")}</p>
          <p className={styles.muted}>Tài khoản đăng ký.</p>
        </div>
      </div>

      <div className={styles.twoCol}>
        <div className={styles.panel}>
          <h2 className={styles.subtitle}>Đơn theo trạng thái</h2>
          {stats.ordersByStatus.length === 0 ? (
            <p className={styles.muted}>Chưa có đơn.</p>
          ) : (
            <ul className={styles.statusBreakdown}>
              {stats.ordersByStatus.map((row) => (
                <li key={row.status} className={styles.statusBreakdownRow}>
                  <span className={`${styles.pill} ${styles[`pill_${orderStatusPillClass(row.status)}`]}`}>
                    {orderStatusLabel(row.status)}
                  </span>
                  <span className={styles.statusCount}>{row.count.toLocaleString("vi-VN")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.panel}>
          <h2 className={styles.subtitle}>Bán chạy (đơn đã giao)</h2>
          {stats.topProducts.length === 0 ? (
            <p className={styles.muted}>Chưa có dữ liệu.</p>
          ) : (
            <ol className={styles.rankList}>
              {stats.topProducts.map((p) => (
                <li key={p.productId}>
                  {p.slug ? (
                    <Link to={`/p/${p.slug}`}>{p.name}</Link>
                  ) : (
                    <span>{p.name}</span>
                  )}
                  <span className={styles.muted}> · {p.quantitySold.toLocaleString("vi-VN")} sp</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className={styles.panel} style={{ marginTop: 20 }}>
        <h2 className={styles.subtitle}>Đơn gần đây</h2>
        {stats.recentOrders.length === 0 ? (
          <p className={styles.muted}>Chưa có đơn.</p>
        ) : (
          <ul className={styles.recentOrders}>
            {stats.recentOrders.map((o) => (
              <li key={o.id}>
                <Link to={`/admin/don-hang/${o.id}`} className={styles.recentOrderLink}>
                  #{o.id.slice(0, 8)}
                </Link>
                <span className={`${styles.pill} ${styles[`pill_${orderStatusPillClass(o.status)}`]}`}>
                  {orderStatusLabel(o.status)}
                </span>
                <span className={styles.recentOrderTotal}>{formatPrice(o.total)}</span>
                <span className={styles.muted}>
                  {o.userName} · {o.userEmail}
                </span>
                <span className={styles.muted}>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
