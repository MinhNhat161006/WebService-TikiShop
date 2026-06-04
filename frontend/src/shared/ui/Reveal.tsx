import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { easeOut } from "./transitions";

type Props = {
  children: ReactNode;
  className?: string;
  amount?: number;
};

/** Khi scroll tới mới animate (một lần) */
export function Reveal({ children, className, amount = 0.12 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.48, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
