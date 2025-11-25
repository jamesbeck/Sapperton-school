import { cn } from "@/utils/cn";

export default function Container({
  children,
  colour = "transparent",
  id,
}: {
  children: React.ReactNode;
  colour?: "transparent" | "white" | "green";
  id?: string;
}) {
  let colourClass = "";
  if (colour === "white") {
    colourClass = "bg-white";
  } else if (colour === "green") {
    colourClass = "bg-sapperton-green text-white";
  } else if (colour === "transparent") {
    colourClass = "bg-transparent";
  }

  return (
    <div className={cn("w-full", colourClass)} id={id}>
      <div
        className={cn("max-w-7xl mx-auto py-16 md:py-16 w-full px-8 md:px-16")}
      >
        {children}
      </div>
    </div>
  );
}
