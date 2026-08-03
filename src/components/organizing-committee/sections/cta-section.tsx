import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

export function CtaSection() {
  return (
    <section className="relative flex min-h-[70svh] items-center overflow-hidden py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mesh-bg opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/12 blur-[100px]"
      />

      <div className="shell relative w-full">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Want to become part of the organizing committee?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Volunteer recruitment announcements will be shared by IIC NMIET.
          </p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.25, ease }}
            className="hover-lift mt-10 inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-card/60 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:border-primary hover:bg-primary/8"
          >
            <Bell className="h-4 w-4 text-primary" />
            Follow IIC Updates
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
