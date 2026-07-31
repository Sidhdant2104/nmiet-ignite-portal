import { cn } from "@/lib/utils";

/** Ambient gradient blobs + noise. Purely decorative. */
export function AmbientBackdrop({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "soft";
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className={cn(
          "absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/25 blur-[110px] animate-blob",
          variant === "soft" && "bg-primary/15",
        )}
      />
      <div
        className="absolute -right-40 top-10 h-[30rem] w-[30rem] rounded-full bg-brand-blue/25 blur-[120px] animate-blob"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute bottom-[-14rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-brand-green/20 blur-[120px] animate-blob"
        style={{ animationDelay: "-12s" }}
      />
      <div className="noise absolute inset-0" />
    </div>
  );
}

export function GridLines({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(70% 60% at 50% 40%, black, transparent 100%)",
        opacity: 0.5,
      }}
    />
  );
}
