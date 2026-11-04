/** Shared Motion for React animation variants. */

const ease = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0.25, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
};

export function staggerContainer(stagger = 0.08, delay = 0) {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", bounce: 0.4 },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
