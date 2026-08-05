import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Portrait } from "@/components/organizing-committee/portrait";
import type { FacultyMember } from "@/components/organizing-committee/team-data";
import { facultyLeadership } from "@/components/organizing-committee/team-data";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function FacultyStory({ member, imageRight }: { member: FacultyMember; imageRight: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[85svh] items-center py-24 sm:py-32 max-md:min-h-0 max-md:py-14"
    >
      <div
        className={cn(
          "shell grid w-full items-center gap-12 lg:gap-24 max-md:gap-7",
          imageRight ? "lg:grid-cols-[1fr_auto]" : "lg:grid-cols-[auto_1fr]",
        )}
      >
        <motion.div
          style={{ y }}
          className={cn(
            "flex justify-center",
            imageRight ? "lg:order-2 lg:justify-end" : "lg:order-1 lg:justify-start",
          )}
          initial={{ opacity: 0, x: imageRight ? 48 : -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
        >
          <Portrait
            name={member.name}
            photo={member.photo}
            size="xl"
            glowColor="oklch(0.7 0.19 45 / 20%)"
          />
        </motion.div>

        <motion.div
          className={cn(
            "max-w-xl max-md:text-center",
            imageRight ? "lg:order-1 lg:text-right lg:justify-self-end" : "lg:order-2",
          )}
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.1, ease }}
        >
          <blockquote className="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-snug max-md:text-xl">
            &ldquo;{member.quote}&rdquo;
          </blockquote>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {member.role}
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] max-md:text-3xl">
            {member.name}
          </h2>
          {member.department ? (
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">{member.department}</p>
          ) : null}
          {member.description ? (
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground sm:text-xl max-md:mt-5 max-md:text-base max-md:leading-7">
              {member.description}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

export function FacultySection() {
  return (
    <div className="relative">
      <div className="shell py-20 sm:py-28 max-md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Faculty Leadership
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The mentors guiding the mission
          </h2>
        </motion.div>
      </div>

      {facultyLeadership.map((member, i) => (
        <FacultyStory key={member.name} member={member} imageRight={i % 2 === 1} />
      ))}
    </div>
  );
}
