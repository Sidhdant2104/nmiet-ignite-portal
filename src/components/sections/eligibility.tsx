import { Building2, GraduationCap, UserRound, Users, Venus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "@/components/motion/reveal";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { SectionHeading } from "@/components/section-heading";

const cards = [
  {
    icon: Users,
    title: "Exactly 6 members",
    body: "Every team must consist of exactly 6 student members — no more, no fewer.",
    tone: "text-primary",
    bg: "bg-primary-soft",
  },
  {
    icon: Venus,
    title: "1 female member mandatory",
    body: "At least ONE female member is mandatory in every team. Plan for it while forming your team.",
    tone: "text-brand-green",
    bg: "bg-brand-green/15",
  },
  {
    icon: Building2,
    title: "Same college only",
    body: "All 6 team members must belong to the same college — NMIET students only for this internal entry.",
    tone: "text-brand-blue",
    bg: "bg-brand-blue/15",
  },
  {
    icon: GraduationCap,
    title: "1 faculty mentor",
    body: "Every team must have one faculty mentor who guides the team and verifies the submission.",
    tone: "text-primary",
    bg: "bg-primary-soft",
  },
];

export function EligibilitySection() {
  return (
    <section id="eligibility" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          eyebrow="Eligibility"
          title={
            <>
              Four rules decide <span className="text-gradient">if your team is valid</span>
            </>
          }
          description="Teams that miss any of these are disqualified at verification. Check them before you register."
          align="center"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="hover-lift group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div
                  aria-hidden
                  className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${c.bg} ${c.tone}`}>
                  <c.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/guidelines">
            <MagneticButton className="border border-border bg-card/70 px-7 py-3.5 text-foreground hover:bg-accent">
              <UserRound className="h-4 w-4 text-brand-blue" aria-hidden /> Read full guidelines
            </MagneticButton>
          </Link>
          <Link to="/register">
            <MagneticButton className="bg-primary px-7 py-3.5 text-primary-foreground shadow-glow hover:brightness-105">
              Register your team
            </MagneticButton>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
