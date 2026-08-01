/**
 * Placeholder dataset served by the mock API routes.
 * Replace these handlers with a real backend later — the frontend only
 * consumes /api/* and never hardcodes this data in components.
 */

export type Theme = {
  id: string;
  name: string;
  icon: string;
  blurb: string;
};

export type ProblemStatement = {
  id: string;
  psId: string;
  title: string;
  organization: string;
  theme: string;
  category: "Software" | "Hardware";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
};

export type Announcement = {
  id: string;
  date: string;
  tag: string;
  title: string;
  body: string;
};

export const themes: Theme[] = [
  {
    id: "smart-automation",
    name: "Smart Automation",
    icon: "cpu",
    blurb: "Automate the manual, everywhere.",
  },
  {
    id: "fitness-sports",
    name: "Fitness & Sports",
    icon: "activity",
    blurb: "Performance, coaching and recovery tech.",
  },
  {
    id: "heritage-culture",
    name: "Heritage & Culture",
    icon: "landmark",
    blurb: "Preserve and digitise Indian heritage.",
  },
  {
    id: "medtech-biotech",
    name: "MedTech / BioTech",
    icon: "heart-pulse",
    blurb: "Diagnostics, devices and care delivery.",
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: "sprout",
    blurb: "Farm intelligence and rural livelihoods.",
  },
  {
    id: "smart-vehicles",
    name: "Smart Vehicles",
    icon: "car-front",
    blurb: "Connected, electric and autonomous mobility.",
  },
  {
    id: "transportation",
    name: "Transportation & Logistics",
    icon: "truck",
    blurb: "Move people and freight smarter.",
  },
  {
    id: "robotics",
    name: "Robotics & Drones",
    icon: "bot",
    blurb: "Autonomy for the physical world.",
  },
  {
    id: "green-technology",
    name: "Clean & Green Technology",
    icon: "leaf",
    blurb: "Waste, water and emissions.",
  },
  {
    id: "tourism",
    name: "Travel & Tourism",
    icon: "plane",
    blurb: "Discovery, safety and local economies.",
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    icon: "sun",
    blurb: "Generation, storage and grid balance.",
  },
  {
    id: "blockchain",
    name: "Blockchain & Cybersecurity",
    icon: "shield-check",
    blurb: "Trust, identity and provenance.",
  },
  {
    id: "smart-education",
    name: "Smart Education",
    icon: "graduation-cap",
    blurb: "Learning that adapts to the learner.",
  },
  {
    id: "disaster-management",
    name: "Disaster Management",
    icon: "siren",
    blurb: "Early warning and rapid response.",
  },
  {
    id: "miscellaneous",
    name: "Miscellaneous",
    icon: "shapes",
    blurb: "Everything that defies a bucket.",
  },
  {
    id: "games",
    name: "Toys & Games",
    icon: "gamepad-2",
    blurb: "Play as a platform for learning.",
  },
  {
    id: "space-technology",
    name: "Space Technology",
    icon: "rocket",
    blurb: "Earth observation and beyond.",
  },
  {
    id: "disaster-management",
    name: "Disaster Management",
    icon: "shield",
    blurb: "Early warning, response and resilience.",
  },
];

/** Empty until SIH officially releases the statements. */
export const problemStatements: ProblemStatement[] = [];

export const announcements: Announcement[] = [
  {
    id: "a1",
    date: "2026-07-28",
    tag: "Registration",
    title: "Internal SIH 2026 registrations are open",
    body: "Form your team of 6 (at least one female member) and submit your internal entry on this portal.",
  },
  {
    id: "a2",
    date: "2026-07-30",
    tag: "Problem statements",
    title: "Problem statements awaiting official release",
    body: "SIH has not published the 2026 problem statements yet. They will appear on this portal automatically.",
  },
  {
    id: "a3",
    date: "2026-08-01",
    tag: "Selection",
    title: "45 teams will be shortlisted, 5 waitlisted",
    body: "The internal jury shortlists 45 teams for official SIH nomination with 5 teams on standby.",
  },
  {
    id: "a4",
    date: "2026-08-05",
    tag: "Mentors",
    title: "Faculty mentor mapping support",
    body: "Teams without a mentor can request one through the NMIET innovation cell.",
  },
];
