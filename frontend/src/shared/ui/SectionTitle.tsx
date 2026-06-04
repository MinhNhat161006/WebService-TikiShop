import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeOut } from "./transitions";
import styles from "./SectionTitle.module.css";

type Props = {
  accent?: boolean;
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  className?: string;
};

/** Tiêu đề section có vạch đỏ + fade */
export function SectionTitle({ accent = true, title, subtitle, extra, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`${styles.bar} ${className ?? ""}`}
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      {accent && <span className={styles.accent} aria-hidden />}
      <div className={styles.head}>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <span className={styles.sub}>{subtitle}</span>}
      </div>
      {extra != null && <div className={styles.extra}>{extra}</div>}
    </motion.div>
  );
}
