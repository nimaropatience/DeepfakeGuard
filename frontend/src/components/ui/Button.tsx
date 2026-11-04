import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "normal" | "small";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "normal", className = "", children, ...props },
    ref,
  ) {
    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`button button-${variant} button-${size} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
