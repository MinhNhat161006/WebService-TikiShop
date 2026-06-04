import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer id="footer" className={styles.footer}>
      <div className={styles.top}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.col}>
              <h3 className={styles.heading}>Hỗ trợ khách hàng</h3>
              <p className={styles.hotline}>
                Hotline: <a href="tel:19006035">1900 6035</a>
                <span className={styles.small}>(1000đ/phút, 8h-21h kể cả T7, CN)</span>
              </p>
              <ul className={styles.links}>
                <li>
                  <a href="#footer">Các câu hỏi thường gặp</a>
                </li>
                <li>
                  <a href="#footer">Gửi yêu cầu hỗ trợ</a>
                </li>
                <li>
                  <a href="#footer">Hướng dẫn đặt hàng</a>
                </li>
                <li>
                  <a href="#footer">Phương thức vận chuyển</a>
                </li>
              </ul>
            </div>
            <div className={styles.col}>
              <h3 className={styles.heading}>Về Tiki</h3>
              <ul className={styles.links}>
                <li>
                  <a href="#footer">Giới thiệu</a>
                </li>
                <li>
                  <a href="#footer">Tiki Blog</a>
                </li>
                <li>
                  <a href="#footer">Tuyển dụng</a>
                </li>
                <li>
                  <a href="#footer">Chính sách bảo mật</a>
                </li>
              </ul>
            </div>
            <div className={styles.col}>
              <h3 className={styles.heading}>Thanh toán</h3>
              <div className={styles.payRow} aria-hidden>
                <span className={styles.payBadge}>COD</span>
                <span className={styles.payBadge}>VISA</span>
                <span className={styles.payBadge}>ATM</span>
              </div>
              <h3 className={`${styles.heading} ${styles.headingSp}`}>Tải ứng dụng</h3>
              <p className={styles.appHint}>QR demo — mở trên điện thoại</p>
              <div className={styles.qr} aria-hidden>
                <div className={styles.qrInner} />
              </div>
            </div>
            <div className={styles.col}>
              <h3 className={styles.heading}>Kết nối với chúng tôi</h3>
              <div className={styles.social}>
                <span className={styles.soc}>f</span>
                <span className={styles.soc}>◎</span>
                <span className={styles.soc}>▶</span>
              </div>
              <p className={styles.cert}>Chứng nhận demo — giao diện tham khảo Tiki</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className="container">
          <p className={styles.company}>
            Công ty TNHH MTV Thương mại demo — GPĐKKD tham khảo giao diện Tiki. Địa chỉ: Thành phố Hà
            Nội, Việt Nam.
          </p>
          <p className={styles.copy}>
            © {new Date().getFullYear()} — Bản demo học tập. API:{" "}
            <a href="/api-docs" target="_blank" rel="noreferrer">
              /api-docs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
