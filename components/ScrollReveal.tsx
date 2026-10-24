"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down";
};

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = direction === "up" ? 24 : -24;

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: Math.min(delay, 0.3), ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
