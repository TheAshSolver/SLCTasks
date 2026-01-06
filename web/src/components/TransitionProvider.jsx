"use client";

import { usePathname } from "next/navigation";

import { motion } from "motion/react";

export default function TransitionProvider({ children }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ y: 20, opacity: 0.5 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}
