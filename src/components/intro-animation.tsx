import { motion } from "framer-motion";
import { useEffect } from "react";

const ease = [0.22, 1, 0.36, 1] as const;
const title = "NMIET SIH Portal".split("");
const tagline = "Where Ideas Become Innovation.";

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const finishTimer = window.setTimeout(onComplete, 5400);
    return () => {
      window.clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <motion.section
      aria-label="Welcome to NMIET SIH Portal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18, scale: 0.985 }}
      transition={{ duration: 0.35, ease }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#faf8f5] px-5 text-[#25283a] dark:bg-[#faf8f5] dark:text-[#25283a]"
    >
      <motion.div
        aria-hidden
        className="absolute -left-32 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-primary/25 blur-[110px]"
        animate={{ scale: [1, 1.05, 1.18], x: [0, 12, 34], opacity: [0.6, 0.72, 0.9] }}
        transition={{ duration: 5.7, ease }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-32 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full bg-brand-blue/25 blur-[110px]"
        animate={{ scale: [1, 1.05, 1.18], x: [0, -12, -34], opacity: [0.55, 0.7, 0.85] }}
        transition={{ duration: 5.7, ease }}
      />
      <div aria-hidden className="noise absolute inset-0 opacity-25" />

      <div className="relative flex w-full max-w-xl flex-col items-center text-center">
        <motion.div className="flex items-center justify-center gap-3 sm:gap-4">
          <motion.img
            src="/logos/nmiet-logo.png"
            alt="NMIET"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.4, ease }}
            className="h-14 w-auto object-contain sm:h-16"
          />
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8, ease }}
          >
            <img
              src="/logos/IIC.png"
              alt="Innovation & Incubation Council"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </motion.div>
        </motion.div>

        <motion.h1
          className="mt-8 whitespace-nowrap font-display text-3xl font-semibold tracking-[-0.04em] sm:text-5xl"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { delayChildren: 1.3, staggerChildren: 0.03 } },
          }}
        >
          {title.map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.34, ease },
                },
              }}
            >
              {letter === " " ? "\u00a0" : letter}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 2.1, ease }}
          className="mt-3 text-sm font-medium text-[#5a5f72] sm:text-base"
        >
          Smart India Hackathon 2026
        </motion.p>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3, delay: 2.6, ease }}
          className="mt-6 h-px w-28 origin-center bg-primary"
        />
        <div className="mt-5 overflow-hidden">
          <motion.p
            initial={{ opacity: 0, y: 14, filter: "blur(5px)", clipPath: "inset(0 100% 0 0)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.65, delay: 3.1, ease }}
            className="font-display text-lg font-semibold text-primary sm:text-xl"
          >
            {tagline}
          </motion.p>
        </div>
      </div>
    </motion.section>
  );
}
