import { HoverScale } from "@/utils/hoverScale";
import { AnimateIn } from "@/utils/animateIn";
import Button from "./ui/button";
import { RouteIcon } from "lucide-react";

export function RequestAVisit() {
  return (
    <HoverScale>
      <Button label="Request a Visit" icon={RouteIcon} />
    </HoverScale>
  );
}
