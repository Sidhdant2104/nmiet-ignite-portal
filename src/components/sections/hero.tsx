import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Compass, Sparkles, Users } from "lucide-react";
import { useRef } from "react";
import { AmbientBackdrop, GridLines } from "@/components/ambient-backdrop";
import { Counter } from "@/components/motion/counter";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { AnnouncementTicker } from "@/components/sections/announcement-ticker";

const ease = [0.22, 1, 0.36, 1] as const;

const words = "NMIET SIH Portal".split(" ");

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="home" ref={ref} className="relative isolate overflow-hidden pb-24 pt-36 lg:pb-32 lg:pt-44">
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
            <a href="#problem-statements">
              <MagneticButton className="border border-border bg-card/70 px-7 py-3.5 text-foreground backdrop-blur hover:bg-accent">
                <Compass className="h-4 w-4 text-brand-blue" /> Explore Problem Statements
              </MagneticButton>
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6"
          >
            {[
              { label: "Themes", value: 17, suffix: "" },
              { label: "Problem statements", value: 400, suffix: "+" },
              { label: "Prize pool", value: 50, suffix: "L+" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 font-display text-2xl font-semibold sm:text-3xl">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div style={{ y: yNear, opacity: fade }} className="relative">
          <HeroVisual />
        </motion.div>
      </div>

      <div className="shell mt-20">
        <AnnouncementTicker />
      </div>
    </section>
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
        className="glass-strong absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5 shadow-lift"
      >
        <div className="flex items-center justify-between">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Team draft
          </span>
          <span className="rounded-full bg-brand-green/15 px-2 py-0.5 text-[0.65rem] font-semibold text-brand-green">
            Ready
          </span>
        </div>
        <p className="mt-3 font-display text-base font-semibold leading-snug">
          Predictive maintenance for municipal water pumping stations
        </p>
        <p className="mt-1 text-xs text-muted-foreground">SIH26-1042 · Smart Automation</p>
        <div className="mt-4 flex items-center gap-2">
          {["A", "R", "S", "K", "M", "P"].map((initial, i) => (
            <motion.span
              key={initial}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className="grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-[0.65rem] font-semibold"
            >
              {initial}
            </motion.span>
          ))}
        </div>
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
        <div className="mt-1 font-display text-lg font-semibold">Top 12 teams</div>
      </motion.div>
    </div>
  );
}
