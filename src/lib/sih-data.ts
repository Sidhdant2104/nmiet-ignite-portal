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
