import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/sections/about";
import { ContactSection } from "@/components/sections/contact";
import { EligibilitySection } from "@/components/sections/eligibility";
import { FaqSection } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ProblemStatementsSection } from "@/components/sections/problem-statements";
import { TeamStructureSection } from "@/components/sections/team-structure";
import { ThemesSection } from "@/components/sections/themes";
import { TimelineSection } from "@/components/sections/timeline";

const title = "NMIET SIH Portal — Smart India Hackathon 2026";
const description =
  "Explore Smart India Hackathon 2026 themes and problem statements, learn the process, and register for NMIET's internal SIH selection.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <AboutSection />
      <EligibilitySection />
      <TeamStructureSection />
      <ThemesSection />
      <ProblemStatementsSection />
      <TimelineSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
