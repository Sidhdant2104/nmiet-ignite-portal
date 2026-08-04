import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";
import { useRef } from "react";
import { AmbientBackdrop, GridLines } from "@/components/ambient-backdrop";
import { Counter } from "@/components/motion/counter";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { AnnouncementTicker } from "@/components/sections/announcement-ticker";
import { SupportedBySection } from "@/components/sections/supported-by";
import InnovationMap from "@/components/InnovationMap";

const ease = [0.22, 1, 0.36, 1] as const;

const words = "NMIET SIH Portal".split(" ");

const innovationHubs = [
  { name: "Delhi", x: 171, y: 91, color: "blue" },
  { name: "Ahmedabad", x: 119, y: 166, color: "blue" },
  { name: "Mumbai", x: 119, y: 211, color: "orange" },
  { name: "Pune", x: 137, y: 231, color: "orange", primary: true },
  { name: "Hyderabad", x: 177, y: 230, color: "blue" },
  { name: "Kolkata", x: 252, y: 193, color: "orange" },
  { name: "Bengaluru", x: 157, y: 294, color: "blue" },
  { name: "Chennai", x: 205, y: 304, color: "orange" },
] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yFar = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate overflow-hidden pb-16 pt-36 lg:pb-20 lg:pt-44"
    >
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
                at least 1 female member
              </p>
            </div>
          </motion.dl>
        </div>

<motion.div style={{ y: yNear, opacity: fade }} className="relative">
  <InnovationMap />
</motion.div>
      </div>
      <div className="shell mt-16">
        <AnnouncementTicker />
      </div>
      <div className="shell mt-14">
        <SupportedBySection />
      </div>{" "}
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-lg" aria-hidden>
      <motion.div
        animate={{ scale: [1, 1.035, 1], opacity: [0.24, 0.44, 0.24] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-8 rounded-full border border-border/60"
      />
      <motion.div
        animate={{ scale: [1.02, 0.98, 1.02], opacity: [0.2, 0.38, 0.2] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute inset-20 rounded-full border border-dashed border-border/60"
      />
      <div className="mesh-bg absolute inset-0 rounded-full opacity-50" />
      <div className="absolute inset-12 rounded-full bg-primary/12 blur-3xl" />
      <GridLines className="rounded-full opacity-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, x: [0, 2, 0], y: [0, -2, 0] }}
        transition={{
          opacity: { duration: 0.9, ease, delay: 0.2 },
          scale: { duration: 0.9, ease, delay: 0.2 },
          x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute inset-[5%]"
      >
        <svg viewBox="0 0 360 350" className="h-full w-full overflow-visible" role="presentation">
          <motion.path
            d="M151 29 172 39 184 59 205 70 213 91 237 99 249 120 271 130 264 148 276 161 253 170 246 193 229 211 225 244 208 264 203 302 185 325 168 300 153 291 144 266 126 248 119 223 105 204 100 176 112 160 108 135 121 119 119 94 132 79 130 57 Z"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={1}
            opacity={0.22}
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.15 }}
            transition={{ duration: 1.7, ease, delay: 0.25 }}
          />

          {innovationHubs
            .filter((hub) => !hub.primary)
            .map((hub, index) => {
              const pune = innovationHubs.find((item) => item.primary)!;
              return (
                <g key={hub.name}>
                  <motion.line
                    x1={pune.x}
                    y1={pune.y}
                    x2={hub.x}
                    y2={hub.y}
                    stroke={
                      hub.color === "orange" ? "var(--color-primary)" : "var(--color-brand-blue)"
                    }
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.36 }}
                    transition={{ duration: 1.4, delay: 0.55 + index * 0.1, ease }}
                  />
                  <motion.circle
                    r="2.2"
                    fill={
                      hub.color === "orange" ? "var(--color-primary)" : "var(--color-brand-blue)"
                    }
                    animate={{
                      cx: [pune.x, hub.x],
                      cy: [pune.y, hub.y],
                      opacity: [0, 0, 0.95, 0],
                    }}
                    transition={{
                      duration: 4.6 + index * 0.18,
                      delay: 1.8 + index * 0.34,
                      repeat: Infinity,
                      repeatDelay: 0.8,
                      ease: "easeInOut",
                      times: [0, 0.08, 0.86, 1],
                    }}
                  />
                </g>
              );
            })}

          {innovationHubs.map((hub, index) => (
            <g key={hub.name}>
              {hub.primary ? (
                <motion.circle
                  cx={hub.x}
                  cy={hub.y}
                  r="15"
                  fill="var(--color-primary)"
                  animate={{ opacity: [0.08, 0.28, 0.08], scale: [0.88, 1.18, 0.88] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
                />
              ) : null}
              <motion.circle
                cx={hub.x}
                cy={hub.y}
                r={hub.primary ? 5.5 : 3.5}
                fill={hub.color === "orange" ? "var(--color-primary)" : "var(--color-brand-blue)"}
                animate={{ opacity: [0.62, 1, 0.62], scale: [0.92, 1.1, 0.92] }}
                transition={{
                  duration: hub.primary ? 3.8 : 4.8 + index * 0.18,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.18,
                }}
                style={{ transformOrigin: `${hub.x}px ${hub.y}px` }}
              />
            </g>
          ))}
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        className="glass absolute left-[25%] top-[58%] z-30 rounded-2xl px-3.5 py-2.5 shadow-soft"
      >
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 text-primary" />
          <div className="leading-tight">
            <p className="text-xs font-semibold">NMIET • Pune</p>
            <p className="mt-0.5 text-[0.65rem] text-muted-foreground">Innovation Hub</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
