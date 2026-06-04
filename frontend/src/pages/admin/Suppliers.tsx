import { useState, useEffect } from "react";
import { api } from "@/shared/api/client";
import styles from "./AdminPages.module.css";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.suppliers();
      setSuppliers(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleEditClick = (s: any) => {
    setEditingSupplierId(s.id);
    setName(s.name || "");
    setCode(s.code || "");
    setContactName(s.contactName || "");
    setPhone(s.phone || "");
    setEmail(s.email || "");
    setAddress(s.address || "");
    setError(null);
    setShowDrawer(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này? Không thể khôi phục nếu tiếp tục.")) return;
    setError(null);
    try {
      await api.deleteSupplier(id);
      fetchSuppliers();
    } catch (err: any) {
      setError(err.message || "Không thể xóa nhà cung cấp.");
    }
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setEditingSupplierId(null);
    setName("");
    setCode("");
    setContactName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingSupplierId) {
        await api.updateSupplier(editingSupplierId, { name, code, contactName, phone, email, address });
      } else {
        await api.createSupplier({ name, code, contactName, phone, email, address });
      }
      handleCloseDrawer();
      fetchSuppliers();
    } catch (err: any) {
      setError(err.message || "Không thể lưu thông tin nhà cung cấp.");
    }
  };

  return (
    <div>
      <div className={styles.toolbar}>
        <div style={{ flex: 1 }}>
          <h1 className={styles.title}>Quản lý Nhà cung cấp (Suppliers)</h1>
          <p className={styles.lead}>Xem danh sách và thêm đối tác cung ứng hàng hóa cho Tiki Shop.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => { handleCloseDrawer(); setShowDrawer(true); }}>
          + Thêm nhà cung cấp
        </button>
      </div>

      {error && !showDrawer && (
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
                <th>Mã NCC</th>
                <th>Tên Nhà Cung Cấp</th>
                <th>Người liên hệ</th>
                <th>Điện thoại</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th style={{ width: "140px" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td className={styles.mono} style={{ fontWeight: 600 }}>{s.code}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>{s.contactName || "-"}</td>
                  <td>{s.phone}</td>
                  <td>{s.email}</td>
                  <td>{s.address}</td>
                  <td>
                    <div className={styles.rowBtns}>
                      <button className={styles.btnSm} onClick={() => handleEditClick(s)}>
                        Sửa
                      </button>
                      <button className={styles.btnDanger} onClick={() => handleDeleteClick(s.id)}>
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    Chưa có nhà cung cấp nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDrawer && (
        <div className={styles.drawerOverlay} onClick={handleCloseDrawer}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h2 className={styles.subtitle} style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                {editingSupplierId ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp mới"}
              </h2>
              <button className={styles.btnSmMuted} onClick={handleCloseDrawer}>
                Đóng
              </button>
            </div>

            {error && <div className={styles.btnDanger} style={{ padding: "10px", marginBottom: "12px", borderRadius: "8px", cursor: "default" }}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Mã nhà cung cấp (Ví dụ: SUP-VNM)</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tên nhà cung cấp</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Tên người liên hệ</label>
                <input
                  type="text"
                  className={styles.input}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Số điện thoại</label>
                <input
                  type="text"
                  required
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  type="email"
                  required
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Địa chỉ văn phòng</label>
                <textarea
                  required
                  rows={2}
                  className={styles.textarea}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className={styles.drawerActions} style={{ gridColumn: "1 / -1", display: "flex", justifySelf: "flex-end", gap: "10px" }}>
                <button type="button" className={styles.btnSmMuted} onClick={handleCloseDrawer}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingSupplierId ? "Cập nhật đối tác" : "Lưu đối tác"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
