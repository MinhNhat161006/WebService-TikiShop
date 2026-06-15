import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { DeliveryOrder, DeliveryStatus } from "@/shared/api/types";
import styles from "./AdminPages.module.css";

const fmtPrice = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: "Chờ lấy hàng",
  PICKING_UP: "Đang lấy hàng",
  DELIVERING: "Đang giao",
  DELIVERED: "Giao thành công",
  FAILED: "Thất bại / Hoàn hàng",
};

function StatusPill({ status }: { status: DeliveryStatus }) {
  const pill: Record<DeliveryStatus, string> = {
    PENDING: styles.pill_neutral,
    PICKING_UP: styles.pill_warn,
    DELIVERING: styles.pill_warn,
    DELIVERED: styles.pill_ok,
    FAILED: styles.pill_bad,
  };
  return (
    <span className={`${styles.pill} ${pill[status] ?? ""}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & Pagination
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminDeliveries({
        page,
        limit,
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setDeliveries(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách phiếu giao hàng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, searchQuery]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleStatusChange = async (id: string, newStatus: DeliveryStatus) => {
    setUpdatingId(id);
    setActionError(null);
    try {
      await api.adminPatchDeliveryStatus(id, newStatus);
      await fetchDeliveries();
    } catch (err: any) {
      setActionError(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDeliveries();
  };

  return (
    <div>
      {/* Header Toolbar */}
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Giao hàng (Logistics)</h1>
          <p className={styles.lead}>
            Theo dõi tiến trình vận chuyển, cập nhật mã vận đơn và đồng bộ hóa tồn kho tự động.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            background: "#f8fafc",
            padding: "8px 14px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ color: "#64748b" }}>Tổng số phiếu:</span>
          <span style={{ fontWeight: 700 }}>{total}</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { value: "", label: "Tất cả" },
            { value: "PENDING", label: "Chờ lấy hàng" },
            { value: "PICKING_UP", label: "Đang lấy hàng" },
            { value: "DELIVERING", label: "Đang giao" },
            { value: "DELIVERED", label: "Giao thành công" },
            { value: "FAILED", label: "Thất bại" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              style={{
                padding: "6px 14px",
                borderRadius: "20px",
                border: "1px solid",
                cursor: "pointer",
                fontWeight: statusFilter === tab.value ? 700 : 500,
                fontSize: "0.85rem",
                borderColor: statusFilter === tab.value ? "#0d9488" : "#cbd5e1",
                background: statusFilter === tab.value ? "#0d9488" : "#fff",
                color: statusFilter === tab.value ? "#fff" : "#475569",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Tìm mã vận đơn, mã ĐH..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.input}
            style={{ width: "240px", padding: "6px 12px", fontSize: "0.85rem", margin: 0 }}
          />
          <button type="submit" className={styles.btnPrimary} style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Global & Action Errors */}
      {error && <div className="form-alert" style={{ marginBottom: "16px" }}>{error}</div>}
      {actionError && <div className="form-alert" style={{ marginBottom: "16px" }}>{actionError}</div>}

      {/* Data Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Đang tải dữ liệu giao vận...
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "130px" }}>Mã Đơn Hàng</th>
                <th>Người Nhận</th>
                <th>Đơn Vị Vận Chuyển</th>
                <th>Mã Vận Đơn</th>
                <th style={{ textAlign: "right" }}>Phí Vận Chuyển</th>
                <th>Trạng Thái</th>
                <th>Dự Kiến Giao</th>
                <th>Thực Tế Giao</th>
                <th style={{ width: "260px", textAlign: "center" }}>Thao Tác Nhanh</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((item) => (
                <tr key={item.id} style={{ transition: "background 0.15s" }}>
                  <td className={styles.mono} style={{ fontSize: "0.8rem" }}>
                    <Link to={`/admin/don-hang/${item.orderId}`} style={{ color: "#0284c7", fontWeight: 600 }}>
                      #{item.orderId.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.order?.user?.name || "Khách vãng lai"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{item.order?.user?.phone || "—"}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.shipping_provider}</td>
                  <td className={styles.mono} style={{ fontSize: "0.82rem", color: "#475569" }}>
                    {item.tracking_number}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "#475569" }}>
                    {fmtPrice(item.shipping_fee)}
                  </td>
                  <td>
                    <StatusPill status={item.status} />
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#64748b" }}>{fmtDate(item.estimated_delivery_date)}</td>
                  <td style={{ fontSize: "0.82rem", color: "#059669", fontWeight: item.actual_delivery_date ? 600 : 400 }}>
                    {fmtDate(item.actual_delivery_date)}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                      {item.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, "PICKING_UP")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#3b82f6", color: "#fff" }}
                          >
                            Lấy hàng
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, "FAILED")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            Hủy / Thất bại
                          </button>
                        </>
                      )}
                      {item.status === "PICKING_UP" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, "DELIVERING")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#f59e0b", color: "#fff" }}
                          >
                            Bắt đầu giao
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, "FAILED")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            Thất bại
                          </button>
                        </>
                      )}
                      {item.status === "DELIVERING" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(item.id, "DELIVERED")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#10b981", color: "#fff" }}
                          >
                            Thành công
                          </button>
                          <button
                            onClick={() => handleStatusChange(item.id, "FAILED")}
                            disabled={updatingId === item.id}
                            className={styles.btnSm}
                            style={{ background: "#ef4444", color: "#fff" }}
                          >
                            Thất bại
                          </button>
                        </>
                      )}
                      {(item.status === "DELIVERED" || item.status === "FAILED") && (
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Đã hoàn tất xử lý</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {deliveries.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    Không tìm thấy phiếu giao hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "14px",
            background: "#f8fafc",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Trang {page} / {totalPages} (Tổng {total} vận đơn)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={styles.btnSmMuted}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Trước
            </button>
            <button
              className={styles.btnSmMuted}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
