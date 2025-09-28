import { cn } from "@/utils/cn";
import { bodoniModa } from "../../fonts";

export default function H1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        `w-full text-center text-6xl font-birthstone ${bodoniModa.className}`,
        className
      )}
    >
      {children}
    </h1>
  );
}
