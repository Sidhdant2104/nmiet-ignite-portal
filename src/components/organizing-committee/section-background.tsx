import { GridLines } from "@/components/ambient-backdrop";
import type { TeamAccent } from "@/components/organizing-committee/team-data";
import { cn } from "@/lib/utils";

type BgVariant = "left" | "right" | "center" | "split";

export function SectionBackground({
  accent,
  variant = "left",
  className,
}: {
  accent?: TeamAccent;
  variant?: BgVariant;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 mesh-bg opacity-30" />
      <GridLines className="opacity-[0.18]" />

      <div
        className={cn(
          "absolute h-[22rem] w-[22rem] rounded-full blur-[100px] sm:h-[26rem] sm:w-[26rem]",
          variant === "left" && "left-0 top-1/2 -translate-x-1/4 -translate-y-1/2",
          variant === "right" && "right-0 top-1/2 translate-x-1/4 -translate-y-1/2",
          variant === "center" && "left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2",
          variant === "split" && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={{ background: accent?.glow ?? "oklch(0.7 0.19 45 / 12%)" }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(1 0 0 / 4%), transparent 70%)",
        }}
      />
    </div>
  );
}
