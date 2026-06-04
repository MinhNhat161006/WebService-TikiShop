import { useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

export default function AdminBatchManagement() {
  const [batches, setBatches] = useState<any[]>([]);
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchRes, ledgerRes, brRes, prodRes] = await Promise.all([
        api.batches({ branchId: selectedBranchId, productId: selectedProductId }),
        api.ledgers({ branchId: selectedBranchId, productId: selectedProductId }),
        api.branches(),
        api.products({ limit: 100 })
      ]);
      setBatches(batchRes);
      setLedgers(ledgerRes);
      setBranches(brRes);
      setProducts(prodRes.items || []);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu lô/sổ cái:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId, selectedProductId]);

  const getMovementPill = (type: string) => {
    switch (type) {
      case "PURCHASE_RECEIPT":
        return <span className={`${styles.pill} ${styles.pill_ok}`}>Nhận hàng PO</span>;
      case "SALE":
        return <span className={`${styles.pill} ${styles.pill_neutral}`}>Bán hàng</span>;
      case "STOCK_TRANSFER_IN":
        return <span className={`${styles.pill} ${styles.pill_neutral}`} style={{ background: "#e0f2fe", color: "#0369a1" }}>Điều chuyển nhận</span>;
      case "STOCK_TRANSFER_OUT":
        return <span className={`${styles.pill} ${styles.pill_warn}`}>Điều chuyển gửi</span>;
      case "WASTE":
        return <span className={`${styles.pill} ${styles.pill_bad}`}>Hủy/Hao hụt</span>;
      case "RETURN_TO_SUPPLIER":
        return <span className={`${styles.pill} ${styles.pill_bad}`}>Trả nhà cung cấp</span>;
      default:
        return <span className={styles.pill}>{type}</span>;
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Lô hàng & Nhật ký Sổ cái (Batches & Ledger Audit)</h1>
          <p className={styles.lead}>Xem vòng đời hàng hóa từ khâu Nhập kho đến Bán hàng/Điều phối. Phục vụ công tác kiểm toán nội bộ.</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={styles.panel} style={{ marginBottom: "20px" }}>
        <div className={styles.toolbar} style={{ marginBottom: 0 }}>
          <div className={styles.searchRow}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Lọc theo Chi nhánh</label>
              <select
                className={styles.select}
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
              >
                <option value="">-- Tất cả chi nhánh --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Lọc theo Sản phẩm</label>
              <select
                className={styles.select}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">-- Tất cả sản phẩm --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Đang tải...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Batches Table (FEFO View) */}
          <div>
            <h3 className={styles.subtitle} style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px", color: "#0369a1" }}>
              Danh sách các lô hàng đang lưu kho (Batches)
            </h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Số lô</th>
                    <th>Sản phẩm</th>
                    <th>Nhà cung cấp</th>
                    <th>Hạn dùng</th>
                    <th>Số lượng tồn / nhập</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => {
                    const isExpired = new Date(b.expiryDate) < new Date();
                    return (
                      <tr key={b.id} style={{ background: isExpired ? "#fff1f2" : "inherit" }}>
                        <td className={styles.mono} style={{ fontWeight: 600 }}>{b.batchNumber}</td>
                        <td style={{ fontSize: "0.85rem" }}>
                          <strong>{b.product?.name}</strong><br />
                          <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Kho: {b.branch?.name.substring(10)}</span>
                        </td>
                        <td style={{ fontSize: "0.82rem" }}>{b.supplier?.name}</td>
                        <td style={{ fontSize: "0.85rem" }}>
                          <span>NSX: {new Date(b.mfgDate).toLocaleDateString()}</span><br />
                          <span style={{ fontWeight: 600, color: isExpired ? "#b91c1c" : "#475569" }}>
                            HSD: {new Date(b.expiryDate).toLocaleDateString()} {isExpired && "(Hết hạn)"}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.9rem" }}>
                          <strong style={{ color: b.remainingQty === 0 ? "#94a3b8" : "#0f172a" }}>
                            {b.remainingQty}
                          </strong> / {b.initialQty}
                        </td>
                      </tr>
                    );
                  })}
                  {batches.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Chưa ghi nhận lô hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger Table (Auditing Log) */}
          <div>
            <h3 className={styles.subtitle} style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "12px", color: "#0d9488" }}>
              Nhật ký Sổ cái Tồn kho (Immutable Ledgers)
            </h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Sản phẩm & Chi nhánh</th>
                    <th>Loại GD</th>
                    <th>Biến động</th>
                    <th>Tồn sau GD</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {new Date(l.timestamp).toLocaleString("vi-VN")}
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        <strong>{l.product?.name}</strong><br />
                        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Kho: {l.branch?.name.substring(10)}</span>
                      </td>
                      <td>{getMovementPill(l.movementType)}</td>
                      <td style={{ fontWeight: 700, color: l.qtyChange > 0 ? "#166534" : "#b91c1c" }}>
                        {l.qtyChange > 0 ? `+${l.qtyChange}` : l.qtyChange}
                      </td>
                      <td style={{ fontWeight: 700 }}>{l.balanceAfter}</td>
                    </tr>
                  ))}
                  {ledgers.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                        Chưa có lịch sử giao dịch sổ cái.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
