import { Link } from "react-router-dom";
import styles from "./TikiLogo.module.css";

/** Wordmark phong cách Tiki: chữ trắng + nụ cười cam */
export default function TikiLogo() {
  return (
    <Link to="/" className={styles.wrap} aria-label="Tiki - Trang chủ">
      <span className={styles.word}>tiki</span>
      <span className={styles.smile} aria-hidden />
    </Link>
  );
}
