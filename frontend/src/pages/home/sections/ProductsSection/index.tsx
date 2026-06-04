import type { Product } from "@/shared/api/types";
import { Reveal, SectionTitle, StaggerContainer, StaggerItem } from "@/shared/ui";
import ProductCard from "@/widgets/ProductCard";
import ProductCardSkeleton from "@/widgets/ProductCardSkeleton";
import styles from "./ProductsSection.module.css";

interface ProductsSectionProps {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  page: number;
  totalPages: number;
  onLoadMore: () => void;
}

export default function ProductsSection({
  products,
  loading,
  loadingMore,
  page,
  totalPages,
  onLoadMore,
}: ProductsSectionProps) {
  return (
    <section className={`container ${styles.section}`}>
      <Reveal>
        <SectionTitle
          title="Gợi ý hôm nay"
          subtitle="Dành riêng cho bạn"
          extra={
            !loading && (
              <button
                type="button"
                className={styles.loadMoreButton}
                onClick={onLoadMore}
                disabled={loadingMore || page >= totalPages}
              >
                {page >= totalPages ? "Đã tải hết" : loadingMore ? "Đang tải..." : "Xem thêm →"}
              </button>
            )
          }
        />
        <StaggerContainer className={styles.grid}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={`sk-${i}`}>
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
        </StaggerContainer>
      </Reveal>
    </section>
  );
}
