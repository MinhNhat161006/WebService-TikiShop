import styles from "./ProductCard.module.css";

/** Skeleton placeholder for ProductCard — matches the card layout without content. */
export default function ProductCardSkeleton() {
  return (
    <article className={styles.card} aria-hidden>
      <div className={styles.thumb} style={{ background: "#f0f0f5" }}>
        <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: 0 }} />
      </div>
      <div className={styles.body}>
        <div className="skeleton" style={{ width: "45%", height: 10, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "100%", height: 14, marginBottom: 4 }} />
        <div className="skeleton" style={{ width: "80%", height: 14, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: "55%", height: 12, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: "40%", height: 18, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: "60%", height: 10 }} />
      </div>
    </article>
  );
}
