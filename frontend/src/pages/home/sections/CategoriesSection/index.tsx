import { Link } from "react-router-dom";
import type { Category } from "@/shared/api/types";
import { Reveal, StaggerContainer, StaggerItem } from "@/shared/ui";
import styles from "./CategoriesSection.module.css";

interface CategoriesSectionProps {
  categories: Category[];
  loading?: boolean;
}

export default function CategoriesSection({ categories, loading = false }: CategoriesSectionProps) {
  return (
    <Reveal>
      <section className={`container ${styles.section}`}>
        <div className={styles.catPanel}>
          <div className={styles.catHead}>
            <h2 className={styles.catTitle}>Danh mục nổi bật</h2>
            <span className={styles.catHint}>Khám phá ngay</span>
          </div>
          <StaggerContainer className={styles.catScroll}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div key={`sk-${i}`} className={styles.catStagger}>
                    <div className={styles.catItem}>
                      <div
                        className={`${styles.catCircle} skeleton`}
                        style={{ background: undefined }}
                      />
                      <div
                        className="skeleton"
                        style={{ width: "70%", height: 12, margin: "0 auto", borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ))
              : categories.map((c) => (
                  <StaggerItem key={c.id} className={styles.catStagger}>
                    <Link to={`/danh-muc/${c.slug}`} className={styles.catItem}>
                      <span className={styles.catCircle}>{c.icon || "📦"}</span>
                      <span className={styles.catName}>{c.name}</span>
                    </Link>
                  </StaggerItem>
                ))}
          </StaggerContainer>
        </div>
      </section>
    </Reveal>
  );
}
