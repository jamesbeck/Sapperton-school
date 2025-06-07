import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export function AnimateIn({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, top: -50 }}
      whileInView={{ opacity: 1, top: 0 }}
      transition={{ duration: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  );
}
