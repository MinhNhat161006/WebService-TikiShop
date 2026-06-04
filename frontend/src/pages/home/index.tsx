import { useEffect, useState } from "react";
import { api } from "@/shared/api/client";
import type { Category, Product } from "@/shared/api/types";
import CategoriesSection from "./sections/CategoriesSection";
import HeroSection from "./sections/HeroSection";
import ProductsSection from "./sections/ProductsSection";
import styles from "./Home.module.css";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadProducts = async (nextPage: number) => {
    try {
      setLoadingMore(true);
      const res = await api.products({ page: nextPage, limit: 12, sort: "bestseller" });
      const pagination = res.pagination as { totalPages: number };
      setProducts((prev) => (nextPage === 1 ? res.items : [...prev, ...res.items]));
      setPage(nextPage);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch (e: unknown) {
      if (e instanceof Error) setErr(e.message);
      else setErr("Đã có lỗi xảy ra khi tải sản phẩm");
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [c, p] = await Promise.all([
          api.categories(),
          api.products({ page: 1, limit: 12, sort: "bestseller" }),
        ]);
        setCategories(c);
        setProducts(p.items);
        const pagination = p.pagination as { totalPages: number };
        setPage(1);
        setTotalPages(pagination?.totalPages ?? 1);
      } catch (e: unknown) {
        if (e instanceof Error) setErr(e.message);
        else setErr("Đã có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  if (err) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.errorBox}>
          <h2>Không tải được trang chủ</h2>
          <p>{err}</p>
          <p className={styles.errorHint}>
            Kiểm tra backend đang chạy tại cổng 4000 và thử tải lại trang.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <HeroSection />
      <CategoriesSection categories={categories} loading={loading} />
      <ProductsSection
        products={products}
        loading={loading}
        loadingMore={loadingMore}
        page={page}
        totalPages={totalPages}
        onLoadMore={() => loadProducts(page + 1)}
      />
    </div>
  );
}
