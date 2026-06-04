import { Link } from "react-router-dom";
import { FadeIn } from "@/shared/ui";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
  return (
    <section className={styles.heroWrap}>
      <div className="container">
        <div className={styles.hero}>
          <FadeIn delay={0} className={styles.heroBannerWrap}>
            <div className={styles.heroBanner}>
              <p className={styles.heroTag}>Siêu sale cuối tuần</p>
              <h1 className={styles.heroTitle}>Giảm đến 50%</h1>
              <p className={styles.heroDesc}>Freeship 0đ · Giao nhanh 2h · Trả góp 0%</p>
              <div className={styles.heroCtas}>
                <Link to="/tim-kiem?q=điện thoại" className={styles.btnPrimary}>
                  Mua ngay
                </Link>
                <Link to="/danh-muc/dien-tu-dien-may" className={styles.btnGhost}>
                  Xem khuyến mãi
                </Link>
              </div>
            </div>
          </FadeIn>
          <div className={styles.heroSide}>
            <FadeIn delay={0.08} y={20}>
              <Link to="/tim-kiem?q=tai nghe" className={styles.miniCard}>
                <span className={styles.miniBadge}>TikiNOW</span>
                <strong>Giao 2h</strong>
                <span>Đơn từ 99k</span>
              </Link>
            </FadeIn>
            <FadeIn delay={0.16} y={20}>
              <Link to="/tim-kiem?q=laptop" className={styles.miniCard}>
                <span className={styles.miniBadge2}>Ưu đãi</span>
                <strong>Laptop học tập</strong>
                <span>Trả góp 0%</span>
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
