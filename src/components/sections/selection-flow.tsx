import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Award,
  ClipboardList,
  FileUp,
  Gavel,
  Globe2,
  ListChecks,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useRef } from "react";
import { SectionHeading } from "@/components/section-heading";

export const selectionSteps = [
  { icon: ClipboardList, title: "Registration", body: "Submit your internal entry on this portal." },
  { icon: Users, title: "Internal Hackathon", body: "Build and present your prototype at NMIET." },
  { icon: Gavel, title: "Faculty Evaluation", body: "Faculty and industry jury score every team." },
  { icon: ListChecks, title: "Top 45 Teams", body: "45 teams clear the internal round." },
  { icon: UserCheck, title: "5 Waitlisted Teams", body: "Standby teams replace any dropouts." },
  { icon: Award, title: "Official SIH Nomination", body: "Selected teams are nominated on sih.gov.in." },
  { icon: FileUp, title: "Idea Submission", body: "Submit your idea against a problem statement." },
  { icon: Globe2, title: "National Evaluation", body: "Nodal centre and national screening rounds." },
  { icon: Trophy, title: "Grand Finale", body: "36-hour national hackathon finale." },
];

export function SelectionFlowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const lineHeight = useSpring(useTransform(scrollYProgress, [0, 1], ["0%", "100%"]), {
    stiffness: 100,
    damping: 24,
  });

  return (
    <section id="selection" className="section-pad relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-[22rem] rounded-full bg-brand-green/10 blur-[130px]"
      />
      <div className="shell">
        <SectionHeading
          eyebrow="Internal selection"
          title={
            <>
              Your road to the{" "}
              <span className="text-gradient">grand finale</span>
            </>
          }
          description="NMIET nominates 45 teams with 5 on the waitlist. Follow the official internal selection roadmap from registration to the national stage."
          align="center"
        />

        <div ref={ref} className="relative mx-auto mt-16 max-w-3xl">
          <div
            aria-hidden
            className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-border sm:left-1/2"
          />
          <motion.div
            aria-hidden
            style={{ height: lineHeight }}
            className="absolute left-[1.35rem] top-2 w-px bg-gradient-to-b from-primary via-brand-blue to-brand-green sm:left-1/2"
          />

          <ol>
            {selectionSteps.map((s, i) => (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.55, delay: (i % 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="relative mb-4 pl-16 sm:mb-6 sm:w-1/2 sm:pl-0 sm:pr-12 sm:even:ml-auto sm:even:pl-12 sm:even:pr-0"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "-40%" }}
                  transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
                  className="absolute left-0 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft sm:left-auto sm:right-[-1.375rem] sm:even:left-[-1.375rem] sm:even:right-auto"
                >
                  <s.icon className="h-5 w-5" aria-hidden />
                </motion.span>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="hover-lift rounded-3xl border border-border bg-card p-5 shadow-soft"
                >
                  <span className="font-mono text-[0.68rem] font-semibold text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 font-display text-base font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </motion.div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          {[
            { value: "45", label: "Teams shortlisted" },
            { value: "5", label: "Teams waitlisted" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.02 }}
              className="glass rounded-3xl px-6 py-7 text-center shadow-soft"
            >
              <p className="font-display text-4xl font-semibold text-gradient">{s.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
