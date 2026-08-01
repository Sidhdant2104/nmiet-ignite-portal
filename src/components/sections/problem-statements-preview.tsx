import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const features = [
  { icon: Search, label: "Full-text search across titles, organisations and PS IDs" },
  { icon: Filter, label: "Filter by theme, category, organisation and difficulty" },
  { icon: SlidersHorizontal, label: "Sort and paginate through the entire list" },
];

export function ProblemStatementsPreview() {
  return (
    <section id="problem-statements" className="section-pad relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]"
      />
      <div className="shell">
        <div className="glass relative overflow-hidden rounded-4xl p-8 shadow-lift sm:p-14">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Problem statements"
                title={
                  <>
                    Problem <span className="text-gradient">Statements</span>
                  </>
                }
                description="Explore all available SIH problem statements — searchable, filterable and always in sync with the portal."
                className="max-w-xl"
              />

              <ul className="mt-8 space-y-3">
                {features.map((f, i) => (
                  <Reveal as="li" key={f.label} delay={i * 0.07}>
                    <span className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-brand-blue">
                        <f.icon className="h-4 w-4" aria-hidden />
                      </span>
                      {f.label}
                    </span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={0.25} className="mt-9">
                <Link to="/problem-statements">
                  <MagneticButton className="bg-primary px-7 py-3.5 text-primary-foreground shadow-glow hover:brightness-105">
                    View All Problem Statements <ArrowRight className="h-4 w-4" aria-hidden />
                  </MagneticButton>
                </Link>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative rounded-3xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-background/70 px-3.5 py-2.5 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" aria-hidden />
                  Search problem statements…
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Theme", "Category", "Organisation", "Difficulty"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                      className="rounded-2xl border border-border bg-background/60 p-4"
                    >
                      <div className="h-2.5 w-20 rounded-full bg-primary/30" />
                      <div className="mt-3 h-3 w-full rounded-full bg-muted-foreground/15" />
                      <div className="mt-2 h-3 w-3/5 rounded-full bg-muted-foreground/15" />
                    </motion.div>
                  ))}
                </div>
                <p className="mt-5 text-center text-xs text-muted-foreground">
                  Statements appear automatically once SIH publishes them.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
