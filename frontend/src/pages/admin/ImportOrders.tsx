import { useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

export default function AdminImportOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal/Drawer
  const [selectedPO, setSelectedPO] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Create PO Drawer
  const [showCreate, setShowCreate] = useState(false);
  const [editingPOId, setEditingPOId] = useState<string | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [poItems, setPoItems] = useState<any[]>([{ productId: "", quantityOrdered: 1, pricePerUnit: 1000, isNewProduct: false, name: "", slug: "", description: "", price: 0, image: "", categoryId: "", brand: "", tags: "" }]);

  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [posRes, supRes, prodRes, catRes] = await Promise.all([
        api.purchaseOrders(),
        api.suppliers(),
        api.products({ limit: 100 }),
        api.categories()
      ]);
      setPos(posRes);
      setSuppliers(supRes);
      setProducts(prodRes.items || []);
      setCategories(catRes || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateItemChange = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    updated[index][field] = value;
    setPoItems(updated);
  };

  const addPoItem = () => {
    setPoItems([...poItems, { productId: "", quantityOrdered: 1, pricePerUnit: 1000, isNewProduct: false, name: "", slug: "", description: "", price: 0, image: "", categoryId: "", brand: "", tags: "" }]);
  };

  const removePoItem = (index: number) => {
    if (poItems.length > 1) {
      setPoItems(poItems.filter((_, i) => i !== index));
    }
  };

  const handleCloseCreateDrawer = () => {
    setShowCreate(false);
    setEditingPOId(null);
    setSupplierId("");
    setPoItems([{ productId: "", quantityOrdered: 1, pricePerUnit: 1000, isNewProduct: false, name: "", slug: "", description: "", price: 0, image: "", categoryId: "", brand: "", tags: "" }]);
    setError(null);
  };

  const handleEditPO = (po: any) => {
    setEditingPOId(po.id);
    setSupplierId(po.supplierId);
    
    const items = po.items.map((it: any) => ({
      productId: it.productId,
      quantityOrdered: it.quantityOrdered,
      pricePerUnit: it.pricePerUnit,
      isNewProduct: false,
      name: "",
      slug: "",
      description: "",
      price: 0,
      image: "",
      categoryId: "",
      brand: "",
      tags: ""
    }));
    
    setPoItems(items);
    setError(null);
    setShowDetail(false);
    setShowCreate(true);
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const itemsPayload = poItems.map(item => {
        if (item.isNewProduct) {
          return {
            isNewProduct: true,
            newProductData: {
              name: item.name,
              slug: item.slug,
              description: item.description || "Mô tả sản phẩm ERP",
              price: Number(item.price),
              image: item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=280",
              categoryId: item.categoryId,
              brand: item.brand || null,
              tags: item.tags || null
            },
            quantityOrdered: Number(item.quantityOrdered),
            pricePerUnit: Number(item.pricePerUnit)
          };
        } else {
          return {
            productId: item.productId,
            isNewProduct: false,
            quantityOrdered: Number(item.quantityOrdered),
            pricePerUnit: Number(item.pricePerUnit)
          };
        }
      });

      if (editingPOId) {
        await api.updatePurchaseOrder(editingPOId, { supplierId, items: itemsPayload });
      } else {
        await api.createPurchaseOrder({ supplierId, items: itemsPayload });
      }
      
      handleCloseCreateDrawer();
      fetchData();
    } catch (err: any) {
      setError(err.message || "Lỗi xử lý đơn hàng PO.");
    }
  };

  const handleTransition = async (poId: string, status: string) => {
    try {
      await api.updatePOStatus(poId, status);
      fetchData();
      if (selectedPO && selectedPO.id === poId) {
        const updatedPO = await api.purchaseOrder(poId);
        setSelectedPO(updatedPO);
      }
    } catch (err: any) {
      alert(err.message || "Chuyển đổi trạng thái thất bại.");
    }
  };

  const handleDeletePO = async (poId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn nhập hàng PO này không?")) {
      try {
        await api.deletePO(poId);
        setShowDetail(false);
        fetchData();
      } catch (err: any) {
        alert(err.message || "Xóa thất bại.");
      }
    }
  };

  const viewDetail = async (po: any) => {
    try {
      const details = await api.purchaseOrder(po.id);
      setSelectedPO(details);
      setShowDetail(true);
    } catch (err) {
      alert("Không thể đọc chi tiết PO.");
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case "DRAFT": return <span className={`${styles.pill} ${styles.pill_neutral}`}>Bản nháp</span>;
      case "SUBMITTED": return <span className={`${styles.pill} ${styles.pill_warn}`}>Chờ duyệt</span>;
      case "APPROVED": return <span className={`${styles.pill} ${styles.pill_ok}`} style={{ background: "#e0f2fe", color: "#0369a1" }}>Đã duyệt</span>;
      case "RECEIVING": return <span className={`${styles.pill} ${styles.pill_warn}`}>Đang nhận</span>;
      case "COMPLETED": return <span className={`${styles.pill} ${styles.pill_ok}`}>Đã hoàn thành</span>;
      case "CANCELLED": return <span className={`${styles.pill} ${styles.pill_bad}`}>Đã hủy</span>;
      default: return <span className={styles.pill}>{status}</span>;
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Đơn nhập hàng (Purchase Orders)</h1>
          <p className={styles.lead}>Quy trình cung ứng: Dự thảo PO → Quản lý Duyệt → Nhập hàng qua GR → Nhập kho tự động.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { handleCloseCreateDrawer(); setShowCreate(true); }}>
          + Tạo đơn nhập hàng (PO)
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Đang tải...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Số PO</th>
                <th>Nhà Cung Cấp</th>
                <th>Tổng tiền ước tính</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th>Phê duyệt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((p) => {
                const totalVal = p.items.reduce((sum: number, it: any) => sum + it.quantityOrdered * it.pricePerUnit, 0);
                return (
                  <tr key={p.id}>
                    <td className={styles.mono} style={{ fontWeight: 600 }}>{p.poNumber}</td>
                    <td style={{ fontWeight: 500 }}>{p.supplier?.name}</td>
                    <td style={{ fontWeight: 600, color: "#475569" }}>{totalVal.toLocaleString()} đ</td>
                    <td>{new Date(p.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>{getStatusPill(p.status)}</td>
                    <td>
                      {p.approvedAt ? (
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          <span>Bởi: {p.approvedById}</span><br />
                          <span>Lúc: {new Date(p.approvedAt).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Chưa duyệt</span>
                      )}
                    </td>
                    <td>
                      <button className={styles.btnSm} onClick={() => viewDetail(p)}>
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
              {pos.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Chưa có đơn nhập hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PO Detail Drawer */}
      {showDetail && selectedPO && (
        <div className={styles.drawerOverlay} onClick={() => setShowDetail(false)}>
          <div className={styles.drawerPanel} style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h2 className={styles.subtitle} style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                Chi tiết Đơn nhập hàng {selectedPO.poNumber}
              </h2>
              <button className={styles.btnSmMuted} onClick={() => setShowDetail(false)}>
                Đóng
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", background: "#f8fafc", padding: "14px", borderRadius: "10px" }}>
              <div>
                <p style={{ margin: "4px 0" }}><strong>Nhà cung cấp:</strong> {selectedPO.supplier?.name}</p>
                <p style={{ margin: "4px 0" }}><strong>Mã số thuế / Code:</strong> {selectedPO.supplier?.code}</p>
                <p style={{ margin: "4px 0" }}><strong>Địa chỉ:</strong> {selectedPO.supplier?.address}</p>
              </div>
              <div>
                <p style={{ margin: "4px 0" }}><strong>Trạng thái:</strong> {getStatusPill(selectedPO.status)}</p>
                <p style={{ margin: "4px 0" }}><strong>Ngày khởi tạo:</strong> {new Date(selectedPO.createdAt).toLocaleString("vi-VN")}</p>
                {selectedPO.approvedAt && (
                  <p style={{ margin: "4px 0", color: "#0369a1" }}>
                    <strong>Được phê duyệt bởi:</strong> {selectedPO.approvedById} ({new Date(selectedPO.approvedAt).toLocaleDateString()})
                  </p>
                )}
              </div>
            </div>

            <h3 className={styles.subtitle} style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px" }}>Danh sách sản phẩm yêu cầu</h3>
            <div className={styles.tableWrap} style={{ marginBottom: "20px" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>SKU</th>
                    <th>Số lượng đặt</th>
                    <th>Đơn giá nhập</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPO.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.product?.name}</td>
                      <td className={styles.mono}>{item.product?.sku}</td>
                      <td style={{ fontWeight: 600 }}>{item.quantityOrdered}</td>
                      <td>{item.pricePerUnit.toLocaleString()} đ</td>
                      <td style={{ fontWeight: 600 }}>{(item.quantityOrdered * item.pricePerUnit).toLocaleString()} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPO.goodsReceipts?.length > 0 && (
              <>
                <h3 className={styles.subtitle} style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "8px", color: "#0d9488" }}>Lịch sử Nhận hàng (Goods Receipts)</h3>
                <div className={styles.tableWrap} style={{ marginBottom: "20px" }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Số Phiếu GR</th>
                        <th>Người nhận</th>
                        <th>Ngày nhận</th>
                        <th>Sản phẩm & Số lượng nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPO.goodsReceipts.map((gr: any) => (
                        <tr key={gr.id}>
                          <td className={styles.mono} style={{ fontWeight: 600 }}>{gr.grNumber}</td>
                          <td>{gr.receivedById}</td>
                          <td>{new Date(gr.receivedDate).toLocaleString("vi-VN")}</td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: "16px" }}>
                              {gr.items.map((gri: any) => (
                                <li key={gri.id}>
                                  {gri.product?.name}: <strong style={{ color: "#0f766e" }}>{gri.qtyReceived}</strong> (Lỗi: {gri.qtyDamaged})
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* State Machine Transition Actions */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {selectedPO.status === "DRAFT" && (
                <>
                  <button className={styles.btnPrimary} onClick={() => handleTransition(selectedPO.id, "SUBMITTED")}>
                    Gửi yêu cầu duyệt (Submit)
                  </button>
                  <button className={styles.btnSm} style={{ background: "#f59e0b", color: "#fff", borderColor: "#d97706" }} onClick={() => handleEditPO(selectedPO)}>
                    Sửa PO
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDeletePO(selectedPO.id)}>
                    Xóa PO
                  </button>
                </>
              )}
              {selectedPO.status === "SUBMITTED" && (
                <>
                  <button className={styles.btnPrimary} style={{ background: "#2563eb" }} onClick={() => handleTransition(selectedPO.id, "APPROVED")}>
                    Phê duyệt đơn hàng (Approve)
                  </button>
                  <button className={styles.btnSm} style={{ background: "#f59e0b", color: "#fff", borderColor: "#d97706" }} onClick={() => handleEditPO(selectedPO)}>
                    Sửa PO
                  </button>
                  <button className={styles.btnSmMuted} onClick={() => handleTransition(selectedPO.id, "DRAFT")}>
                    Trả về bản nháp (Reject)
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleTransition(selectedPO.id, "CANCELLED")}>
                    Hủy đơn mua (Cancel)
                  </button>
                </>
              )}
              {selectedPO.status === "APPROVED" && (
                <button className={styles.btnDanger} onClick={() => handleTransition(selectedPO.id, "CANCELLED")}>
                  Hủy đơn (Cancel PO)
                </button>
              )}
              {selectedPO.status === "RECEIVING" && (
                <span style={{ color: "#64748b", fontSize: "0.9rem", fontStyle: "italic" }}>
                  Đơn hàng đang trong quá trình nhập kho. Chờ hoàn thành.
                </span>
              )}
              {(selectedPO.status === "COMPLETED" || selectedPO.status === "CANCELLED") && (
                <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  PO đã đóng (Trạng thái cuối). Không thể chỉnh sửa hoặc chuyển đổi.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create PO Drawer */}
      {showCreate && (
        <div className={styles.drawerOverlay} onClick={handleCloseCreateDrawer}>
          <div className={styles.drawerPanel} style={{ maxWidth: "780px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h2 className={styles.subtitle} style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {editingPOId ? `Chỉnh sửa Đơn nhập hàng PO (${selectedPO?.poNumber})` : "Tạo Đơn nhập hàng PO mới"}
              </h2>
              <button className={styles.btnSmMuted} onClick={handleCloseCreateDrawer}>
                Đóng
              </button>
            </div>

            {error && <div className={styles.btnDanger} style={{ padding: "10px", marginBottom: "12px", borderRadius: "8px" }}>{error}</div>}

            <form onSubmit={handleCreatePO}>
              <div className={styles.field} style={{ marginBottom: "16px" }}>
                <label className={styles.fieldLabel}>Chọn nhà cung cấp</label>
                <select
                  required
                  className={styles.select}
                  style={{ width: "100%" }}
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">-- Chọn Nhà Cung Cấp --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h3 className={styles.subtitle} style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>Danh mục sản phẩm mua</h3>
                <button type="button" className={styles.btnSm} onClick={addPoItem}>
                  + Thêm dòng sản phẩm
                </button>
              </div>

              {poItems.map((item, idx) => (
                <div key={idx} style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                    {poItems.length > 1 && (
                      <button type="button" className={styles.btnDanger} style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => removePoItem(idx)}>
                        Xóa dòng
                      </button>
                    )}
                  </div>

                  <div className={styles.formGrid} style={{ marginBottom: "10px" }}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Loại sản phẩm</label>
                      <select
                        className={styles.select}
                        value={item.isNewProduct ? "NEW" : "EXISTING"}
                        onChange={(e) => handleCreateItemChange(idx, "isNewProduct", e.target.value === "NEW")}
                      >
                        <option value="EXISTING">Sản phẩm có sẵn</option>
                        <option value="NEW">Sản phẩm mới (Tạo nhanh - Section 6)</option>
                      </select>
                    </div>

                    {!item.isNewProduct ? (
                      <div className={styles.field}>
                        <label className={styles.fieldLabel}>Chọn sản phẩm</label>
                        <select
                          required
                          className={styles.select}
                          value={item.productId}
                          onChange={(e) => handleCreateItemChange(idx, "productId", e.target.value)}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Tên sản phẩm mới</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: Nước ngọt Coca 330ml"
                            className={styles.input}
                            value={item.name}
                            onChange={(e) => handleCreateItemChange(idx, "name", e.target.value)}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Slug sản phẩm</label>
                          <input
                            type="text"
                            required
                            placeholder="nuoc-ngot-coca-330ml"
                            className={styles.input}
                            value={item.slug}
                            onChange={(e) => handleCreateItemChange(idx, "slug", e.target.value)}
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Danh mục</label>
                          <select
                            required
                            className={styles.select}
                            value={item.categoryId}
                            onChange={(e) => handleCreateItemChange(idx, "categoryId", e.target.value)}
                          >
                            <option value="">-- Danh mục --</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.fieldLabel}>Giá bán lẻ niêm yết (đ)</label>
                          <input
                            type="number"
                            required
                            className={styles.input}
                            value={item.price}
                            onChange={(e) => handleCreateItemChange(idx, "price", e.target.value)}
                          />
                        </div>
                        <div className={styles.fieldFull}>
                          <label className={styles.fieldLabel}>Mô tả</label>
                          <input
                            type="text"
                            className={styles.input}
                            value={item.description}
                            onChange={(e) => handleCreateItemChange(idx, "description", e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Số lượng đặt hàng</label>
                      <input
                        type="number"
                        required
                        min="1"
                        className={styles.input}
                        value={item.quantityOrdered}
                        onChange={(e) => handleCreateItemChange(idx, "quantityOrdered", e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Giá nhập ước tính (Mỗi sản phẩm)</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className={styles.input}
                        value={item.pricePerUnit}
                        onChange={(e) => handleCreateItemChange(idx, "pricePerUnit", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.drawerActions} style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className={styles.btnSmMuted} onClick={handleCloseCreateDrawer}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingPOId ? "Cập nhật Đơn Mua" : "Lưu Đơn Mua (Draft PO)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
