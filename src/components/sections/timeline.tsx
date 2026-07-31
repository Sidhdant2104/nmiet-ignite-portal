import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    title: "Registration opens",
    date: "July 2026",
    body: "The internal portal goes live and team formation begins across departments.",
  },
  {
    title: "Problem statements released",
    date: "July 2026",
    body: "Ministries publish statements; the explorer on this portal syncs automatically.",
  },
  {
    title: "Internal registration closes",
    date: "August 2026",
    body: "Final date to submit your team, chosen statement and mentor details.",
  },
  {
    title: "Evaluation round",
    date: "August 2026",
    body: "Ten-minute pitch plus Q&A with the NMIET faculty and industry panel.",
  },
  {
    title: "Shortlisting",
    date: "September 2026",
    body: "Selected teams are announced and mapped to mentors for refinement.",
  },
  {
    title: "Official SIH registration",
    date: "September 2026",
    body: "Shortlisted teams are nominated on the national SIH portal by the college.",
  },
  {
    title: "Grand finale",
    date: "December 2026",
    body: "36 hours, one nodal centre, national jury. Go represent NMIET.",
  },
];

export function TimelineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const height = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 120,
    damping: 26,
  });

  return (
    <section id="timeline" className="section-pad relative overflow-hidden">
      <div className="shell">
        <SectionHeading
          eyebrow="Timeline"
          title={
            <>
              From registration to the <span className="text-gradient">grand finale</span>
            </>
          }
          description="Dates are indicative and confirmed by the innovation cell as the national schedule is published."
        />

        <div ref={ref} className="relative mt-16 pl-8 sm:pl-0">
          <div
            aria-hidden
            className="absolute left-[7px] top-2 h-full w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
          />
          <motion.div
            aria-hidden
            style={{ height }}
            className="absolute left-[7px] top-2 w-px bg-gradient-to-b from-primary via-brand-blue to-brand-green sm:left-1/2 sm:-translate-x-1/2"
          />

          <ol className="space-y-10 sm:space-y-14">
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="relative sm:grid sm:grid-cols-2 sm:items-center sm:gap-12"
              >
                <motion.span
                  aria-hidden
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-30%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -left-8 top-3 grid h-[15px] w-[15px] place-items-center rounded-full border-2 border-primary bg-background sm:left-1/2 sm:-translate-x-1/2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                </motion.span>

                <motion.div
                  initial={{ opacity: 0, x: i % 2 === 0 ? -28 : 28, y: 14 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={
                    i % 2 === 0
                      ? "hover-lift rounded-3xl border border-border bg-card p-6 shadow-soft sm:col-start-1 sm:text-right"
                      : "hover-lift rounded-3xl border border-border bg-card p-6 shadow-soft sm:col-start-2"
                  }
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {step.date}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
