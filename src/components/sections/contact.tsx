import { Badge, GraduationCap, Mail, Phone, UserRound } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

export function ContactSection() {
  return (
    <section id="contact" className="section-pad relative overflow-hidden">
      <div className="shell">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Talk to the <span className="text-gradient">innovation cell</span>
            </>
          }
          description="Drop by the cell during college hours, or reach the coordinator directly."
        />

        <div className="mt-14 grid items-stretch gap-4 lg:grid-cols-2">
          <Reveal className="glass flex h-full flex-col rounded-4xl p-7 shadow-soft sm:p-9">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,oklch(0.7_0.19_45),oklch(0.56_0.2_300))] text-lg font-display font-semibold text-primary-foreground shadow-glow ring-2 ring-border/80 ring-offset-2 ring-offset-background">
                AS
              </span>
              <div>
                <p className="font-display text-xl font-semibold tracking-tight">Faculty SPOC</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Smart India Hackathon 2026
                </p>
              </div>
            </div>

            <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
              For faculty coordination, institutional queries or SIH guidance, reach out directly.
            </p>

            <ul className="mt-7 space-y-5">
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <UserRound className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                  <p className="mt-1 font-medium">Dr. Ashwini Shinde</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Badge className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Role</p>
                  <p className="mt-1 font-medium">Faculty SPOC — Smart India Hackathon 2026</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Department</p>
                  <p className="mt-1 font-medium">ENTC Engineering · Professor</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                  <a href="mailto:ashwini.shinde@nmiet.edu.in" className="mt-1 block break-words font-medium transition-colors hover:text-primary">
                    ashwini.shinde@nmiet.edu.in
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Phone</p>
                  <p className="mt-1 font-medium">+91 80559 35256</p>
                </div>
              </li>
            </ul>

            <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              Available during college hours.
            </p>

            <a href="mailto:sih@nmiet.edu.in" className="mt-9 block">
              <MagneticButton className="w-full bg-primary text-primary-foreground shadow-glow hover:brightness-105">
                Contact Faculty SPOC
              </MagneticButton>
            </a>
          </Reveal>

          <Reveal
            delay={0.1}
            className="glass flex h-full flex-col rounded-4xl p-7 shadow-soft transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-lift sm:p-9"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,oklch(0.7_0.19_45),oklch(0.56_0.2_300))] text-lg font-display font-semibold text-primary-foreground shadow-glow ring-2 ring-border/80 ring-offset-2 ring-offset-background">
                VT
              </span>
              <div>
                <p className="font-display text-xl font-semibold tracking-tight">Student SPOC</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Smart India Hackathon 2026
                </p>
              </div>
            </div>

            <p className="mt-7 text-sm leading-relaxed text-muted-foreground">
              Need help with registrations, team formation, PPT submissions or portal issues? Reach out directly.
            </p>

            <ul className="mt-7 space-y-5">
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <UserRound className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Name</p>
                  <p className="mt-1 font-medium">Vivek Tapkire</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Badge className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Role</p>
                  <p className="mt-1 font-medium">Student SPOC — Smart India Hackathon 2026</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <GraduationCap className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Department</p>
                  <p className="mt-1 font-medium">Computer Engineering · Third Year</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Mail className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Email</p>
                  <a href="mailto:vivek.tapkire@nmiet.edu.in" className="mt-1 block break-words font-medium transition-colors hover:text-primary">
                    vivek.tapkire@nmiet.edu.in
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                  <Phone className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Phone</p>
                  <p className="mt-1 font-medium">+91 93220 53251</p>
                </div>
              </li>
            </ul>

            <p className="mt-7 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              Usually responds within a few hours.
            </p>

            <a href="mailto:student@sih.nmiet.edu.in" className="mt-9 block">
              <MagneticButton className="w-full bg-primary text-primary-foreground shadow-glow hover:brightness-105">
                Contact Student SPOC
              </MagneticButton>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
