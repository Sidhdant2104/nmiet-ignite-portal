import {
  ChefHat,
  ClipboardList,
  Megaphone,
  Palette,
  Route as RouteIcon,
  Share2,
  Truck,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Base path for all organizing team profile photos. Drop JPG/WebP files here. */
export const ORGANIZING_TEAM_IMAGE_DIR = "/images/organizing-team";

/** Build a photo path from a filename slug, e.g. `photo("dr-pramod-patil")` → `/images/organizing-team/dr-pramod-patil.jpg` */
export function photo(slug: string) {
  return `${ORGANIZING_TEAM_IMAGE_DIR}/${slug}.jpg`;
}

export type TeamPerson = {
  name: string;
  photo: string;
  year?: string;
  department?: string;
  designation?: string;
  description?: string;
};

export type FacultyMember = TeamPerson & {
  role: string;
};

export type StudentLeader = TeamPerson & {
  role: string;
  quote: string;
};

export type TeamAccent = {
  /** Soft glow color behind the section */
  glow: string;
  /** Accent for icons and highlights */
  accent: string;
};

export type SectionLayout = "left" | "right" | "center";

export type OperationalTeam = {
  id: string;
  domain: string;
  shortLabel: string;
  description: string;
  mission: string;
  accent: TeamAccent;
  layout: SectionLayout;
  icon: LucideIcon;
  lead: TeamPerson;
  coLead?: TeamPerson;
};

export const facultyLeadership: FacultyMember[] = [
  {
    role: "Principal",
    name: "Dr. Pramod Patil",
    photo: photo("dr-pramod-patil"),
    description: "Providing institutional leadership and vision for SIH 2026.",
  },
  {
    role: "IIC Dean",
    name: "Dr. M.K. Biradar",
    photo: photo("dr-mk-biradar"),
    designation: "Professor",
    department: "Mechanical Engineering",
    description: "Leading innovation initiatives and faculty coordination for the hackathon.",
  },
  {
    role: "SIH SPOC",
    name: "Prof. Aishwini Shinde",
    photo: photo("prof-aishwini-shinde"),
    designation: "Professor",
    department: "ENTC Engineering",
    description: "Serving as the official Single Point of Contact for Smart India Hackathon.",
  },
];

export const studentLeadership: StudentLeader[] = [
  {
    role: "Student Lead",
    name: "Sidhdant Chopade",
    photo: photo("sidhdant-chopade"),
    year: "Third Year",
    department: "Computer Engineering",
    description: "Leading the overall planning and execution of NMIET SIH 2026.",
    quote: "Leading the planning, execution and coordination of NMIET SIH 2026.",
  },
  {
    role: "Student SPOC",
    name: "Vivek Tapkire",
    photo: photo("vivek-tapkire"),
    year: "Third Year",
    department: "Computer Engineering",
    description: "Managing coordination between students, faculty and organizing teams.",
    quote: "Connecting students, faculty and operations into one successful event.",
  },
];

export const operationalTeams: OperationalTeam[] = [
  {
    id: "campaign",
    domain: "Campaign & Registration",
    shortLabel: "Campaign",
    description: "Handles participant registration, communication and onboarding.",
    mission: "We ensure every innovator gets their chance.",
    accent: { glow: "oklch(0.7 0.19 45 / 18%)", accent: "oklch(0.7 0.19 45)" },
    layout: "left",
    icon: ClipboardList,
    lead: {
      name: "Tejas Patil",
      photo: photo("tejas-patil"),
      year: "Third Year",
      department: "Computer Engineering",
    },
    coLead: {
      name: "Siddhi Shinde",
      photo: photo("siddhi-shinde"),
      year: "Third Year",
      department: "Computer Science Engineering",
    },
  },
  {
    id: "technical",
    domain: "Technical",
    shortLabel: "Technical",
    description: "Handles portal, technical infrastructure and support.",
    mission: "We build the systems that power the hackathon experience.",
    accent: { glow: "oklch(0.56 0.2 264 / 18%)", accent: "oklch(0.56 0.2 264)" },
    layout: "right",
    icon: Wrench,
    lead: {
      name: "Yash Madane",
      photo: photo("yash-madane"),
      year: "Third Year",
      department: "Artificial Intelligence & Data Science",
    },
  },
  {
    id: "design",
    domain: "Design Team",
    shortLabel: "Design",
    description: "Creates branding, graphics and event visuals.",
    mission: "We craft the visual identity that defines SIH 2026.",
    accent: { glow: "oklch(0.58 0.18 300 / 18%)", accent: "oklch(0.58 0.18 300)" },
    layout: "center",
    icon: Palette,
    lead: {
      name: "Kalpesh Ghodke",
      photo: photo("kalpesh-ghodke"),
      year: "Third Year",
      department: "Mechanical Engineering",
    },
  },
  {
    id: "track",
    domain: "Track Coordinators",
    shortLabel: "Track",
    description: "Coordinates innovation tracks and mentoring.",
    mission: "We guide teams through every innovation track.",
    accent: { glow: "oklch(0.6 0.16 200 / 18%)", accent: "oklch(0.6 0.16 200)" },
    layout: "left",
    icon: RouteIcon,
    lead: {
      name: "Kanishka",
      photo: photo("kanishka"),
      year: "Third Year",
      department: "Computer Science Engineering",
    },
    coLead: {
      name: "Omkar Daulatabad",
      photo: photo("omkar-daulatabad"),
      year: "Third Year",
      department: "Computer Engineering",
    },
  },
  {
    id: "hospitality",
    domain: "Judge Hospitality",
    shortLabel: "Hospitality",
    description: "Coordinates judges and evaluation logistics.",
    mission: "We create a seamless experience for every judge.",
    accent: { glow: "oklch(0.6 0.16 152 / 18%)", accent: "oklch(0.6 0.16 152)" },
    layout: "right",
    icon: ChefHat,
    lead: {
      name: "Vedant Jadhav",
      photo: photo("vedant-jadhav"),
      year: "Second Year",
      department: "ENTC Engineering",
    },
  },
  {
    id: "food",
    domain: "Food Arrangements",
    shortLabel: "Food",
    description: "Manages catering and refreshments.",
    mission: "We keep every innovator fueled and focused.",
    accent: { glow: "oklch(0.75 0.15 75 / 18%)", accent: "oklch(0.75 0.15 75)" },
    layout: "center",
    icon: UtensilsCrossed,
    lead: {
      name: "Pranay Sonmale",
      photo: photo("pranay-sonmale"),
      year: "Third Year",
      department: "Computer Engineering",
    },
  },
  {
    id: "social",
    domain: "Social Media",
    shortLabel: "Social",
    description: "Manages marketing, announcements and digital reach.",
    mission: "We amplify the SIH story to the world.",
    accent: { glow: "oklch(0.65 0.2 350 / 18%)", accent: "oklch(0.65 0.2 350)" },
    layout: "left",
    icon: Share2,
    lead: {
      name: "Om Bajaj",
      photo: photo("om-bajaj"),
      year: "Third Year",
      department: "Computer Engineering",
    },
    coLead: {
      name: "Aayush Khadke",
      photo: photo("aayush-khadke"),
      year: "Second Year",
      department: "Mechanical Engineering",
    },
  },
  {
    id: "logistics",
    domain: "Logistics",
    shortLabel: "Logistics",
    description: "Coordinates venue operations and logistics.",
    mission: "We make sure everything runs on time, every time.",
    accent: { glow: "oklch(0.65 0.14 210 / 18%)", accent: "oklch(0.65 0.14 210)" },
    layout: "right",
    icon: Truck,
    lead: {
      name: "Parth Bichkar",
      photo: photo("parth-bichkar"),
      year: "Third Year",
      department: "Computer Engineering",
    },
    coLead: {
      name: "Ayush Tiwari",
      photo: photo("ayush-tiwari"),
      year: "Third Year",
      department: "ENTC Engineering",
    },
  },
  {
    id: "inauguration",
    domain: "Inauguration",
    shortLabel: "Inauguration",
    description: "Plans and manages opening ceremony.",
    mission: "We set the stage for an unforgettable opening.",
    accent: { glow: "oklch(0.68 0.17 40 / 18%)", accent: "oklch(0.68 0.17 40)" },
    layout: "center",
    icon: Megaphone,
    lead: {
      name: "Riya Shinde",
      photo: photo("riya-shinde"),
      year: "Third Year",
      department: "Artificial Intelligence & Data Science",
    },
  },
];

export const heroStats = [
  { value: 25, suffix: "+", label: "Organizers" },
  { value: facultyLeadership.length, suffix: "", label: "Faculty Leaders" },
  { value: operationalTeams.length, suffix: "", label: "Operational Teams" },
] as const;

export const coreTeamPlaceholder =
  "Volunteer recruitment in progress. The complete team will be announced after onboarding.";
