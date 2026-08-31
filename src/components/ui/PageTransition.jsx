import { motion, useReducedMotion } from "framer-motion";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -12,
  },
};

const pageTransition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.38,
};

export default function PageTransition({ children, className = "" }) {
  const reduceMotion = useReducedMotion();
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, in: { opacity: 1 }, out: { opacity: 0 } }
    : pageVariants;
  const transition = reduceMotion ? { duration: 0.01 } : pageTransition;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
