import { cn } from "@/lib/utils";
import { Landmark } from "lucide-react";

export function Logo({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Landmark className={cn(iconOnly ? "h-9 w-9" : "h-5 w-5")} />
      {!iconOnly && (
        <span className="font-semibold tracking-tight">Smart Diplomat</span>
      )}
    </div>
  );
}
