import { useState, useEffect, useCallback } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

// ─── Helpers ─────────────────────────────────────────────────
const fmtPrice = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  COMPLETED: "Hoàn thành",
};

function StatusPill({ status }: { status: string }) {
  const pill: Record<string, string> = {
    PENDING: styles.pill_warn,
    APPROVED: styles.pill_neutral,
    REJECTED: styles.pill_bad,
    COMPLETED: styles.pill_ok,
  };
  return (
    <span className={`${styles.pill} ${pill[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ─── Receive Form Component ───────────────────────────────────
interface ReceiveItem {
  product_id: string;
  product_name: string;
  product_sku: string | null;
  max_qty: number;
  return_quantity: number;
  condition: "INTACT" | "DAMAGED";
}

function ReceiveForm({
  requestId,
  items,
  onSuccess,
}: {
  requestId: string;
  items: any[];
  onSuccess: () => void;
}) {
  const [receiveItems, setReceiveItems] = useState<ReceiveItem[]>(
    items.map((it) => ({
      product_id: it.productId,
      product_name: it.product?.name ?? it.productId,
      product_sku: it.product?.sku ?? null,
      max_qty: it.return_quantity,
      return_quantity: it.return_quantity,
      condition: "INTACT",
    }))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (idx: number, field: "return_quantity" | "condition", val: string) => {
    setReceiveItems((prev) => {
      const copy = [...prev];
      if (field === "return_quantity") {
        copy[idx] = { ...copy[idx], return_quantity: Math.max(1, Math.min(copy[idx].max_qty, Number(val))) };
      } else {
        copy[idx] = { ...copy[idx], condition: val as "INTACT" | "DAMAGED" };
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.adminReceiveReturn(
        requestId,
        receiveItems.map((it) => ({
          product_id: it.product_id,
          return_quantity: it.return_quantity,
          condition: it.condition,
        }))
      );
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Không thể xác nhận nhận hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#b91c1c",
            fontSize: "0.88rem",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}
      <div className={styles.tableWrap} style={{ marginBottom: "16px" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>SKU</th>
              <th style={{ width: "100px" }}>SL khách trả</th>
              <th style={{ width: "140px" }}>SL thực nhận</th>
              <th style={{ width: "160px" }}>Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {receiveItems.map((item, idx) => (
              <tr key={item.product_id}>
                <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                <td className={styles.mono}>{item.product_sku ?? "—"}</td>
                <td style={{ textAlign: "center" }}>{item.max_qty}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={item.max_qty}
                    value={item.return_quantity}
                    onChange={(e) => handleChange(idx, "return_quantity", e.target.value)}
                    className={styles.input}
                    style={{ minWidth: "unset", padding: "6px 8px", textAlign: "center" }}
                  />
                </td>
                <td>
                  <select
                    value={item.condition}
                    onChange={(e) => handleChange(idx, "condition", e.target.value)}
                    className={styles.selectSm}
                    style={{
                      color: item.condition === "INTACT" ? "#065f46" : "#b91c1c",
                      fontWeight: 700,
                      minWidth: "unset",
                    }}
                  >
                    <option value="INTACT"> Còn nguyên vẹn</option>
                    <option value="DAMAGED"> Lỗi / Hỏng</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? "Đang xử lý..." : "✓ Xác nhận nhập kho"}
        </button>
      </div>
    </form>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────
function ReturnDetail({
  returnId,
  onClose,
  onRefresh,
}: {
  returnId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [detail, setDetail] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showReceive, setShowReceive] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminReturnDetail(returnId);
      setDetail(data);
      setShowReceive(false);
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleApprove = async () => {
    if (!confirm("Xác nhận duyệt yêu cầu trả hàng này?")) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await api.adminApproveReturn(returnId);
      await fetchDetail();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Không thể duyệt yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Xác nhận TỪ CHỐI yêu cầu trả hàng này?")) return;
    setActionError(null);
    setActionLoading(true);
    try {
      await api.adminRejectReturn(returnId);
      await fetchDetail();
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Không thể từ chối yêu cầu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveSuccess = async () => {
    await fetchDetail();
    onRefresh();
  };

  if (loading) {
    return (
      <div className={styles.panel} style={{ marginTop: "20px", textAlign: "center", padding: "3rem" }}>
        Đang tải chi tiết...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles.panel} style={{ marginTop: "20px" }}>
        Không thể tải thông tin yêu cầu.
        <button onClick={onClose} className={styles.btnSmMuted} style={{ marginLeft: "12px" }}>
          Đóng
        </button>
      </div>
    );
  }

  return (
    <div
      className={styles.panel}
      style={{ marginTop: "20px", border: "2px solid #e0f2fe", borderRadius: "14px" }}
    >
      {/* Header */}
      <div className={styles.toolbar} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ flex: 1 }}>
          <h2 className={styles.subtitle} style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
            Chi tiết yêu cầu trả hàng
          </h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
            <span className={styles.mono} style={{ fontSize: "0.85rem", color: "#64748b" }}>
              {detail.id}
            </span>
            <StatusPill status={detail.status} />
          </div>
        </div>
        <button onClick={onClose} className={styles.btnSmMuted}>
          ✕ Đóng
        </button>
      </div>

      {/* Info grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "20px",
        }}
      >
        <div className={styles.panel} style={{ padding: "14px 16px" }}>
          <div className={styles.fieldLabel}>Khách hàng</div>
          <div style={{ fontWeight: 700, marginTop: "4px" }}>{detail.user?.name}</div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{detail.user?.email}</div>
          {detail.user?.phone && (
            <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{detail.user.phone}</div>
          )}
        </div>
        <div className={styles.panel} style={{ padding: "14px 16px" }}>
          <div className={styles.fieldLabel}>Đơn hàng gốc</div>
          <div className={styles.mono} style={{ fontWeight: 700, marginTop: "4px", fontSize: "0.85rem" }}>
            #{detail.order?.id?.slice(-8).toUpperCase()}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
            Giá trị: {fmtPrice(detail.order?.total ?? 0)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
            {detail.order?.createdAt ? fmtDate(detail.order.createdAt) : ""}
          </div>
        </div>
        <div className={styles.panel} style={{ padding: "14px 16px" }}>
          <div className={styles.fieldLabel}>Số tiền hoàn lại</div>
          <div
            style={{ fontWeight: 800, fontSize: "1.3rem", color: "#dc2626", marginTop: "4px" }}
          >
            {fmtPrice(detail.refund_amount)}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
            Tạo lúc: {fmtDate(detail.createdAt)}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div style={{ marginBottom: "20px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 16px" }}>
        <div className={styles.fieldLabel} style={{ marginBottom: "4px" }}>Lý do trả hàng</div>
        <p style={{ margin: 0, fontSize: "0.95rem" }}>{detail.reason}</p>
      </div>

      {/* Items table */}
      <div style={{ marginBottom: "20px" }}>
        <div className={styles.fieldLabel} style={{ marginBottom: "8px" }}>
          Danh sách sản phẩm trả ({detail.items?.length ?? 0} mặt hàng)
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th style={{ width: "130px", textAlign: "center" }}>SL trả</th>
                <th style={{ width: "160px" }}>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              {detail.items?.map((item: any) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                        />
                      )}
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{item.product?.name}</span>
                    </div>
                  </td>
                  <td className={styles.mono} style={{ color: "#64748b" }}>
                    {item.product?.sku ?? "—"}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>{item.return_quantity}</td>
                  <td>
                    {detail.status === "COMPLETED" ? (
                      <span
                        style={{
                          fontWeight: 700,
                          color: item.condition === "INTACT" ? "#065f46" : "#b91c1c",
                          fontSize: "0.85rem",
                        }}
                      >
                        {item.condition === "INTACT" ? "Còn nguyên vẹn" : "Lỗi / Hỏng"}
                      </span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Chờ kiểm tra</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#b91c1c",
            fontSize: "0.88rem",
            marginBottom: "12px",
          }}
        >
          {actionError}
        </div>
      )}

      {/* Actions for PENDING */}
      {detail.status === "PENDING" && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            className={styles.btnPrimary}
            onClick={handleApprove}
            disabled={actionLoading}
            style={{ flex: 1 }}
          >
            ✓ Duyệt yêu cầu
          </button>
          <button
            className={styles.btnDanger}
            onClick={handleReject}
            disabled={actionLoading}
            style={{ flex: 1, padding: "10px 18px", fontWeight: 600, borderRadius: "8px" }}
          >
            ✗ Từ chối yêu cầu
          </button>
        </div>
      )}

      {/* Receive form for APPROVED */}
      {detail.status === "APPROVED" && (
        <div
          style={{
            padding: "16px",
            background: "#f0fdf4",
            borderRadius: "10px",
            border: "2px solid #86efac",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: showReceive ? "16px" : 0,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: "#065f46", fontSize: "0.95rem" }}>
                Xác nhận nhận hàng về kho
              </div>
              <div style={{ fontSize: "0.82rem", color: "#14532d", marginTop: "2px" }}>
                Kiểm tra hàng thực nhận và cập nhật tình trạng (INTACT / DAMAGED) trước khi nhập kho.
              </div>
            </div>
            {!showReceive && (
              <button
                className={styles.btnPrimary}
                onClick={() => setShowReceive(true)}
                style={{ background: "#16a34a", flexShrink: 0 }}
              >
                Mở form nhận hàng →
              </button>
            )}
          </div>
          {showReceive && (
            <ReceiveForm
              requestId={detail.id}
              items={detail.items ?? []}
              onSuccess={handleReceiveSuccess}
            />
          )}
        </div>
      )}

      {/* Completed status notice */}
      {detail.status === "COMPLETED" && (
        <div
          style={{
            padding: "14px 16px",
            background: "#f0fdf4",
            borderRadius: "10px",
            border: "1px solid #86efac",
            color: "#065f46",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Yêu cầu trả hàng đã hoàn thành. Kho đã được cập nhật theo tình trạng thực tế của hàng.
        </div>
      )}

      {/* Rejected status notice */}
      {detail.status === "REJECTED" && (
        <div
          style={{
            padding: "14px 16px",
            background: "#fef2f2",
            borderRadius: "10px",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          Yêu cầu trả hàng này đã bị từ chối.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminReturns() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.adminReturns({
        page,
        limit,
        status: filterStatus || undefined,
      });
      setReturns(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách yêu cầu trả hàng");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filterStatus]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1);
    setSelectedId(null);
  };

  const handleSelectRow = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Đổi trả hàng</h1>
          <p className={styles.lead}>
            Xem xét và xử lý yêu cầu trả hàng từ khách hàng. Xác nhận hàng nhận về và cập nhật kho tự động.
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
          <span style={{ color: "#64748b" }}>Tổng:</span>
          <span style={{ fontWeight: 700 }}>{total} yêu cầu</span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          flexWrap: "wrap",
        }}
      >
        {[
          { value: "", label: "Tất cả" },
          { value: "PENDING", label: "Chờ duyệt" },
          { value: "APPROVED", label: "Đã duyệt" },
          { value: "REJECTED", label: "Từ chối" },
          { value: "COMPLETED", label: "Hoàn thành" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "1px solid",
              cursor: "pointer",
              fontWeight: filterStatus === tab.value ? 700 : 500,
              fontSize: "0.85rem",
              borderColor: filterStatus === tab.value ? "#0d9488" : "#cbd5e1",
              background: filterStatus === tab.value ? "#0d9488" : "#fff",
              color: filterStatus === tab.value ? "#fff" : "#475569",
              transition: "all 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#b91c1c",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Đang tải...
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã yêu cầu</th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Số tiền hoàn</th>
                <th>Số SP trả</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style={{ width: "100px" }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((rr) => (
                <>
                  <tr
                    key={rr.id}
                    style={{
                      cursor: "pointer",
                      background: selectedId === rr.id ? "#f0f9ff" : undefined,
                      transition: "background 0.15s",
                    }}
                    onClick={() => handleSelectRow(rr.id)}
                  >
                    <td className={styles.mono} style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      #{rr.id.slice(-8).toUpperCase()}
                    </td>
                    <td className={styles.mono} style={{ fontSize: "0.8rem", color: "#0284c7" }}>
                      #{rr.order?.id?.slice(-8).toUpperCase() ?? "—"}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rr.user?.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{rr.user?.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: "#dc2626" }}>{fmtPrice(rr.refund_amount)}</td>
                    <td style={{ textAlign: "center" }}>{rr.items?.length ?? 0} SP</td>
                    <td>
                      <StatusPill status={rr.status} />
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#64748b" }}>{fmtDate(rr.createdAt)}</td>
                    <td>
                      <button
                        className={selectedId === rr.id ? styles.btnSm : styles.btnSmMuted}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(rr.id);
                        }}
                        style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                      >
                        {selectedId === rr.id ? "Đang xem ▲" : "Xem ▼"}
                      </button>
                    </td>
                  </tr>
                  {selectedId === rr.id && (
                    <tr key={`${rr.id}-detail`}>
                      <td colSpan={8} style={{ padding: "0 12px 16px" }}>
                        <ReturnDetail
                          returnId={rr.id}
                          onClose={() => setSelectedId(null)}
                          onRefresh={fetchReturns}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}
                  >
                    {filterStatus
                      ? `Không có yêu cầu trả hàng nào ở trạng thái "${STATUS_LABELS[filterStatus]}".`
                      : "Chưa có yêu cầu trả hàng nào."}
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
            Trang {page} / {totalPages} (Tổng {total} yêu cầu)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={styles.btnSmMuted}
              disabled={page <= 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelectedId(null); }}
            >
              ← Trước
            </button>
            <button
              className={styles.btnSmMuted}
              disabled={page >= totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelectedId(null); }}
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
