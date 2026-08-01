import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2, Compass, ListChecks, Sparkles, Users } from "lucide-react";
import { useRef } from "react";
import { AmbientBackdrop, GridLines } from "@/components/ambient-backdrop";
import { Counter } from "@/components/motion/counter";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { AnnouncementTicker } from "@/components/sections/announcement-ticker";
import { SupportedBySection } from "@/components/sections/supported-by";

const ease = [0.22, 1, 0.36, 1] as const;

const words = "NMIET SIH Portal".split(" ");

const selectionMiniSteps = [
  "Registration",
  "Internal Hackathon",
  "Faculty Evaluation",
  "Top 45 Teams",
  "5 Waitlisted",
  "SIH Nomination",
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative isolate overflow-hidden pb-16 pt-36 lg:pb-20 lg:pt-44">
      <motion.div style={{ y: yFar }} className="absolute inset-0 -z-10">
        <AmbientBackdrop />
        <GridLines />
      </motion.div>
      

      <div className="shell grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Internal selection for Smart India Hackathon 2026
          </motion.div>

          <h1 className="mt-7 text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-[4.2rem]">
            {words.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.09, ease }}
                className="mr-3 inline-block"
              >
                {i === words.length - 1 ? <span className="text-gradient">{word}</span> : word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            Your gateway to Smart India Hackathon 2026. Explore problem statements, understand the
            process and register for NMIET&apos;s internal SIH selection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Link to="/register" aria-label="Register your team now">
              <MagneticButton className="bg-primary px-7 py-3.5 text-primary-foreground shadow-glow hover:brightness-105">
                Register Now <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </Link>
            <Link to="/problem-statements">
              <MagneticButton className="border border-border bg-card/70 px-7 py-3.5 text-foreground backdrop-blur hover:bg-accent">
                <Compass className="h-4 w-4 text-brand-blue" /> Explore Problem Statements
              </MagneticButton>
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 grid gap-4 sm:grid-cols-2 xl:max-w-2xl"
          >
            <div className="hover-lift rounded-3xl border border-border bg-card/70 p-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Themes</dt>
              <dd className="mt-1.5 font-display text-3xl font-semibold">
                <Counter to={18} />
              </dd>
            </div>

            <div className="hover-lift rounded-3xl border border-border bg-card/70 p-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Problem statements
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold">Coming soon</dd>
              <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground">
                Will be updated automatically once officially released by SIH
              </p>
            </div>

            <div className="hover-lift rounded-3xl border border-border bg-card/70 p-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Internal selection
              </dt>
              <dd className="mt-1.5 font-display text-3xl font-semibold">45 + 5</dd>
              <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground">
                Top 45 teams selected + 5 waitlisted
              </p>
            </div>

            <div className="hover-lift rounded-3xl border border-border bg-card/70 p-5 backdrop-blur">
              <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Team size
              </dt>
              <dd className="mt-1.5 font-display text-xl font-semibold">6 members</dd>
              <p className="mt-1.5 text-[0.7rem] leading-snug text-muted-foreground">
                1 faculty mentor · at least 1 female member
              </p>
            </div>
          </motion.dl>
        </div>

        <motion.div style={{ y: yNear, opacity: fade }} className="relative">
          <HeroVisual />
        </motion.div>
      </div>

      <div className="shell mt-16">
        <AnnouncementTicker />
      </div>

      <div className="shell mt-14">
        <SupportedBySection />
      </div>    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg" aria-hidden>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
        className="absolute inset-6 rounded-full border border-dashed border-border"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute inset-16 rounded-full border border-border"
      />
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
        className="glass-strong absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5 shadow-lift"
      >
        <div className="flex items-center justify-between">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Internal selection process
          </span>
          <ListChecks className="h-4 w-4 text-brand-green" aria-hidden />
        </div>
        <p className="mt-3 font-display text-base font-semibold leading-snug">
          45 + 5 Internal Selection
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Top 45 teams selected · 5 waitlisted for SIH 2026
        </p>
        <ol className="mt-4 space-y-2">
          {selectionMiniSteps.map((label, i) => (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.07 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[0.6rem] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{label}</span>
              {i < 2 ? (
                <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-brand-green" aria-hidden />
              ) : null}
            </motion.li>
          ))}
        </ol>
      </motion.div>

      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute -left-2 top-8 rounded-2xl px-4 py-3 shadow-soft"
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Users className="h-4 w-4 text-brand-blue" /> 6 members + 1 mentor
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="glass absolute -right-1 bottom-10 rounded-2xl px-4 py-3 shadow-soft"
      >
        <div className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
          Internal shortlist
        </div>
        <div className="mt-1 font-display text-lg font-semibold leading-tight">
          Top 45 Selected
        </div>
        <div className="text-xs font-medium text-brand-green">+ 5 Waitlisted</div>
      </motion.div>
    </div>
  );
}
