import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "@/shared/api/client";
import type { SearchResponse } from "@/shared/api/types";
import { FadeIn, StaggerContainer, StaggerItem } from "@/shared/ui";
import ProductCard from "@/widgets/ProductCard";
import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [params, setParams] = useSearchParams();

  const q = params.get("q") || "";

  const filters = useMemo(
    () => ({
      page: params.get("page") || "1",
      sort: params.get("sort") || "relevance",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      category: params.get("category") || "",
      brand: params.get("brand") || "",
      minRating: params.get("minRating") || "",
    }),
    [params]
  );

  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const requestIdRef = useRef(0);
  const cacheRef = useRef<Record<string, SearchResponse>>({});
  const hasEverFetchedRef = useRef(false);

  const cacheKey = useMemo(
    () =>
      JSON.stringify({
        q,
        ...filters,
      }),
    [q, filters]
  );

  const performSearch = useCallback(async () => {
    const keyword = q.trim();

    if (!keyword) {
      setResult(null);
      setError(null);
      setLoading(false);
      setIsFetching(false);
      hasEverFetchedRef.current = false;
      return;
    }

    const minRaw = filters.minPrice.trim();
    const maxRaw = filters.maxPrice.trim();
    if (minRaw) {
      const n = Number(minRaw);
      if (Number.isNaN(n) || n < 0) {
        setError('Ô "Giá từ" phải là số không âm.');
        return;
      }
    }
    if (maxRaw) {
      const n = Number(maxRaw);
      if (Number.isNaN(n) || n < 0) {
        setError('Ô "Giá đến" phải là số không âm.');
        return;
      }
    }
    if (minRaw && maxRaw && Number(minRaw) > Number(maxRaw)) {
      setError("Giá tối thiểu không được lớn hơn giá tối đa — hãy chỉnh lại bộ lọc.");
      return;
    }

    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setResult(cached);
      hasEverFetchedRef.current = true;
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    try {
      setError(null);

      if (!hasEverFetchedRef.current) {
        setLoading(true);
      } else {
        setIsFetching(true);
      }

      const pageNum = Math.max(1, parseInt(filters.page, 10) || 1);

      const searchParams: Record<string, string | number> = {
        q: keyword,
        sort: filters.sort,
        page: pageNum,
      };

      if (filters.minPrice) {
        searchParams.minPrice = Number(filters.minPrice);
      }

      if (filters.maxPrice) {
        searchParams.maxPrice = Number(filters.maxPrice);
      }

      if (filters.category) {
        searchParams.category = filters.category;
      }

      if (filters.brand) {
        searchParams.brand = filters.brand;
      }

      if (filters.minRating) {
        searchParams.minRating = Number(filters.minRating);
      }

      const res = await api.search(searchParams);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      cacheRef.current[cacheKey] = res;
      hasEverFetchedRef.current = true;
      setResult(res);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        setIsFetching(false);
      }
    }
  }, [q, filters, cacheKey]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(params);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      setParams(newParams, { replace: true });
    },
    [params, setParams]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateFilters({
      sort: e.target.value,
      page: "",
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilters({
      [key]: value,
      page: "",
    });
  };

  const goToPage = (p: number) => {
    updateFilters({ page: p <= 1 ? "" : String(p) });
  };

  const hasProducts = result && result.products && result.products.length > 0;
  const keywordTrim = q.trim();
  const pageNum = Math.max(1, parseInt(filters.page, 10) || 1);
  const totalPages = result?.pagination.totalPages ?? 0;

  return (
    <div className={`container ${styles.page}`}>
      <FadeIn>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span aria-hidden>›</span>
          <span>{keywordTrim ? `Tìm kiếm “${q}”` : "Tìm kiếm"}</span>
        </nav>

        {!keywordTrim && (
          <div className={styles.empty}>
            <h2>Nhập từ khóa để tìm</h2>
            <p>Dùng ô tìm kiếm phía trên hoặc chọn gợi ý từ khóa phổ biến.</p>
            <p style={{ marginTop: 16 }}>
              <Link to="/">← Về trang chủ</Link>
            </p>
          </div>
        )}

        {keywordTrim && (
          <>
            <div className={styles.toolbar}>
              <div>
                <h1 className={styles.pageTitle}>
                  {result
                    ? `${result.pagination.total} kết quả cho “${q.trim()}”`
                    : `Tìm kiếm “${q.trim()}”`}
                </h1>

                {isFetching && <p className={styles.fetching}>Đang cập nhật...</p>}
              </div>

              <select className={styles.select} value={filters.sort} onChange={handleSortChange}>
                <option value="relevance">Liên quan</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="rating">Đánh giá cao</option>
                <option value="bestseller">Bán chạy</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>

            <div className={styles.filters}>
              <input
                type="number"
                placeholder="Giá từ"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />

              <input
                type="number"
                placeholder="Giá đến"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />

              <input
                type="text"
                placeholder="Slug danh mục"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              />

              <input
                type="text"
                placeholder="Thương hiệu"
                value={filters.brand}
                onChange={(e) => handleFilterChange("brand", e.target.value)}
              />

              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange("minRating", e.target.value)}
              >
                <option value="">Tất cả đánh giá</option>
                <option value="4">4+ sao</option>
                <option value="3">3+ sao</option>
                <option value="2">2+ sao</option>
                <option value="1">1+ sao</option>
              </select>
            </div>

            {loading && (
              <div className={styles.loadingWrapper}>
                <div className={styles.loadingGrid}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={styles.skeleton} />
                  ))}
                </div>
              </div>
            )}

            {!loading && error && (
              <div className={styles.empty}>
                <h2>Có lỗi xảy ra</h2>
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && result && result.products.length === 0 && (
              <div className={styles.empty}>
                <h2>Không tìm thấy sản phẩm</h2>
                <p>Hãy thử từ khóa hoặc bộ lọc khác</p>
              </div>
            )}

            {!loading && !error && hasProducts && (
              <>
                <StaggerContainer>
                  <div className={styles.grid}>
                    {result!.products.map((product) => (
                      <div key={product.id}>
                        <StaggerItem>
                          <ProductCard product={product} highlightQuery={q} />
                        </StaggerItem>
                      </div>
                    ))}
                  </div>
                </StaggerContainer>

                {totalPages > 1 && (
                  <nav className={styles.pagination} aria-label="Phân trang kết quả">
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={pageNum <= 1}
                      onClick={() => goToPage(pageNum - 1)}
                    >
                      ← Trước
                    </button>
                    <span className={styles.pageInfo}>
                      Trang {pageNum} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className={styles.pageBtn}
                      disabled={pageNum >= totalPages}
                      onClick={() => goToPage(pageNum + 1)}
                    >
                      Sau →
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </FadeIn>
    </div>
  );
}
