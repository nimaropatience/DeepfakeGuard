import { motion, type Variants } from "framer-motion";
import type { PropsWithChildren } from "react";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.48, ease: "easeOut" } },
};

export function Reveal({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
    >
      {children}
    </motion.div>
  );
}
