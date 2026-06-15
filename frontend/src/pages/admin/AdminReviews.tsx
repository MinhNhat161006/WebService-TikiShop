import { useState, useEffect, useCallback } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

// ─── Helpers ─────────────────────────────────────────────────
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
};

function StatusPill({ status }: { status: string }) {
  const pill: Record<string, string> = {
    PENDING: styles.pill_warn,
    APPROVED: styles.pill_ok,
    REJECTED: styles.pill_bad,
  };
  return (
    <span className={`${styles.pill} ${pill[status] ?? ""}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", letterSpacing: 2 }}>
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.adminReviews({
        page,
        pageSize,
        status: statusFilter || undefined,
      });
      setReviews(data.reviews);
      setTotal(data.total);
    } catch (e: any) {
      setError(e.message || "Lỗi tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.adminPatchReviewStatus(id, status);
      load();
    } catch (e: any) {
      alert(e.message || "Lỗi cập nhật trạng thái");
    }
  };

  const handleReply = async (id: string) => {
    const text = replyInputs[id]?.trim();
    if (!text) return;
    try {
      await api.adminReplyReview(id, text);
      setReplyingId(null);
      setReplyInputs((prev) => ({ ...prev, [id]: "" }));
      load();
    } catch (e: any) {
      alert(e.message || "Lỗi gửi phản hồi");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className={styles.pageTitle}>Quản lý Đánh giá & Bình luận</h1>

      {/* Filter bar */}
      <div className={styles.toolbar}>
        <select
          className={styles.input}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 200 }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </select>
        <span className={styles.muted} style={{ marginLeft: 12 }}>
          Tổng: {total} đánh giá
        </span>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {loading && <p className={styles.muted}>Đang tải...</p>}

      {!loading && reviews.length === 0 && (
        <p className={styles.muted} style={{ padding: 24 }}>
          Không có đánh giá nào.
        </p>
      )}

      {/* Review Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              background: "#fff",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {r.product?.image && (
                  <img
                    src={r.product.image}
                    alt=""
                    style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }}
                  />
                )}
                <div>
                  <strong style={{ fontSize: 14 }}>
                    {r.product?.name ?? r.productId}
                  </strong>
                  <div className={styles.muted} style={{ fontSize: 12 }}>
                    Bởi: {r.user?.name ?? r.userId} ({r.user?.email ?? ""})
                  </div>
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>

            {/* Rating + comment */}
            <div style={{ marginBottom: 8 }}>
              <StarRating rating={r.rating} />
              <span className={styles.muted} style={{ marginLeft: 12, fontSize: 12 }}>
                {fmtDate(r.createdAt)}
              </span>
            </div>
            {r.comment && (
              <p style={{ margin: "8px 0", fontSize: 14, lineHeight: 1.6 }}>{r.comment}</p>
            )}

            {/* Images */}
            {r.imageUrls && (() => {
              try {
                const urls = typeof r.imageUrls === "string" ? JSON.parse(r.imageUrls) : r.imageUrls;
                if (Array.isArray(urls) && urls.length > 0) {
                  return (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      {urls.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt={`review-img-${i}`}
                          style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6 }}
                        />
                      ))}
                    </div>
                  );
                }
              } catch {
                return null;
              }
              return null;
            })()}

            {/* Admin Reply */}
            {r.adminReply && (
              <div
                style={{
                  background: "#f0f9ff",
                  borderLeft: "3px solid #3b82f6",
                  padding: "8px 12px",
                  borderRadius: 6,
                  margin: "8px 0",
                  fontSize: 13,
                }}
              >
                <strong>Phản hồi Admin:</strong> {r.adminReply}
              </div>
            )}

            {/* Actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {r.status === "PENDING" && (
                <>
                  <button
                    className={styles.btn}
                    style={{ background: "#10b981", color: "#fff" }}
                    onClick={() => handleStatus(r.id, "APPROVED")}
                  >
                    ✓ Duyệt
                  </button>
                  <button
                    className={styles.btn}
                    style={{ background: "#ef4444", color: "#fff" }}
                    onClick={() => handleStatus(r.id, "REJECTED")}
                  >
                    ✕ Từ chối
                  </button>
                </>
              )}
              {r.status === "APPROVED" && (
                <button
                  className={styles.btn}
                  style={{ background: "#ef4444", color: "#fff" }}
                  onClick={() => handleStatus(r.id, "REJECTED")}
                >
                  Ẩn đánh giá
                </button>
              )}
              {r.status === "REJECTED" && (
                <button
                  className={styles.btn}
                  style={{ background: "#10b981", color: "#fff" }}
                  onClick={() => handleStatus(r.id, "APPROVED")}
                >
                  Khôi phục
                </button>
              )}

              {/* Reply toggle */}
              <button
                className={styles.btn}
                onClick={() =>
                  setReplyingId(replyingId === r.id ? null : r.id)
                }
              >
                💬 Phản hồi
              </button>
            </div>

            {/* Reply input */}
            {replyingId === r.id && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "flex-start" }}>
                <textarea
                  className={styles.input}
                  rows={2}
                  placeholder="Nhập phản hồi của admin..."
                  value={replyInputs[r.id] ?? r.adminReply ?? ""}
                  onChange={(e) =>
                    setReplyInputs((prev) => ({
                      ...prev,
                      [r.id]: e.target.value,
                    }))
                  }
                  style={{ flex: 1, resize: "vertical" }}
                />
                <button
                  className={styles.btn}
                  style={{ background: "#3b82f6", color: "#fff" }}
                  onClick={() => handleReply(r.id)}
                >
                  Gửi
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          <button
            className={styles.btn}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Trước
          </button>
          <span className={styles.muted} style={{ lineHeight: "36px" }}>
            {page} / {totalPages}
          </span>
          <button
            className={styles.btn}
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}
