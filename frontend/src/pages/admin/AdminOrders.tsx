import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { AdminOrderRow } from "@/shared/api/types";
import { formatPrice } from "@/shared/lib/format";
import { ORDER_STATUS_OPTIONS, orderStatusLabel, orderStatusPillClass } from "@/shared/lib/order-status";
import styles from "./AdminPages.module.css";

export default function AdminOrders() {
  const [items, setItems] = useState<AdminOrderRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    api
      .adminOrders({
        page,
        limit: 15,
        status: statusFilter || undefined,
        q: q || undefined,
      })
      .then((r) => {
        setItems(r.items);
        setTotalPages(Math.max(1, r.pagination.totalPages));
        setTotal(r.pagination.total);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [page, statusFilter, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, q]);

  const applySearch = () => {
    setQ(qInput.trim());
  };

  const patchStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    setErr(null);
    try {
      const updated = await api.adminPatchOrderStatus(id, status);
      setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi cập nhật");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeOrder = async (id: string) => {
    const ok = window.confirm("Xóa vĩnh viễn đơn hàng này khỏi CSDL? Hành động không hoàn tác.");
    if (!ok) return;
    setDeletingId(id);
    setErr(null);
    try {
      await api.adminDeleteOrder(id);
      setItems((prev) => prev.filter((o) => o.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không xóa được");
    } finally {
      setDeletingId(null);
    }
  };

  if (err && !loading && items.length === 0) {
    return (
      <div className={styles.panel}>
        <p className="form-alert" role="alert">
          {err}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.title}>Đơn hàng</h1>
      <p className={styles.lead}>
        Luồng giống Tiki: đơn mới là «Chờ xác nhận» → «Đã xác nhận» → «Đang chuẩn bị hàng» → «Đang giao hàng» → «Giao hàng thành công». Doanh thu tổng quan chỉ tính đơn đã giao. Khách có thể tự hủy khi đơn còn chờ xác nhận hoặc đã xác nhận.
      </p>

      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Trạng thái</span>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả</option>
            {ORDER_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.input}
            placeholder="Mã đơn, SĐT, email, tên khách…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <button type="button" className={styles.btnPrimary} onClick={applySearch}>
            Tìm
          </button>
        </div>
      </div>
      {err && (
        <p className="form-alert" role="alert" style={{ marginBottom: 12 }}>
          {err}
        </p>
      )}
      <p className={styles.muted} style={{ marginBottom: 12 }}>
        {total.toLocaleString("vi-VN")} đơn khớp điều kiện.
      </p>

      {loading ? (
        <p className={styles.muted}>Đang tải…</p>
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((o) => (
              <li key={o.id} className={styles.listItem}>
                <div className={styles.rowHead}>
                  <Link to={`/admin/don-hang/${o.id}`} className={styles.monoLink}>
                    #{o.id.slice(0, 8)}
                  </Link>
                  <span className={`${styles.pill} ${styles[`pill_${orderStatusPillClass(o.status)}`]}`}>
                    {orderStatusLabel(o.status)}
                  </span>
                  <span className={styles.muted}>{new Date(o.createdAt).toLocaleString("vi-VN")}</span>
                </div>
                <div className={styles.orderActions}>
                  <label className={styles.inlineLabel}>
                    Đổi trạng thái
                    <select
                      className={styles.selectSm}
                      value={o.status}
                      disabled={updatingId === o.id || deletingId === o.id}
                      onChange={(e) => patchStatus(o.id, e.target.value)}
                      aria-label={`Trạng thái đơn ${o.id.slice(0, 8)}`}
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={styles.btnDanger}
                    disabled={deletingId === o.id}
                    onClick={() => removeOrder(o.id)}
                  >
                    Xóa đơn
                  </button>
                </div>
                <p>
                  <strong>{formatPrice(o.total)}</strong> · {o.phone}
                </p>
                <p className={styles.muted}>
                  Khách: {o.user.name} ({o.user.email})
                </p>
                <p className={styles.addr}>{o.address}</p>
                <ul className={styles.miniList}>
                  {o.items.map((it) => (
                    <li key={it.id}>
                      <Link to={`/p/${it.product.slug}`}>{it.product.name}</Link> × {it.quantity}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {items.length === 0 && <p className={styles.muted}>Không có đơn phù hợp.</p>}
          {totalPages > 1 && (
            <div className={styles.pager}>
              <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
