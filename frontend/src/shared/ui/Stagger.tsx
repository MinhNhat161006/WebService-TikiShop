import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeOut } from "./transitions";

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: easeOut },
  },
};

type ContainerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
};

/** Grid / list: con lần lượt xuất hiện */
export function StaggerContainer({ children, className, stagger = 0.055 }: ContainerProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : 0.05,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

type ItemProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: ItemProps) {
  const reduce = useReducedMotion();
  const variants = reduce
    ? { hidden: { opacity: 1, y: 0, scale: 1 }, visible: { opacity: 1, y: 0, scale: 1 } }
    : itemVariants;
  return (
    <motion.div className={className} variants={variants} style={{ height: "100%" }}>
      {children}
    </motion.div>
  );
}
