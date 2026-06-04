import { useCallback, useEffect, useState } from "react";
import { api } from "@/shared/api/client";
import type { AdminUserRow, UserRole } from "@/shared/api/types";
import { roleLabel } from "@/shared/lib/roles";
import { useAuthStore } from "@/store/authStore";
import styles from "./AdminPages.module.css";

export default function AdminUsers() {
  const selfId = useAuthStore((s) => s.user?.id);
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const [cEmail, setCEmail] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cRole, setCRole] = useState<UserRole>("USER");
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [eName, setEName] = useState("");
  const [eEmail, setEEmail] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eNewPassword, setENewPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setErr(null);
    api
      .adminUsers({ page, limit: 20, q: q || undefined })
      .then((r) => {
        setItems(r.items);
        setTotalPages(Math.max(1, r.pagination.totalPages));
        setTotal(r.pagination.total);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [page, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const applySearch = () => setQ(qInput.trim());

  const setRole = async (u: AdminUserRow, role: "USER" | "ADMIN") => {
    if (u.role === role) return;
    const ok = window.confirm(
      role === "ADMIN"
        ? `Cấp quyền ADMIN cho ${u.email}?`
        : `Hạ ${u.email} xuống USER? Họ sẽ không vào được trang admin.`
    );
    if (!ok) return;
    setBusyId(u.id);
    setErr(null);
    try {
      const updated = await api.adminPatchUserRole(u.id, role);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusyId(null);
    }
  };

  const createUser = async () => {
    const email = cEmail.trim();
    const name = cName.trim();
    if (!email || !cPassword || !name) {
      setErr("Nhập email, mật khẩu và họ tên.");
      return;
    }
    setCreating(true);
    setErr(null);
    try {
      await api.adminCreateUser({
        email,
        password: cPassword,
        name,
        phone: cPhone.trim() || null,
        role: cRole,
      });
      setCEmail("");
      setCPassword("");
      setCName("");
      setCPhone("");
      setCRole("USER");
      const r = await api.adminUsers({ page: 1, limit: 20 });
      setItems(r.items);
      setTotalPages(Math.max(1, r.pagination.totalPages));
      setTotal(r.pagination.total);
      setPage(1);
      setQ("");
      setQInput("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tạo được");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (u: AdminUserRow) => {
    setEditUser(u);
    setEName(u.name);
    setEEmail(u.email);
    setEPhone(u.phone ?? "");
    setENewPassword("");
    setErr(null);
  };

  const closeEdit = () => {
    setEditUser(null);
    setENewPassword("");
  };

  const saveEdit = async () => {
    if (!editUser) return;
    const id = editUser.id;
    setSavingEdit(true);
    setErr(null);
    const pw = eNewPassword.trim();
    if (pw.length > 0 && pw.length < 6) {
      setErr("Mật khẩu mới cần ít nhất 6 ký tự hoặc để trống.");
      setSavingEdit(false);
      return;
    }
    try {
      const updated = await api.adminPatchUser(id, {
        name: eName.trim(),
        email: eEmail.trim(),
        phone: ePhone.trim() === "" ? null : ePhone.trim(),
      });
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      if (pw.length >= 6) {
        await api.adminPatchUserPassword(id, pw);
        setENewPassword("");
      }
      setEditUser(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSavingEdit(false);
    }
  };

  const removeUser = async (u: AdminUserRow) => {
    if (u.id === selfId) return;
    const ok = window.confirm(`Xóa tài khoản ${u.email}? Chỉ thực hiện được nếu user chưa có đơn hàng.`);
    if (!ok) return;
    setBusyId(u.id);
    setErr(null);
    try {
      await api.adminDeleteUser(u.id);
      setItems((prev) => prev.filter((x) => x.id !== u.id));
      setTotal((t) => Math.max(0, t - 1));
      if (editUser?.id === u.id) closeEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không xóa được");
    } finally {
      setBusyId(null);
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
      <h1 className={styles.title}>Người dùng</h1>
      <p className={styles.lead}>
        Thêm, sửa, xóa (xóa chỉ khi chưa có đơn), đặt lại mật khẩu. Dữ liệu lưu trong DB theo DATABASE_URL.
      </p>

      <div className={styles.panel} style={{ marginBottom: 20 }}>
        <h2 className={styles.subtitle}>Tạo tài khoản</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input className={styles.input} type="email" autoComplete="off" value={cEmail} onChange={(e) => setCEmail(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Mật khẩu</span>
            <input className={styles.input} type="password" autoComplete="new-password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Họ tên</span>
            <input className={styles.input} value={cName} onChange={(e) => setCName(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>SĐT (tuỳ chọn)</span>
            <input className={styles.input} value={cPhone} onChange={(e) => setCPhone(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Vai trò</span>
            <select className={styles.select} value={cRole} onChange={(e) => setCRole(e.target.value as UserRole)}>
              <option value="USER">Khách</option>
              <option value="ADMIN">Quản trị</option>
            </select>
          </label>
        </div>
        <button type="button" className={styles.btnPrimary} style={{ marginTop: 12 }} disabled={creating} onClick={createUser}>
          {creating ? "Đang tạo…" : "Tạo người dùng"}
        </button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.input}
            placeholder="Email, tên, SĐT, mã người dùng…"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
          />
          <button type="button" className={styles.btnPrimary} onClick={applySearch}>
            Tìm
          </button>
        </div>
      </div>
      {err && items.length > 0 && (
        <p className="form-alert" role="alert" style={{ marginBottom: 12 }}>
          {err}
        </p>
      )}
      <p className={styles.muted} style={{ marginBottom: 12 }}>
        {total.toLocaleString("vi-VN")} tài khoản khớp điều kiện.
      </p>

      {loading ? (
        <p className={styles.muted}>Đang tải…</p>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={u.role === "ADMIN" ? styles.roleAdmin : styles.roleUser}>{roleLabel(u.role)}</span>
                    </td>
                    <td className={styles.muted}>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <div className={styles.rowBtns}>
                        <button type="button" className={styles.btnSm} disabled={busyId === u.id} onClick={() => openEdit(u)}>
                          Sửa
                        </button>
                        {u.role !== "ADMIN" && (
                          <button type="button" className={styles.btnSm} disabled={busyId === u.id} onClick={() => setRole(u, "ADMIN")}>
                            Cấp admin
                          </button>
                        )}
                        {u.role === "ADMIN" && u.id !== selfId && (
                          <button type="button" className={styles.btnSmMuted} disabled={busyId === u.id} onClick={() => setRole(u, "USER")}>
                            Hạ user
                          </button>
                        )}
                        {u.id !== selfId && (
                          <button type="button" className={styles.btnDanger} disabled={busyId === u.id} onClick={() => removeUser(u)}>
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className={styles.pager}>
              <button type="button" className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button type="button" className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {editUser && (
        <div className={styles.drawer}>
          <div className={styles.drawerHead}>
            <h2 className={styles.subtitle}>Sửa người dùng</h2>
            <button type="button" className={styles.btnSmMuted} onClick={closeEdit}>
              Đóng
            </button>
          </div>
          <p className={styles.muted} style={{ marginBottom: 12 }}>
            {editUser.email}
          </p>
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Họ tên</span>
              <input className={styles.input} value={eName} onChange={(e) => setEName(e.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Email</span>
              <input className={styles.input} type="email" value={eEmail} onChange={(e) => setEEmail(e.target.value)} />
            </label>
            <label className={styles.fieldFull}>
              <span className={styles.fieldLabel}>SĐT (để trống = không có)</span>
              <input className={styles.input} value={ePhone} onChange={(e) => setEPhone(e.target.value)} />
            </label>
            <label className={styles.fieldFull}>
              <span className={styles.fieldLabel}>Mật khẩu mới (tuỳ chọn, tối thiểu 6 ký tự)</span>
              <input className={styles.input} type="password" autoComplete="new-password" value={eNewPassword} onChange={(e) => setENewPassword(e.target.value)} />
            </label>
          </div>
          <div className={styles.drawerActions}>
            <button type="button" className={styles.btnPrimary} disabled={savingEdit} onClick={saveEdit}>
              {savingEdit ? "Đang lưu…" : "Lưu"}
            </button>
            {editUser.id !== selfId && (
              <button type="button" className={styles.btnDanger} style={{ marginLeft: 10 }} disabled={savingEdit} onClick={() => removeUser(editUser)}>
                Xóa tài khoản
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
