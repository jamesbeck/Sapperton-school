import { CogIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";

export default function Button({
  label,
  onClick,
  href,
  type = "button",
  icon: Icon,
  loading = false,
  disabled = false,
  className = "",
  buttonStyle = "green",
  textColor = "text-white", // New prop
  borderColor = "border-white", // New prop
  hoverBg = "hover:bg-[rgba(255,255,255,0.2)]", // New prop
}: {
  label?: string;
  onClick?: () => void;
  href?: string;
  type?: "submit" | "button";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<
    React.PropsWithoutRef<React.ComponentProps<"svg">> & {
      title?: string | undefined;
      titleId?: string | undefined;
    }
  >;
  buttonStyle?: "green" | "transparent" | null;
  textColor?: string; // New prop for text color
  borderColor?: string; // New prop for border color
  hoverBg?: string; // New prop for hover background
}) {
  const baseClass = `rounded-md shadow-lg/50 shadow-foreground w-full md:w-auto justify-center py-3 px-4 cursor-pointer uppercase duration-200 transition-colors flex space-x-2 items-center disabled:opacity-50 disabled:cursor-not-allowed`;

  const styleClasses: { [key in "green" | "transparent"]: string } = {
    green: `bg-sapperton-green text-white`,
    transparent: `bg-transparent ${textColor} ${borderColor} ${hoverBg} border-[1px]`,
  };

  const effectiveButtonStyle = buttonStyle ?? "green";

  const InnerButton = () => (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseClass, styleClasses[effectiveButtonStyle], className)}
      disabled={disabled}
    >
      {(loading || Icon) && (
        <div>
          {loading && (
            <CogIcon className="h-6 w-6 animate-spin" aria-hidden="true" />
          )}
          {Icon && !loading && <Icon className="h-6 w-6" aria-hidden="true" />}
        </div>
      )}
      {label && <div>{label}</div>}
    </button>
  );

  if (href)
    return (
      <Link href={href} target={href.includes("http") ? "_blank" : ""}>
        <InnerButton />
      </Link>
    );
  else return <InnerButton />;
}
