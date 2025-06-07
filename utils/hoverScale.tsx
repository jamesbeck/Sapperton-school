import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export function HoverScale({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className={cn("", className)}>
      {children}
    </motion.div>
  );
}
