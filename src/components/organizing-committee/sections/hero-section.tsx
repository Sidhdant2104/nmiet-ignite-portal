import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRef } from "react";
import { GridLines } from "@/components/ambient-backdrop";
import { CountUp } from "@/components/organizing-committee/count-up";
import { heroStats } from "@/components/organizing-committee/team-data";

const ease = [0.22, 1, 0.36, 1] as const;

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 23) % 100}%`,
  top: `${(i * 31) % 100}%`,
  size: 1 + (i % 2),
  delay: i * 0.25,
  duration: 4 + (i % 5),
}));

function AnimatedPeopleWord({ className }: { className?: string }) {
  return (
    <motion.span
      className={`inline-block bg-[length:200%_auto] bg-clip-text text-transparent ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, oklch(0.7 0.19 45), oklch(0.56 0.2 264), oklch(0.62 0.19 30), oklch(0.7 0.19 45))",
      }}
      animate={{ backgroundPosition: ["0% center", "200% center"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      People
    </motion.span>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden pt-28 pb-24 sm:pt-36 max-md:min-h-0 max-md:pt-24 max-md:pb-14"
    >
      {/* Living background */}
      <motion.div style={{ y: yBg }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 mesh-bg opacity-60" />
        <GridLines className="opacity-40" />
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px] animate-blob" />
        <div
          className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-brand-blue/18 blur-[100px] animate-blob"
          style={{ animationDelay: "-9s" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green/10 blur-[130px] animate-blob"
          style={{ animationDelay: "-15s" }}
        />
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-primary/50"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ opacity: [0.1, 0.45, 0.1], y: [0, -12, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        <div className="noise absolute inset-0" />
      </motion.div>

      <motion.div style={{ opacity }} className="shell relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur max-md:mb-7"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          NMIET SIH 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease }}
          className="max-w-5xl font-display text-[clamp(2.75rem,8vw,5.5rem)] font-semibold leading-[1.02] tracking-tight max-md:text-[clamp(2.45rem,12vw,3.4rem)] max-md:leading-[1.05]"
        >
          Meet the <AnimatedPeopleWord className="max-md:whitespace-nowrap" />
          <br />
          Behind SIH 2026
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease }}
          className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl max-md:mt-6 max-md:text-base max-md:leading-7"
        >
          Behind every great hackathon is a team of passionate people — faculty mentors, student
          leaders and volunteers — building the experience from the ground up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.34, ease }}
          className="mt-20 flex flex-wrap gap-12 sm:gap-20 max-md:mt-10 max-md:grid max-md:grid-cols-3 max-md:gap-2.5"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="max-md:min-w-0 max-md:rounded-2xl max-md:border max-md:border-border/60 max-md:bg-card/55 max-md:px-2 max-md:py-4 max-md:text-center max-md:shadow-[0_12px_28px_oklch(0.2_0.02_260_/_8%)] max-md:backdrop-blur-md">
              <p className="font-display text-5xl font-semibold tracking-tight sm:text-6xl max-md:text-3xl">
                <span className="md:hidden">
                  {stat.value}
                  {stat.suffix}
                </span>
                <span className="max-md:hidden">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground max-md:mt-1 max-md:text-[0.58rem] max-md:leading-tight max-md:tracking-[0.1em]">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
