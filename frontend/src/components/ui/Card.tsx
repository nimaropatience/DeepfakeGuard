import { motion, type HTMLMotionProps } from "framer-motion";

type CardProps = HTMLMotionProps<"div"> & {
  padded?: boolean;
};

export function Card({
  padded = true,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={`card${padded ? " card-padded" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
