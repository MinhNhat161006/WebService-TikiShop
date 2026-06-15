import { useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filter
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(10);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [perUserLimit, setPerUserLimit] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await api.adminVouchers({ page, limit, search: searchTerm });
      setVouchers(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } catch (err: any) {
      console.error(err);
      setError("Không thể tải danh sách mã giảm giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVouchers();
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue(10);
    setMaxDiscountAmount("");
    setMinOrderAmount(0);
    setUsageLimit(100);
    setPerUserLimit(1);
    setStartDate("");
    setEndDate("");
    setStatus("ACTIVE");
    setError(null);
  };

  const handleOpenDrawer = () => {
    // Set default dates: start now, end 1 month later
    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Format to YYYY-MM-DDTHH:mm
    const formatDate = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartDate(formatDate(now));
    setEndDate(formatDate(oneMonthLater));
    setShowDrawer(true);
  };

  const handleToggleStatus = async (voucher: any) => {
    setError(null);
    const targetStatus = voucher.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.adminPatchVoucherStatus(voucher.id, targetStatus);
      fetchVouchers();
    } catch (err: any) {
      alert(err.message || "Không thể chuyển trạng thái mã giảm giá.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setError("Thời gian kết thúc phải lớn hơn thời gian bắt đầu.");
      return;
    }

    try {
      await api.adminCreateVoucher({
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        max_discount_amount: maxDiscountAmount.trim() === "" ? null : Number(maxDiscountAmount),
        min_order_amount: Number(minOrderAmount),
        usage_limit: Number(usageLimit),
        per_user_limit: Number(perUserLimit),
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        status,
      });

      handleCloseDrawer();
      setPage(1);
      fetchVouchers();
    } catch (err: any) {
      setError(err.message || "Không thể tạo mã giảm giá.");
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className={`${styles.pill} ${styles.pill_ok}`}>Đang hoạt động</span>;
      case "INACTIVE":
        return <span className={`${styles.pill} ${styles.pill_neutral}`}>Đã tắt</span>;
      case "EXPIRED":
        return <span className={`${styles.pill} ${styles.pill_bad}`}>Hết hạn</span>;
      default:
        return <span className={styles.pill}>{status}</span>;
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Khuyến mãi & Voucher</h1>
          <p className={styles.lead}>Xem, tạo mới và tắt/bật mã giảm giá dành cho khách hàng Tiki Shop.</p>
        </div>
        <button className={styles.btnPrimary} onClick={handleOpenDrawer}>
          + Tạo mã giảm giá (Voucher)
        </button>
      </div>

      {error && !showDrawer && (
        <div className={styles.btnDanger} style={{ padding: "10px 14px", marginBottom: "16px", borderRadius: "8px" }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {/* Filter panel */}
      <div className={styles.panel} style={{ marginBottom: "20px" }}>
        <form onSubmit={handleSearch} className={styles.toolbar} style={{ marginBottom: 0, padding: 0 }}>
          <div className={styles.searchRow} style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Tìm theo mã voucher (ví dụ: TIKINEW50)..."
              className={styles.input}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.btnPrimary} style={{ background: "#475569" }}>
            Tìm kiếm
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Đang tải...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Voucher</th>
                <th>Loại giảm</th>
                <th>Giá trị giảm</th>
                <th>Giảm tối đa</th>
                <th>Đơn tối thiểu</th>
                <th>Lượt sử dụng (Đã dùng/Tổng)</th>
                <th>Thời hạn</th>
                <th>Trạng thái</th>
                <th style={{ width: "150px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id}>
                  <td className={styles.mono} style={{ fontWeight: 700, color: "#1e40af" }}>
                    {v.code}
                  </td>
                  <td>
                    {v.discount_type === "PERCENTAGE" ? "Giảm theo phần trăm (%)" : "Giảm tiền mặt cố định"}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {v.discount_type === "PERCENTAGE" ? `${v.discount_value}%` : `${v.discount_value.toLocaleString()} đ`}
                  </td>
                  <td>
                    {v.max_discount_amount != null ? `${v.max_discount_amount.toLocaleString()} đ` : "-"}
                  </td>
                  <td>{v.min_order_amount.toLocaleString()} đ</td>
                  <td>
                    <strong>{v.used_count}</strong> / {v.usage_limit} <span style={{ fontSize: "0.8rem", color: "#64748b" }}>(Hạn mức user: {v.per_user_limit})</span>
                  </td>
                  <td style={{ fontSize: "0.8rem", color: "#475569" }}>
                    <span>Từ: {new Date(v.start_date).toLocaleString("vi-VN")}</span><br />
                    <span>Đến: {new Date(v.end_date).toLocaleString("vi-VN")}</span>
                  </td>
                  <td>{getStatusPill(v.status)}</td>
                  <td>
                    <button
                      className={v.status === "ACTIVE" ? styles.btnDanger : styles.btnPrimary}
                      style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                      onClick={() => handleToggleStatus(v)}
                    >
                      {v.status === "ACTIVE" ? "Vô hiệu hóa" : "Kích hoạt"}
                    </button>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Chưa có mã giảm giá nào được tạo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Trang {page} / {totalPages} (Tổng cộng {totalItems} Voucher)
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  className={styles.btnSmMuted}
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: page <= 1 ? "#f1f5f9" : "#fff", cursor: page <= 1 ? "not-allowed" : "pointer" }}
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  className={styles.btnSmMuted}
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", background: page >= totalPages ? "#f1f5f9" : "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer" }}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Voucher Drawer */}
      {showDrawer && (
        <div className={styles.drawerOverlay} onClick={handleCloseDrawer}>
          <div className={styles.drawerPanel} style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h2 className={styles.subtitle} style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                Tạo mã giảm giá (Voucher) mới
              </h2>
              <button className={styles.btnSmMuted} onClick={handleCloseDrawer}>
                Đóng
              </button>
            </div>

            {error && (
              <div className={styles.btnDanger} style={{ padding: "10px", marginBottom: "12px", borderRadius: "8px", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Mã giảm giá (Ví dụ: TIKINEW50)</label>
                <input
                  type="text"
                  required
                  placeholder="TIKINEW50"
                  className={styles.input}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Loại giảm giá</label>
                <select
                  className={styles.select}
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                >
                  <option value="PERCENTAGE">Giảm theo % (PERCENTAGE)</option>
                  <option value="FIXED_AMOUNT">Giảm số tiền cố định (FIXED_AMOUNT)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Giá trị giảm (Ví dụ: 10 cho 10%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className={styles.input}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Giảm tối đa (đ - Chỉ loại %)</label>
                <input
                  type="number"
                  placeholder="30000"
                  disabled={discountType !== "PERCENTAGE"}
                  className={styles.input}
                  value={maxDiscountAmount}
                  onChange={(e) => setMaxDiscountAmount(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Giá trị đơn hàng tối thiểu (đ)</label>
                <input
                  type="number"
                  required
                  min="0"
                  className={styles.input}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tổng lượt sử dụng (Hệ thống)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className={styles.input}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Lượt dùng tối đa/Tài khoản</label>
                <input
                  type="number"
                  required
                  min="1"
                  className={styles.input}
                  value={perUserLimit}
                  onChange={(e) => setPerUserLimit(Number(e.target.value))}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Thời gian bắt đầu</label>
                <input
                  type="datetime-local"
                  required
                  className={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Thời gian kết thúc</label>
                <input
                  type="datetime-local"
                  required
                  className={styles.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Trạng thái kích hoạt</label>
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
                  <option value="INACTIVE">Vô hiệu hóa (INACTIVE)</option>
                </select>
              </div>

              <div className={styles.drawerActions} style={{ gridColumn: "1 / -1", display: "flex", justifySelf: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" className={styles.btnSmMuted} onClick={handleCloseDrawer}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Lưu Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
