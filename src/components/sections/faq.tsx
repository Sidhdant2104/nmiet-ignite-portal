import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";

const faqs = [
  {
    q: "What exactly is the internal SIH selection?",
    a: "SIH allows a limited number of nominations per institute. NMIET runs its own evaluation round to decide which teams get nominated on the national portal.",
  },
  {
    q: "How many teams can NMIET nominate?",
    a: "The count depends on the national guidelines released each year. Historically it has been a few dozen software teams and a smaller hardware quota.",
  },
  {
    q: "Can two teams pick the same problem statement?",
    a: "Yes, internally. If both clear evaluation, the panel may ask them to merge or differentiate their approach before nomination.",
  },
  {
    q: "What should we prepare for the evaluation round?",
    a: "A crisp 6–8 slide deck: problem, users, proposed solution, tech stack, feasibility and impact. A rough demo helps but is not mandatory.",
  },
  {
    q: "Is there any registration fee?",
    a: "No. Internal registration and the national hackathon are both free for students.",
  },
  {
    q: "Will the college support travel to the finale?",
    a: "Shortlisted teams are supported through the innovation cell as per institute policy. Details are shared after nomination.",
  },
  {
    q: "Can we change our problem statement after registering?",
    a: "Until internal registration closes, yes — write to the coordinator with your new PS ID. After evaluation begins, changes are not permitted.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="section-pad relative">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <SectionHeading
            eyebrow="FAQ"
            title={
              <>
                Everything students <span className="text-gradient">ask us first</span>
              </>
            }
            description="Still unsure about something? The coordinator details are right below."
          />
        </div>
        <Reveal className="rounded-4xl border border-border bg-card p-3 shadow-soft sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
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
