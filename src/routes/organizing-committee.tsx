import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { CtaSection } from "@/components/organizing-committee/sections/cta-section";
import { FacultySection } from "@/components/organizing-committee/sections/faculty-section";
import { HeroSection } from "@/components/organizing-committee/sections/hero-section";
import { OperationalSection } from "@/components/organizing-committee/sections/operational-section";
import { StudentSection } from "@/components/organizing-committee/sections/student-section";

export const Route = createFileRoute("/organizing-committee")({ component: OrganizingCommittee });

function OrganizingCommittee() {
  useEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = "smooth";

    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <HeroSection />
      <FacultySection />
      <StudentSection />
      <OperationalSection />
      <CtaSection />
    </div>
  );
}
