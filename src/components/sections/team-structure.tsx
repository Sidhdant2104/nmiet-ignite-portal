import { motion } from "framer-motion";
import { Crown, GraduationCap, UserRound } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const members = ["Member 2", "Member 3", "Member 4", "Member 5", "Member 6"];

export function TeamStructureSection() {
  return (
    <section id="team" className="section-pad relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue/10 blur-[120px]"
      />
      <div className="shell">
        <SectionHeading
          eyebrow="Team structure"
          title={
            <>
              One leader, five members,{" "}
              <span className="text-gradient">one faculty mentor</span>
            </>
          }
          description="Every SIH team is exactly six students plus a mentor who signs off on the submission. Here's how the roles connect."
          align="center"
        />

        <Reveal className="mt-16">
          <div className="glass relative mx-auto max-w-4xl rounded-4xl p-8 shadow-lift sm:p-12">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative flex flex-col items-center gap-2 rounded-3xl border border-primary/30 bg-card px-7 py-5 shadow-glow"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Crown className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold">Team Leader</span>
                <span className="text-xs text-muted-foreground">Single point of contact</span>
              </motion.div>

              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: 56 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="w-px bg-gradient-to-b from-primary to-brand-blue"
                aria-hidden
              />

              <ul className="grid w-full gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {members.map((m, i) => (
                  <motion.li
                    key={m}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-4 py-5 text-center shadow-soft"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-brand-blue">
                      <UserRound className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium">{m}</span>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: 56 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="w-px bg-gradient-to-b from-brand-blue to-brand-green"
                aria-hidden
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="flex flex-col items-center gap-2 rounded-3xl border border-brand-green/30 bg-card px-7 py-5 shadow-soft"
              >
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-green/15 text-brand-green">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-display text-sm font-semibold">Faculty Mentor</span>
                <span className="text-xs text-muted-foreground">Guides &amp; verifies the team</span>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
