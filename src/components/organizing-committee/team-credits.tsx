import { motion } from "framer-motion";
import { Users } from "lucide-react";
import {
  TEAM_CREDIT_CATEGORIES,
  TEAM_CREDITS_FOOTER,
  TEAM_CREDITS_INTRO,
} from "@/components/organizing-committee/constants";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function TeamCreditsBlock({
  accentColor,
  className,
}: {
  accentColor?: string;
  className?: string;
}) {
  const introLines = TEAM_CREDITS_INTRO.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: 0.12, ease }}
      className={cn(
        "group relative overflow-hidden rounded-[1.65rem] border border-border/60 bg-background/40 p-5 shadow-[0_10px_30px_oklch(0.2_0.02_260_/_5%)] backdrop-blur transition-[transform,box-shadow,border-color] duration-[320ms] hover:-translate-y-1.5 hover:border-border hover:shadow-lift sm:p-7",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-15 blur-3xl"
        style={{ background: accentColor ?? "var(--color-primary-soft)" }}
      />

      <div className="relative space-y-5">
        <div className="flex items-center gap-3">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: accentColor ? `color-mix(in oklab, ${accentColor} 14%, transparent)` : "var(--color-primary-soft)",
              color: accentColor ?? "var(--color-primary)",
            }}
          >
            <Users className="h-4 w-4" />
          </span>
          <h5 className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">
            Team Credits
          </h5>
        </div>

        <div className="max-w-2xl space-y-1 text-sm leading-relaxed text-muted-foreground">
          {introLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="rounded-2xl border border-border/50 bg-background/30 p-4 sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Future team members
          </p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {TEAM_CREDIT_CATEGORIES.map((category) => (
              <li key={category} className="flex items-center gap-3 text-sm text-foreground/90">
                <span
                  className="h-1 w-1 shrink-0 rounded-full"
                  style={{ background: accentColor ?? "var(--color-primary)" }}
                />
                {category}
              </li>
            ))}
          </ul>
        </div>

        <p className="border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
          {TEAM_CREDITS_FOOTER}
        </p>
      </div>
    </motion.div>
  );
}
