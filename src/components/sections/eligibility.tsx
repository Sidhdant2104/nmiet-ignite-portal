import { CalendarCheck, CheckCircle2, GraduationCap, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const cards = [
  {
    icon: GraduationCap,
    title: "Who can apply",
    body: "Any NMIET student currently enrolled in a UG or PG programme, across all departments and years.",
  },
  {
    icon: ShieldCheck,
    title: "Team requirements",
    body: "Exactly 6 students per team with at least one female member, plus one faculty mentor.",
  },
  {
    icon: CalendarCheck,
    title: "One entry rule",
    body: "A student may appear in only one internal entry. Duplicate names invalidate both teams.",
  },
];

const faqs = [
  {
    q: "Can first-year students participate?",
    a: "Yes. First-year students are encouraged to join as members, and many finalists have first-year contributors. Team leaders are usually second year and above simply because coordination takes time.",
  },
  {
    q: "Can a team mix departments and years?",
    a: "Absolutely — cross-department teams tend to perform better because hardware, software and design skills sit in one room.",
  },
  {
    q: "Is a female member mandatory?",
    a: "For the software edition, SIH requires at least one female member in every team. Plan for it while forming your team.",
  },
  {
    q: "What if we don't have a faculty mentor yet?",
    a: "Register with your preferred mentor's details after speaking to them. The innovation cell can help map a mentor to your theme if you're unsure.",
  },
  {
    q: "Do we need a finished product to register?",
    a: "No. Internal registration only needs a chosen problem statement and a credible approach. Build the prototype during the evaluation window.",
  },
];

export function EligibilitySection() {
  return (
    <section id="eligibility" className="section-pad relative">
      <div className="shell grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            eyebrow="Eligibility"
            title={
              <>
                Check the basics <span className="text-gradient">before you register</span>
              </>
            }
            description="Three rules cover almost every question. The details are in the accordion beside — expand what applies to you."
          />
          <div className="mt-10 space-y-3">
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="hover-lift flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
                    <c.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="rounded-4xl border border-border bg-card p-3 shadow-soft sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  <span className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                    {f.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-7 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
