import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { Product } from "@/shared/api/types";
import { FadeIn, StaggerContainer, StaggerItem } from "@/shared/ui";
import ProductCard from "@/widgets/ProductCard";
import listStyles from "@/shared/styles/list-layout.module.css";
import styles from "./CategoryPage.module.css";

const PAGE_SIZE = 24;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [name, setName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setErr(null);
    setLoading(true);
    api
      .category(slug, { page, limit: PAGE_SIZE })
      .then((c) => {
        setName(c.name);
        setProducts(c.products);
        setTotalPages(Math.max(1, c.pagination.totalPages));
        setTotal(c.pagination.total);
      })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [slug, page]);

  if (err) {
    return (
      <div className={`container ${styles.page}`}>
        <p className="form-alert" role="alert">
          <strong>Không tải được danh mục này.</strong> {err}
        </p>
        <p style={{ marginTop: 12 }}>
          <Link to="/">Về trang chủ</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <FadeIn>
        <nav className={listStyles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span aria-hidden>›</span>
          <Link to="/danh-muc">Danh mục</Link>
          <span aria-hidden>›</span>
          <span>{name || "…"}</span>
        </nav>
        <h1 className={listStyles.pageTitle}>{name || "Danh mục"}</h1>
        {!loading && total > 0 && <p className={styles.meta}>{total} sản phẩm</p>}
      </FadeIn>
      {loading ? (
        <p className={styles.loading}>Đang tải…</p>
      ) : (
        <>
          <StaggerContainer className={listStyles.grid}>
            {products.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerContainer>
          {products.length === 0 && <p>Chưa có sản phẩm trong danh mục này.</p>}
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Phân trang danh mục">
              <button
                type="button"
                className="btn btn-outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Trước
              </button>
              <span className={styles.pageInfo}>
                Trang {page} / {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
