import { motion } from "framer-motion";
import { Portrait } from "@/components/organizing-committee/portrait";
import type { TeamAccent, TeamPerson } from "@/components/organizing-committee/team-data";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProfileCard({
  person,
  roleLabel,
  accent,
  className,
}: {
  person: TeamPerson;
  roleLabel: string;
  accent?: TeamAccent;
  className?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease }}
      whileHover={{ y: -3 }}
      className={cn(
        "glass group relative overflow-hidden rounded-3xl p-5 shadow-soft transition-shadow duration-500 hover:shadow-lift sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: accent
            ? `linear-gradient(135deg, ${accent.accent}22, transparent 60%)`
            : undefined,
        }}
      />

      <div className="relative flex items-center gap-4 sm:gap-5">
        <Portrait
          name={person.name}
          photo={person.photo}
          size="md"
          glowColor={accent?.glow}
          accentColor={accent?.accent}
        />
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
            style={
              accent
                ? { background: accent.glow, color: accent.accent }
                : undefined
            }
          >
            {roleLabel}
          </span>
          <h4 className="mt-2 font-display text-base font-semibold leading-snug sm:text-lg">
            {person.name}
          </h4>
          {person.department ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{person.department}</p>
          ) : null}
          {person.year ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{person.year}</p>
          ) : null}
          {person.designation ? (
            <p className="mt-1 text-xs text-muted-foreground">{person.designation}</p>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
