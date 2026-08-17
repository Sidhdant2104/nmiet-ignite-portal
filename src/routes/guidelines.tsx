import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Building2,
  CalendarClock,
  ClipboardList,
  Download,
  FileUp,
  Gavel,
  GraduationCap,
  ListChecks,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
  Venus,
} from "lucide-react";
import { useState } from "react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";
import { SelectionFlowSection } from "@/components/sections/selection-flow";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const title = "SIH Guidelines — NMIET SIH Portal";
const description =
  "Understand the complete Smart India Hackathon journey: eligibility, team formation, internal selection, idea submission, evaluation and the grand finale.";

export const Route = createFileRoute("/guidelines")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuidelinesPage,
});

const sections = [
  { id: "eligibility", label: "Eligibility" },
  { id: "team-formation", label: "Team formation" },
  { id: "internal-hackathon", label: "Internal hackathon" },
  { id: "selection", label: "Selection process" },
  { id: "registration", label: "Registration" },
  { id: "ps-selection", label: "Problem statement selection" },
  { id: "idea-submission", label: "Idea submission" },
  { id: "evaluation", label: "Evaluation criteria" },
  { id: "finale", label: "Grand finale" },
  { id: "rules", label: "Important rules" },
  { id: "faq", label: "FAQ" },
  { id: "downloads", label: "Downloads" },
];

const eligibility = [
  {
    icon: GraduationCap,
    title: "Enrolled NMIET student",
    body: "Any UG or PG student currently enrolled at NMIET, from any department and any year.",
  },
  {
    icon: Users,
    title: "Exactly 6 members",
    body: "Teams must have exactly 6 student members — incomplete teams are not evaluated.",
  },
  {
    icon: Venus,
    title: "1 female member mandatory",
    body: "At least one female member is mandatory in every team.",
  },
  {
    icon: Building2,
    title: "Same college",
    body: "All 6 members must belong to the same college. Cross-college teams are invalid.",
  },
];

const teamFormation = [
  {
  step: "01",
  title: "Find your six",
  body: "Form a team of exactly six student members with a balanced mix of skills and expertise.",
},
{
  step: "02",
  title: "Include a female member",
  body: "Every team must include at least one female member as per SIH guidelines.",
},
{
  step: "03",
  title: "Pick a leader",
  body: "Choose one team leader who will act as the primary point of contact throughout the competition.",
},
{
  step: "04",
  title: "Add a faculty mentor (Optional)",
  body: "You may register without a faculty mentor initially. A mentor can be assigned or updated later if required.",
},
];

const internalProcess = [
  { title: "Internal registration", body: "Submit your team, theme, proposed problem statement title and mentor details here." },
  { title: "Idea review", body: "Coordinators check completeness, duplicates and eligibility." },
  { title: "Prototype build", body: "Build a demonstrable prototype during the build window." },
  { title: "Internal hackathon day", body: "Present live to the jury with a working demo." },
  { title: "Jury scoring", body: "Teams are scored against the SIH evaluation criteria." },
  { title: "Results", body: "45 teams shortlisted, 5 waitlisted, nominations filed with SIH." },
];

const psSelection = [
  "Choose an SIH theme that matches your team's technical strengths (Software or Hardware).",
  "Define a focused proposed problem statement title within that theme.",
  "Evaluate the problem's feasibility, innovation potential, and expected impact.",
  "Official SIH Problem Statements and PS IDs will be published when SIH releases them; they are not required for current registration.",
  "Avoid statements that depend on proprietary data, unavailable hardware, or unrealistic implementation timelines.",
];

const ideaSubmission = [
  {
    title: "Idea document",
    body: "Explain the problem, your proposed solution, innovation, and expected impact.",
  },
  {
    title: "Technical approach",
    body: "Describe your architecture, technology stack, hardware requirements, and feasibility.",
  },
  {
    title: "Prototype evidence",
    body: "Include screenshots, a demo video, Figma design, GitHub repository, or a working prototype link.",
  },
  {
    title: "Faculty mentor (Optional)",
    body: "A faculty mentor is recommended but not mandatory during registration. Mentor details can be added later if required.",
  },
];

const criteria = [
  { label: "Novelty of the idea", weight: 20 },
  { label: "Technical feasibility & approach", weight: 25 },
  { label: "Prototype completeness / demo", weight: 25 },
  { label: "Impact and scalability", weight: 20 },
  { label: "Presentation & teamwork", weight: 10 },
];

const rules = [
  "A student can be part of only one team. Duplicate registrations may lead to disqualification.",
  "All six student members must belong to the same college.",
  "At least one female member is mandatory in every team.",
  "A faculty mentor is optional during registration and can be added later if required.",
  "Plagiarised, copied, or previously submitted ideas are not eligible.",
  "The team leader's contact details will be used for all official communication.",
  "Once the institute nominates teams to SIH, changes to team details may not be permitted.",
];

const faqs = [
  {
    q: "Can first-year students participate?",
    a: "Yes. First-year students are encouraged to join as members. Leaders are usually second year and above simply because coordination takes time.",
  },
  {
    q: "Can a team mix departments and years?",
    a: "Absolutely — cross-department teams tend to perform better because hardware, software and design skills sit in one room.",
  },
  {
    q: "Is a female member mandatory?",
    a: "Yes. At least one female member is mandatory in every team.",
  },
  {
    q: "Can members be from another college?",
    a: "No. All six members must belong to the same college.",
  },
  {
    q: "What if we don't have a faculty mentor yet?",
    a: "You can still complete your registration. Faculty mentor details are optional during the internal selection process and can be added later if required by the institute or SIH.",
  },
  {
    q: "Do we need a finished product to register?",
    a: "No. Internal registration only needs a chosen problem statement and a credible approach. Build the prototype during the evaluation window.",
  },
  {
    q: "When will problem statements be available?",
    a: "Once SIH officially publishes them. They will appear on the Problem Statements page automatically.",
  },
  {
    q: "How many teams get nominated?",
    a: "45 teams are shortlisted for official SIH nomination and 5 more are waitlisted as standby.",
  },
];

const downloads = [
  {
    title: "NMIET SIH 2026 Guidelines",
    meta: "PDF",
    href: "/resources/NMIET_SIH_2026_Guidebook.pdf",
    filename: "NMIET_SIH_2026_Guidebook.pdf",
  },
  {
    title: "Idea Presentation Template",
    meta: "PPTX",
    href: "/resources/NMIET_SIH_2026_PPT_Template.pptx",
    filename: "NMIET_SIH_2026_PPT_Template.pptx",
  },
  {
    title: "Team Formation Checklist",
    meta: "PDF",
  },
  {
    title: "Registration Guide",
    meta: "PDF",
  },
];

function GuidelinesPage() {
  return (
    <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
      <AmbientBackdrop variant="soft" className="-z-10" />

      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <BookOpenCheck className="h-3.5 w-3.5 text-primary" aria-hidden /> Guidelines
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl">
            The complete SIH journey, <span className="text-gradient">in five minutes</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Everything from forming a valid team to standing on the grand finale floor — as cards,
            timelines and checklists instead of walls of text.
          </p>
        </motion.div>
      </div>

      <div className="shell mt-14 grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Guideline sections" className="lg:sticky lg:top-28 lg:h-max">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            On this page
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-2xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-20">
          <Block id="eligibility" icon={GraduationCap} title="Eligibility">
            <div className="grid gap-4 sm:grid-cols-2">
              {eligibility.map((e, i) => (
                <Reveal key={e.title} delay={i * 0.06}>
                  <div className="hover-lift h-full rounded-3xl border border-border bg-card p-5 shadow-soft">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary">
                      <e.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-4 font-semibold">{e.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Block>

          <Block id="team-formation" icon={Users} title="Team formation">
            <div className="grid gap-4 sm:grid-cols-2">
              {teamFormation.map((t, i) => (
                <Reveal key={t.title} delay={i * 0.06}>
                  <div className="hover-lift h-full rounded-3xl border border-border bg-card p-5 shadow-soft">
                    <span className="font-mono text-xs font-semibold text-primary">{t.step}</span>
                    <h3 className="mt-2 font-semibold">{t.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Block>

          <Block id="internal-hackathon" icon={CalendarClock} title="Internal hackathon process">
            <ol className="relative border-l border-border pl-8">
              {internalProcess.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.05} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[2.6rem] mt-1 grid h-6 w-6 place-items-center rounded-full border border-border bg-card text-[0.65rem] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </Reveal>
              ))}
            </ol>
          </Block>

         <Block id="registration" icon={ClipboardList} title="Registration process">
  <div className="rounded-4xl border border-border bg-card p-6 shadow-soft">
    <ol className="grid gap-4 sm:grid-cols-2">
      {[
        "Open the registration page and enter your team details, selected theme and proposed problem statement title.",
        "Fill in complete details for the team leader and all five team members.",
        "Add faculty mentor details if available (optional and can be updated later if required).",
        "Review all the information carefully, then click Confirm & Submit to complete your registration.",
      ].map((r, i) => (
        <li key={r} className="flex gap-3 rounded-2xl bg-accent/50 p-4">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {i + 1}
          </span>
          <span className="text-sm leading-relaxed text-muted-foreground">{r}</span>
        </li>
      ))}
    </ol>

    <div className="mt-6 flex flex-wrap gap-3">
      <Link to="/register">
        <MagneticButton className="bg-primary px-6 py-3 text-primary-foreground shadow-glow hover:brightness-105">
          Start Registration
        </MagneticButton>
      </Link>

      <Link to="/problem-statements">
        <MagneticButton className="border border-border bg-card/70 px-6 py-3 text-foreground hover:bg-accent">
          Browse Problem Statements
        </MagneticButton>
      </Link>
    </div>
  </div>
</Block>

          <Block id="ps-selection" icon={ListChecks} title="Problem statement selection">
            <ul className="space-y-3">
              {psSelection.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 0.05}>
                  <span className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground shadow-soft">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                    {p}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Block>

          <Block id="idea-submission" icon={FileUp} title="Idea submission process">
            <div className="grid gap-4 sm:grid-cols-2">
              {ideaSubmission.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.06}>
                  <div className="hover-lift h-full rounded-3xl border border-border bg-card p-5 shadow-soft">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Block>

          <Block id="evaluation" icon={Gavel} title="Evaluation criteria">
            <div className="space-y-4 rounded-4xl border border-border bg-card p-6 shadow-soft">
              {criteria.map((c, i) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground">{c.weight}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.weight * 4}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-brand-blue"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <Block id="finale" icon={Trophy} title="Grand finale">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "36 hours", body: "Non-stop building at the nodal centre." },
                { title: "Live mentoring", body: "Industry mentors review progress in rounds." },
                { title: "Final pitch", body: "Demo to the national jury for the win." },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 0.07}>
                  <div className="glass h-full rounded-3xl p-5 shadow-soft">
                    <h3 className="font-display text-lg font-semibold text-gradient">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Block>

          <Block id="rules" icon={ShieldAlert} title="Important rules">
            <ul className="grid gap-3 sm:grid-cols-2">
              {rules.map((r) => (
                <li
                  key={r}
                  className="rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm leading-relaxed text-muted-foreground"
                >
                  {r}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="faq" icon={BookOpenCheck} title="Frequently asked questions">
            <div className="rounded-4xl border border-border bg-card p-3 shadow-soft sm:p-6">
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
            </div>
          </Block>

          <Block id="downloads" icon={Download} title="Downloads">
            <div className="grid gap-3 sm:grid-cols-2">
              {downloads.map((d) => (
                <DownloadCard key={d.title} {...d} />
              ))}
            </div>
          </Block>
        </div>
      </div>

      <SelectionFlowSection />
    </div>
  );
}

function DownloadCard({ title, meta, href, filename }: { title: string; meta: string; href?: string; filename?: string }) {
  const [clicked, setClicked] = useState(false);
  if (href) return <a href={href} download={filename} className="hover-lift flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left shadow-soft"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue"><Download className="h-5 w-5" aria-hidden /></span><span className="min-w-0"><span className="block truncate font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{meta}</span></span></a>;
  return (
    <button
      type="button"
      onClick={() => setClicked(true)}
      className="hover-lift flex items-center gap-4 rounded-3xl border border-border bg-card p-5 text-left shadow-soft"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent text-brand-blue">
        <Download className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {clicked ? "Coming soon — file not uploaded yet" : meta}
        </span>
      </span>
    </button>
  );
}

function Block({
  id,
  icon: Icon,
  title: heading,
  children,
}: {
  id: string;
  icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{heading}</h2>
        </div>
      </Reveal>
      <div className="mt-7">{children}</div>
    </section>
  );
}
