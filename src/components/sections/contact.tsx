import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const details = [
  { icon: UserRound, label: "SIH Coordinator", value: "Prof. SIH Coordinator, Innovation Cell" },
  { icon: Mail, label: "Email", value: "sih@nmiet.edu.in", href: "mailto:sih@nmiet.edu.in" },
  { icon: Phone, label: "Phone", value: "+91 00000 00000", href: "tel:+910000000000" },
  {
    icon: MapPin,
    label: "Location",
    value: "NMIET, Talegaon Dabhade, Pune, Maharashtra 410507",
  },
];

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

        <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
          <Reveal className="glass rounded-4xl p-7 shadow-soft sm:p-9">
            <ul className="space-y-6">
              {details.map((d) => (
                <li key={d.label} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                    <d.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {d.label}
                    </p>
                    {d.href ? (
                      <a
                        href={d.href}
                        className="mt-1 block break-words font-medium transition-colors hover:text-primary"
                      >
                        {d.value}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium">{d.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/register" className="mt-9 block">
              <MagneticButton className="w-full bg-primary text-primary-foreground shadow-glow hover:brightness-105">
                Register your team
              </MagneticButton>
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="relative overflow-hidden rounded-4xl border border-border bg-card shadow-soft">
            <div className="relative h-full min-h-[22rem] w-full">
              <div
                aria-hidden
                className="absolute inset-0 mesh-bg opacity-70"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "44px 44px",
                }}
              />
              <div className="relative flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-card text-primary shadow-soft">
                  <MapPin className="h-6 w-6" aria-hidden />
                </span>
                <p className="font-display text-lg font-semibold">Map placeholder</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  An embedded campus map will render here once the maps key is connected.
                </p>
                <a
                  href="https://maps.google.com/?q=NMIET+Talegaon+Dabhade+Pune"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 rounded-full border border-border bg-card/80 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-accent"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
