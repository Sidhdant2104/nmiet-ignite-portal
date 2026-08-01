import { motion } from "framer-motion";
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
import { SectionHeading } from "@/components/section-heading";

export const selectionSteps = [
  { icon: ClipboardList, title: "Registration", body: "Submit your internal entry on this portal." },
  { icon: Users, title: "Internal Hackathon", body: "Build and present your prototype at NMIET." },
  { icon: Gavel, title: "Evaluation by Jury", body: "Faculty and industry jury score every team." },
  { icon: ListChecks, title: "Top 45 Teams Selected", body: "45 teams clear the internal round." },
  { icon: UserCheck, title: "5 Teams Waitlisted", body: "Standby teams replace any dropouts." },
  { icon: Award, title: "Official SIH Nomination", body: "Selected teams are nominated on sih.gov.in." },
  { icon: FileUp, title: "Idea Submission", body: "Submit your idea against a problem statement." },
  { icon: Globe2, title: "National Evaluation", body: "Nodal centre and national screening rounds." },
  { icon: Trophy, title: "Grand Finale", body: "36-hour national hackathon finale." },
];

export function SelectionFlowSection() {
  return (
    <section id="selection" className="section-pad relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/4 h-[22rem] w-[22rem] rounded-full bg-brand-green/10 blur-[130px]"
      />
      <div className="shell">
        <SectionHeading
          eyebrow="Selection process"
          title={
            <>
              From registration to the{" "}
              <span className="text-gradient">grand finale</span>
            </>
          }
          description="NMIET nominates 45 teams with 5 on the waitlist. Here's the full road, step by step."
          align="center"
        />

        <ol className="relative mx-auto mt-16 max-w-3xl">
          <div
            aria-hidden
            className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-gradient-to-b from-primary via-brand-blue to-brand-green sm:left-1/2"
          />
          {selectionSteps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.06 }}
              className="relative mb-4 pl-16 sm:mb-6 sm:w-1/2 sm:pl-0 sm:pr-12 sm:even:ml-auto sm:even:pl-12 sm:even:pr-0"
            >
              <span className="absolute left-0 top-4 grid h-11 w-11 place-items-center rounded-2xl border border-border bg-card text-primary shadow-soft sm:left-auto sm:right-[-1.375rem] sm:even:left-[-1.375rem] sm:even:right-auto">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="hover-lift rounded-3xl border border-border bg-card p-5 shadow-soft">
                <span className="font-mono text-[0.68rem] font-semibold text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>

        <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
          {[
            { value: "45", label: "Teams shortlisted" },
            { value: "5", label: "Teams waitlisted" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
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
