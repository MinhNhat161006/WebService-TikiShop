import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import styles from "./AdminLayout.module.css";

export default function AdminLayout() {
  const { user, logout } = useAuthStore();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.badge}>ADMIN</span>
          <span className={styles.brandName}>Bảng điều khiển</span>
        </div>
        <nav className={styles.nav}>
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}>
            Tổng quan
          </NavLink>
          <NavLink
            to="/admin/don-hang"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Đơn hàng
          </NavLink>
          <NavLink
            to="/admin/san-pham"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Sản phẩm
          </NavLink>
          <NavLink
            to="/admin/danh-muc"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Danh mục
          </NavLink>
          <NavLink
            to="/admin/nguoi-dung"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Người dùng
          </NavLink>
          
          <div className={styles.navSectionHeader}>Quản lý Tồn kho & PO</div>
          
          <NavLink
            to="/admin/nha-cung-cap"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Nhà cung cấp
          </NavLink>
          <NavLink
            to="/admin/import-orders"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Đơn nhập hàng (PO)
          </NavLink>
          <NavLink
            to="/admin/goods-receipts"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Phiếu nhận hàng (GR)
          </NavLink>
          <NavLink
            to="/admin/kho"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Quản lý kho
          </NavLink>
          <NavLink
            to="/admin/lo-han-dung"
            className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
          >
            Lô & Hạn dùng
          </NavLink>
        </nav>
        <div className={styles.sidebarFoot}>
          <NavLink to="/" className={styles.backShop}>
            ← Về cửa hàng
          </NavLink>
          <button type="button" className={styles.logout} onClick={() => logout()}>
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.topMuted}>Đăng nhập với</p>
            <p className={styles.topUser}>{user?.name}</p>
            <p className={styles.topEmail}>{user?.email}</p>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
