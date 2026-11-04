import { motion } from "motion/react";
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = true }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={`bg-card rounded-card p-7 shadow-sm transition-shadow hover:shadow-md ${className}`}
    >
      {children}
    </motion.div>
  );
}
