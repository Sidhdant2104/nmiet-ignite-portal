import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Portrait } from "@/components/organizing-committee/portrait";
import type { StudentLeader } from "@/components/organizing-committee/team-data";
import { studentLeadership } from "@/components/organizing-committee/team-data";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function StudentHero({ member, reversed }: { member: StudentLeader; reversed: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yPortrait = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const yText = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden py-24 sm:py-32 max-md:min-h-0 max-md:py-14"
    >
      {/* Section glow */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full blur-[120px]",
          reversed ? "-left-32 bg-brand-blue/15" : "-right-32 bg-primary/15",
        )}
      />

      <div
        className={cn(
          "shell grid w-full items-center gap-16 lg:grid-cols-2 lg:gap-24 max-md:gap-8",
          reversed && "lg:[direction:rtl] lg:*:[direction:ltr]",
        )}
      >
        <motion.div
          style={{ y: yPortrait }}
          className="flex justify-center lg:justify-start"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease }}
        >
          <Portrait
            name={member.name}
            photo={member.photo}
            size="hero"
            glowColor={reversed ? "oklch(0.56 0.2 264 / 22%)" : "oklch(0.7 0.19 45 / 22%)"}
          />
        </motion.div>

        <motion.div
          style={{ y: yText }}
          initial={{ opacity: 0, y: 56 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.12, ease }}
          className="max-w-lg max-md:text-center"
        >
          <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-snug max-md:text-xl">
            &ldquo;{member.quote}&rdquo;
          </blockquote>

          <div className="mt-12 border-t border-border/60 pt-8 max-md:mt-7 max-md:pt-6">
            <p className="font-display text-2xl font-semibold sm:text-3xl max-md:text-xl">{member.name}</p>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {member.role}
            </p>
            {member.department ? (
              <p className="mt-3 text-base text-muted-foreground">
                {member.department}
                {member.year ? ` · ${member.year}` : ""}
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function StudentSection() {
  return (
    <div className="relative border-t border-border/40">
      <div className="shell py-20 sm:py-28 max-md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Student Leadership
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The students driving it all
          </h2>
        </motion.div>
      </div>

      {studentLeadership.map((member, i) => (
        <StudentHero key={member.name} member={member} reversed={i % 2 === 1} />
      ))}
    </div>
  );
}
