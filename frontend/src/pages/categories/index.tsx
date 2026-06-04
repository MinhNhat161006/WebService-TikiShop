import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { Category } from "@/shared/api/types";
import { FadeIn, StaggerContainer, StaggerItem } from "@/shared/ui";
import styles from "./CategoriesPage.module.css";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api
      .categories()
      .then(setCategories)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <div className="container" style={{ padding: "24px 0" }}>
        <p className="form-alert" role="alert">
          <strong>Không tải được danh mục.</strong> {err}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <FadeIn>
          <nav className={styles.breadcrumb}>
            <Link to="/">Trang chủ</Link>
            <span className={styles.sep}>›</span>
            <span>Danh mục sản phẩm</span>
          </nav>

          <header className={styles.head}>
            <h1 className={styles.title}>Danh mục sản phẩm</h1>
            <p className={styles.sub}>Chọn danh mục để xem sản phẩm theo ngành hàng</p>
          </header>
        </FadeIn>

        {categories.length === 0 && !err ? (
          <p className={styles.loading}>Đang tải…</p>
        ) : (
          <StaggerContainer className={styles.grid}>
            {categories.map((c) => (
              <StaggerItem key={c.id}>
                <Link to={`/danh-muc/${c.slug}`} className={styles.card}>
                  <span className={styles.icon}>{c.icon || "📦"}</span>
                  <span className={styles.name}>{c.name}</span>
                  {c.productCount != null && (
                    <span className={styles.count}>{c.productCount} sản phẩm</span>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
