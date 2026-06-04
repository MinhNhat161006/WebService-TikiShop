import { useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

export default function AdminGoodsReceipts() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create GR Modal/Drawer
  const [showCreate, setShowCreate] = useState(false);
  const [editingGRId, setEditingGRId] = useState<string | null>(null);
  const [selectedPOId, setSelectedPOId] = useState("");
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [branchId, setBranchId] = useState("");
  const [receivedById, setReceivedById] = useState("");
  const [grItems, setGrItems] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grRes, poRes, brRes] = await Promise.all([
        api.goodsReceipts(),
        api.purchaseOrders(),
        api.branches()
      ]);
      setReceipts(grRes);
      // Only allow receiving against POs that are APPROVED or RECEIVING
      setPos(poRes.filter((p: any) => p.status === "APPROVED" || p.status === "RECEIVING"));
      setBranches(brRes);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePOChange = async (poId: string) => {
    setSelectedPOId(poId);
    setError(null);
    if (!poId) {
      setSelectedPO(null);
      setGrItems([]);
      return;
    }

    try {
      const details = await api.purchaseOrder(poId);
      setSelectedPO(details);

      // Prepare items for Goods Receipt
      // For each PO item, determine how many have been received so far to show the user and validate limits.
      const itemsToReceive = details.items.map((poItem: any) => {
        let alreadyReceived = 0;
        if (details.goodsReceipts) {
          for (const gr of details.goodsReceipts) {
            const grItem = gr.items.find((i: any) => i.productId === poItem.productId);
            if (grItem) {
              alreadyReceived += grItem.qtyReceived;
            }
          }
        }

        const remaining = Math.max(0, poItem.quantityOrdered - alreadyReceived);

        return {
          productId: poItem.productId,
          productName: poItem.product?.name,
          sku: poItem.product?.sku,
          quantityOrdered: poItem.quantityOrdered,
          alreadyReceived,
          remainingToReceive: remaining,
          qtyReceived: remaining, // default to remaining
          qtyDamaged: 0
        };
      });

      setGrItems(itemsToReceive);
    } catch (err) {
      setError("Không thể tải thông tin chi tiết đơn PO.");
    }
  };

  const handleQtyChange = (idx: number, field: string, val: number) => {
    const updated = [...grItems];
    updated[idx][field] = val;
    setGrItems(updated);
  };

  const handleCloseCreateDrawer = () => {
    setShowCreate(false);
    setEditingGRId(null);
    setSelectedPOId("");
    setSelectedPO(null);
    setBranchId("");
    setReceivedById("");
    setGrItems([]);
    setError(null);
  };

  const handleEditGR = async (gr: any) => {
    setError(null);
    setEditingGRId(gr.id);
    setBranchId(gr.branchId);
    setReceivedById(gr.receivedById);
    setSelectedPOId(gr.purchaseOrderId);

    try {
      const poDetails = await api.purchaseOrder(gr.purchaseOrderId);
      setSelectedPO(poDetails);

      const itemsToEdit = poDetails.items.map((poItem: any) => {
        // Find how many received in OTHER receipts
        let otherReceived = 0;
        if (poDetails.goodsReceipts) {
          for (const otherGr of poDetails.goodsReceipts) {
            if (otherGr.id !== gr.id) {
              const grItem = otherGr.items.find((i: any) => i.productId === poItem.productId);
              if (grItem) {
                otherReceived += grItem.qtyReceived;
              }
            }
          }
        }

        const thisGrItem = gr.items.find((i: any) => i.productId === poItem.productId);
        const currentQtyReceived = thisGrItem ? thisGrItem.qtyReceived : 0;
        const currentQtyDamaged = thisGrItem ? thisGrItem.qtyDamaged : 0;

        const remaining = Math.max(0, poItem.quantityOrdered - otherReceived);

        return {
          productId: poItem.productId,
          productName: poItem.product?.name,
          sku: poItem.product?.sku,
          quantityOrdered: poItem.quantityOrdered,
          alreadyReceived: otherReceived,
          remainingToReceive: remaining,
          qtyReceived: currentQtyReceived,
          qtyDamaged: currentQtyDamaged
        };
      });

      setGrItems(itemsToEdit);
      setShowCreate(true);
    } catch (err: any) {
      setError("Không thể tải thông tin chi tiết đơn PO để chỉnh sửa.");
    }
  };

  const handleDeleteGR = async (grId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phiếu nhận hàng này? Việc này sẽ giảm tồn kho tương ứng của các lô hàng.")) return;
    setError(null);
    try {
      await api.deleteGoodsReceipt(grId);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Xóa phiếu nhận hàng thất bại.");
    }
  };

  const handleCreateGR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Front-end Validation (Section 3 limit)
    for (const item of grItems) {
      if (item.qtyReceived > item.remainingToReceive) {
        setError(
          `Nhận vượt mức tối đa! Sản phẩm: ${item.productName}. ` +
          `Yêu cầu nhận: ${item.qtyReceived}, Số lượng tối đa còn lại: ${item.remainingToReceive}.`
        );
        return;
      }
    }

    try {
      if (editingGRId) {
        await api.updateGoodsReceipt(editingGRId, {
          items: grItems.map(item => ({
            productId: item.productId,
            qtyReceived: Number(item.qtyReceived),
            qtyDamaged: Number(item.qtyDamaged)
          }))
        });
      } else {
        await api.createGoodsReceipt({
          purchaseOrderId: selectedPOId,
          branchId,
          receivedById: receivedById || "Manager",
          items: grItems.map(item => ({
            productId: item.productId,
            qtyReceived: Number(item.qtyReceived),
            qtyDamaged: Number(item.qtyDamaged)
          }))
        });
      }

      handleCloseCreateDrawer();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Xử lý phiếu nhận hàng thất bại.");
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Phiếu nhận hàng (Goods Receipts)</h1>
          <p className={styles.lead}>Biên bản kiểm hàng thực tế: Đối chiếu Số lượng thực nhận với PO, ghi nhận hư hỏng/lỗi.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { handleCloseCreateDrawer(); setShowCreate(true); }}>
          + Nhận hàng vào kho (GR)
        </button>
      </div>

      {error && !showCreate && (
        <div className={styles.btnDanger} style={{ padding: "10px 14px", marginBottom: "16px", borderRadius: "8px", cursor: "default", display: "inline-block", width: "100%" }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Đang tải...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã phiếu GR</th>
                <th>Số PO tham chiếu</th>
                <th>Chi nhánh nhận</th>
                <th>Người tiếp nhận</th>
                <th>Ngày nhận hàng</th>
                <th>Chi tiết thực nhận</th>
                <th style={{ width: "140px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((gr) => (
                <tr key={gr.id}>
                  <td className={styles.mono} style={{ fontWeight: 600 }}>{gr.grNumber}</td>
                  <td className={styles.mono}>{gr.purchaseOrder?.poNumber}</td>
                  <td style={{ fontWeight: 500 }}>{gr.branch?.name}</td>
                  <td>{gr.receivedById}</td>
                  <td>{new Date(gr.receivedDate).toLocaleString("vi-VN")}</td>
                  <td>
                    <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85rem", color: "#475569" }}>
                      {gr.items.map((gri: any) => (
                        <li key={gri.id}>
                          {gri.product?.name}: <strong style={{ color: "#0f766e" }}>{gri.qtyReceived}</strong> (Lỗi: {gri.qtyDamaged})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <div className={styles.rowBtns}>
                      <button className={styles.btnSm} onClick={() => handleEditGR(gr)}>
                        Sửa
                      </button>
                      <button className={styles.btnDanger} onClick={() => handleDeleteGR(gr.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Chưa có phiếu nhận hàng nào được xử lý.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Process GR Drawer */}
      {showCreate && (
        <div className={styles.drawerOverlay} onClick={handleCloseCreateDrawer}>
          <div className={styles.drawerPanel} style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h2 className={styles.subtitle} style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {editingGRId ? "Cập nhật Phiếu nhận hàng (Goods Receipt)" : "Xử lý Phiếu nhận hàng (Goods Receipt)"}
              </h2>
              <button className={styles.btnSmMuted} onClick={handleCloseCreateDrawer}>
                Đóng
              </button>
            </div>

            {error && <div className={styles.btnDanger} style={{ padding: "10px", marginBottom: "12px", borderRadius: "8px", cursor: "default" }}>{error}</div>}

            <form onSubmit={handleCreateGR}>
              <div className={styles.formGrid} style={{ marginBottom: "16px" }}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Chọn Đơn mua hàng (PO) đã duyệt</label>
                  <select
                    required
                    disabled={!!editingGRId}
                    className={styles.select}
                    value={selectedPOId}
                    onChange={(e) => handlePOChange(e.target.value)}
                  >
                    <option value="">-- Chọn PO cần nhập kho --</option>
                    {pos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.poNumber} - {p.supplier?.name} (Tình trạng: {p.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Chọn chi nhánh nhận hàng</label>
                  <select
                    required
                    disabled={!!editingGRId}
                    className={styles.select}
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="">-- Chọn chi nhánh nhận --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Tên thủ kho tiếp nhận</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn Kiểm Kho"
                    className={styles.input}
                    value={receivedById}
                    onChange={(e) => setReceivedById(e.target.value)}
                  />
                </div>
              </div>

              {selectedPO && grItems.length > 0 && (
                <>
                  <h3 className={styles.subtitle} style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "10px" }}>
                    Danh sách sản phẩm trong PO
                  </h3>

                  {grItems.map((item, idx) => (
                    <div key={idx} style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #e2e8f0" }}>
                      <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>{item.productName} (SKU: {item.sku})</p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", fontSize: "0.85rem", color: "#64748b", marginBottom: "10px" }}>
                        <div>Đặt hàng: <strong>{item.quantityOrdered}</strong></div>
                        <div>Đã nhận trước đó: <strong>{item.alreadyReceived}</strong></div>
                        <div style={{ color: "#0d9488" }}>Tối đa có thể nhận: <strong>{item.remainingToReceive}</strong></div>
                      </div>

                      <div className={styles.formGrid}>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Số lượng thực nhận đợt này</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max={item.remainingToReceive}
                            className={styles.input}
                            value={item.qtyReceived}
                            onChange={(e) => handleQtyChange(idx, "qtyReceived", Number(e.target.value))}
                          />
                        </div>

                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Số lượng hỏng / lỗi (nếu có)</label>
                          <input
                            type="number"
                            required
                            min="0"
                            className={styles.input}
                            value={item.qtyDamaged}
                            onChange={(e) => handleQtyChange(idx, "qtyDamaged", Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <div className={styles.drawerActions} style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className={styles.btnSmMuted} onClick={handleCloseCreateDrawer}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={!selectedPO || grItems.length === 0}>
                  {editingGRId ? "Cập nhật Nhập kho" : "Xác nhận Nhập kho (Process GR)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
