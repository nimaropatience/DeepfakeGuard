import { motion } from "motion/react";
import type { ComponentProps } from "react";

type Variant = "primary" | "outlined";

interface ButtonProps extends ComponentProps<typeof motion.button> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const base = "px-6 py-2.5 rounded-full text-sm font-semibold transition-colors font-sans";
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-bg hover:opacity-90",
    outlined: "border-[1.5px] border-border text-primary hover:border-secondary",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
