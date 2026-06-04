import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { AdminCategoryRow } from "@/shared/api/types";
import styles from "./AdminPages.module.css";

export default function AdminCategories() {
  const [items, setItems] = useState<AdminCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [creating, setCreating] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: "", slug: "", icon: "" });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setErr(null);
    api
      .adminCategories()
      .then((r) => setItems(r.items))
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const name = newName.trim();
    const slug = newSlug.trim().toLowerCase();
    if (!name || !slug) {
      setErr("Nhập đủ tên và slug.");
      return;
    }
    setCreating(true);
    setErr(null);
    try {
      const row = await api.adminCreateCategory({
        name,
        slug,
        icon: newIcon.trim() || null,
      });
      setItems((prev) => [...prev, row].sort((a, b) => a.name.localeCompare(b.name, "vi")));
      setNewName("");
      setNewSlug("");
      setNewIcon("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không tạo được");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (c: AdminCategoryRow) => {
    setEditId(c.id);
    setEditDraft({ name: c.name, slug: c.slug, icon: c.icon ?? "" });
    setErr(null);
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async (id: string) => {
    setSavingId(id);
    setErr(null);
    try {
      const updated = await api.adminPatchCategory(id, {
        name: editDraft.name.trim(),
        slug: editDraft.slug.trim().toLowerCase(),
        icon: editDraft.icon.trim() || null,
      });
      setItems((prev) => prev.map((x) => (x.id === id ? updated : x)).sort((a, b) => a.name.localeCompare(b.name, "vi")));
      setEditId(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi lưu");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (c: AdminCategoryRow) => {
    if (c.productCount > 0) {
      setErr(`Không xóa được: danh mục còn ${c.productCount} sản phẩm.`);
      return;
    }
    const ok = window.confirm(`Xóa danh mục "${c.name}"?`);
    if (!ok) return;
    setDeletingId(c.id);
    setErr(null);
    try {
      await api.adminDeleteCategory(c.id);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      if (editId === c.id) cancelEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không xóa được");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && items.length === 0) {
    return <p className={styles.muted}>Đang tải…</p>;
  }

  return (
    <div>
      <h1 className={styles.title}>Danh mục</h1>
      <p className={styles.lead}>Thêm, sửa, xóa (chỉ khi không còn sản phẩm). Dữ liệu lưu trong DB theo biến môi trường DATABASE_URL.</p>

      {err && (
        <p className="form-alert" role="alert" style={{ marginBottom: 12 }}>
          {err}
        </p>
      )}

      <div className={styles.panel} style={{ marginBottom: 20 }}>
        <h2 className={styles.subtitle}>Thêm danh mục</h2>
        <p className={styles.muted} style={{ marginBottom: 12 }}>
          Slug chỉ dùng chữ thường, số và dấu gạch (vd: <code>do-choi-tre-em</code>).
        </p>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Tên</span>
            <input className={styles.input} value={newName} onChange={(e) => setNewName(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Slug</span>
            <input className={styles.input} value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Icon (emoji tùy chọn)</span>
            <input className={styles.input} value={newIcon} onChange={(e) => setNewIcon(e.target.value)} />
          </label>
        </div>
        <button type="button" className={styles.btnPrimary} style={{ marginTop: 12 }} disabled={creating} onClick={create}>
          {creating ? "Đang tạo…" : "Tạo danh mục"}
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Slug</th>
              <th>SP</th>
              <th>Icon</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                {editId === c.id ? (
                  <>
                    <td>
                      <input className={styles.input} value={editDraft.name} onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))} />
                    </td>
                    <td>
                      <input className={styles.input} value={editDraft.slug} onChange={(e) => setEditDraft((d) => ({ ...d, slug: e.target.value }))} />
                    </td>
                    <td>{c.productCount}</td>
                    <td>
                      <input className={styles.input} value={editDraft.icon} onChange={(e) => setEditDraft((d) => ({ ...d, icon: e.target.value }))} />
                    </td>
                    <td>
                      <div className={styles.rowBtns}>
                        <button type="button" className={styles.btnSm} disabled={savingId === c.id} onClick={() => saveEdit(c.id)}>
                          Lưu
                        </button>
                        <button type="button" className={styles.btnSmMuted} onClick={cancelEdit}>
                          Hủy
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      <Link to={`/danh-muc/${c.slug}`}>{c.name}</Link>
                    </td>
                    <td className={styles.mono}>{c.slug}</td>
                    <td>{c.productCount}</td>
                    <td>{c.icon || "—"}</td>
                    <td>
                      <div className={styles.rowBtns}>
                        <button type="button" className={styles.btnSm} onClick={() => startEdit(c)}>
                          Sửa
                        </button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          disabled={deletingId === c.id || c.productCount > 0}
                          title={c.productCount > 0 ? "Chuyển hoặc xóa hết sản phẩm trước" : undefined}
                          onClick={() => remove(c)}
                        >
                          {deletingId === c.id ? "…" : "Xóa"}
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
