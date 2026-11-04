import { motion } from "motion/react";
import { staggerContainer } from "@/lib/motion";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

/** Scroll-triggered reveal wrapper with stagger for children. */
export function Reveal({ children, className = "", stagger = 0.08, delay = 0 }: RevealProps) {
  return (
    <motion.section
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
