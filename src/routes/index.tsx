import { createFileRoute } from "@tanstack/react-router";
import { AboutSection } from "@/components/sections/about";
import { ContactSection } from "@/components/sections/contact";
import { EligibilitySection } from "@/components/sections/eligibility";
import { FaqSection } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { ProblemStatementsPreview } from "@/components/sections/problem-statements-preview";
import { SelectionFlowSection } from "@/components/sections/selection-flow";
import { TeamStructureSection } from "@/components/sections/team-structure";
import { ThemesSection } from "@/components/sections/themes";
import { TimelineSection } from "@/components/sections/timeline";

const title = "NMIET SIH Portal — Smart India Hackathon 2026";
const description =
  "Explore Smart India Hackathon 2026 themes, understand NMIET's internal selection of 45 teams plus 5 waitlisted, and register your 6-member team.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <ProblemStatementsPreview />
      <SelectionFlowSection />
      <TimelineSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
