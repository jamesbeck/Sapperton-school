import { cn } from "@/utils/cn";
import { bodoniModa } from "../../fonts";

export default function H2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        `w-full text-center text-4xl font-birthstone text-sapperton-green ${bodoniModa.className}`,
        className
      )}
    >
      {children}
    </h2>
  );
}
