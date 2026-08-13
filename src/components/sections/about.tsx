import { motion } from "framer-motion";
import {
  Award,
  BriefcaseBusiness,
  FileBadge,
  Lightbulb,
  Network,
  Rocket,
} from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const benefits = [
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "Turn a real ministry-level problem into a working prototype in 36 hours.",
  },
  {
    icon: Network,
    title: "Networking",
    body: "Build with peers from across India and meet evaluators from industry.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Internships",
    body: "Strong teams get noticed by partner organisations and startups.",
  },
  {
    icon: Award,
    title: "National recognition",
    body: "A grand finale win is a line on your resume that opens doors.",
  },
  {
    icon: FileBadge,
    title: "Certificates",
    body: "Every shortlisted participant receives official recognition.",
  },
  {
    icon: Rocket,
    title: "Real impact",
    body: "Winning solutions get incubated and deployed with the problem owner.",
  },
];

const journey = [
  {
    step: "01",
    title: "Form your team",
    body: "Build a team of 6 NMIET students with one designated team leader. Faculty mentor is optional.",
  },
  {
    step: "02",
    title: "Choose a problem statement",
    body: "Explore 400+ official SIH problem statements across 18 themes and select the one your team wants to solve.",
  },
  {
    step: "03",
    title: "Internal evaluation",
    body: "Present your idea to the NMIET evaluation panel. Top teams will be nominated for SIH 2026.",
  },
  {
    step: "04",
    title: "Official SIH journey",
    body: "Shortlisted teams will be registered on the official SIH Portal and continue through the national selection process.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="section-pad relative overflow-hidden">
      <div className="shell">
        <SectionHeading
          eyebrow="About IIC NMIET"
          title={
            <>
              Innovation at NMIET,{" "}
              <span className="text-gradient">powered by IIC</span>
            </>
          }
          description="The Institution's Innovation Council (IIC) at NMIET promotes innovation, creativity and entrepreneurship among students through workshops, competitions, hackathons and other innovation-driven initiatives. As part of these efforts, IIC NMIET is facilitating the institute's internal selection for Smart India Hackathon 2026, giving student teams an opportunity to turn ideas into impactful solutions."
        />

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {journey.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08}>
              <div className="hover-lift group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft">
                <span className="font-display text-4xl font-semibold text-primary/25 transition-colors group-hover:text-primary/50">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                <motion.div
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.9,
                    delay: 0.2 + i * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-x-6 bottom-5 h-px origin-left bg-gradient-to-r from-primary via-brand-blue to-transparent"
                />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-24">
          <SectionHeading
            eyebrow="Why participate"
            title="Six reasons students keep coming back"
            align="center"
          />
          <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <StaggerItem key={b.title}>
                <div className="hover-lift group h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform duration-500 group-hover:-rotate-6">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {b.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
