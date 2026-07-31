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
  statements: number;
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
    statements: 42,
  },
  {
    id: "fitness-sports",
    name: "Fitness & Sports",
    icon: "activity",
    blurb: "Performance, coaching and recovery tech.",
    statements: 18,
  },
  {
    id: "heritage-culture",
    name: "Heritage & Culture",
    icon: "landmark",
    blurb: "Preserve and digitise Indian heritage.",
    statements: 21,
  },
  {
    id: "medtech-biotech",
    name: "MedTech / BioTech",
    icon: "heart-pulse",
    blurb: "Diagnostics, devices and care delivery.",
    statements: 37,
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: "sprout",
    blurb: "Farm intelligence and rural livelihoods.",
    statements: 34,
  },
  {
    id: "smart-vehicles",
    name: "Smart Vehicles",
    icon: "car-front",
    blurb: "Connected, electric and autonomous mobility.",
    statements: 16,
  },
  {
    id: "transportation",
    name: "Transportation & Logistics",
    icon: "truck",
    blurb: "Move people and freight smarter.",
    statements: 25,
  },
  {
    id: "robotics",
    name: "Robotics & Drones",
    icon: "bot",
    blurb: "Autonomy for the physical world.",
    statements: 19,
  },
  {
    id: "green-technology",
    name: "Clean & Green Technology",
    icon: "leaf",
    blurb: "Waste, water and emissions.",
    statements: 28,
  },
  {
    id: "tourism",
    name: "Travel & Tourism",
    icon: "plane",
    blurb: "Discovery, safety and local economies.",
    statements: 12,
  },
  {
    id: "renewable-energy",
    name: "Renewable Energy",
    icon: "sun",
    blurb: "Generation, storage and grid balance.",
    statements: 23,
  },
  {
    id: "blockchain",
    name: "Blockchain & Cybersecurity",
    icon: "shield-check",
    blurb: "Trust, identity and provenance.",
    statements: 26,
  },
  {
    id: "smart-education",
    name: "Smart Education",
    icon: "graduation-cap",
    blurb: "Learning that adapts to the learner.",
    statements: 31,
  },
  {
    id: "disaster-management",
    name: "Disaster Management",
    icon: "siren",
    blurb: "Early warning and rapid response.",
    statements: 17,
  },
  {
    id: "miscellaneous",
    name: "Miscellaneous",
    icon: "shapes",
    blurb: "Everything that defies a bucket.",
    statements: 29,
  },
  {
    id: "games",
    name: "Toys & Games",
    icon: "gamepad-2",
    blurb: "Play as a platform for learning.",
    statements: 11,
  },
  {
    id: "space-technology",
    name: "Space Technology",
    icon: "rocket",
    blurb: "Earth observation and beyond.",
    statements: 14,
  },
];

export const problemStatements: ProblemStatement[] = [
  {
    id: "1",
    psId: "SIH26-1042",
    title: "Predictive maintenance for municipal water pumping stations",
    organization: "Ministry of Jal Shakti",
    theme: "Smart Automation",
    category: "Hardware",
    difficulty: "Advanced",
    tags: ["IoT", "Edge ML", "Sensors"],
  },
  {
    id: "2",
    psId: "SIH26-1108",
    title: "AI coach for grassroots athletes using a single phone camera",
    organization: "Sports Authority of India",
    theme: "Fitness & Sports",
    category: "Software",
    difficulty: "Intermediate",
    tags: ["Computer Vision", "Mobile", "Pose Estimation"],
  },
  {
    id: "3",
    psId: "SIH26-1231",
    title: "Immersive digital twin walkthroughs for protected monuments",
    organization: "Archaeological Survey of India",
    theme: "Heritage & Culture",
    category: "Software",
    difficulty: "Intermediate",
    tags: ["WebGL", "Photogrammetry", "Accessibility"],
  },
  {
    id: "4",
    psId: "SIH26-1317",
    title: "Low-cost screening device for early diabetic retinopathy",
    organization: "Ministry of Health & Family Welfare",
    theme: "MedTech / BioTech",
    category: "Hardware",
    difficulty: "Advanced",
    tags: ["Optics", "Deep Learning", "Rural Health"],
  },
  {
    id: "5",
    psId: "SIH26-1402",
    title: "Crop advisory in regional languages for smallholder farmers",
    organization: "Ministry of Agriculture & Farmers Welfare",
    theme: "Agriculture",
    category: "Software",
    difficulty: "Beginner",
    tags: ["NLP", "Voice", "Offline First"],
  },
  {
    id: "6",
    psId: "SIH26-1544",
    title: "Battery health analytics for shared electric two-wheeler fleets",
    organization: "Ministry of Heavy Industries",
    theme: "Smart Vehicles",
    category: "Software",
    difficulty: "Intermediate",
    tags: ["Telemetry", "Dashboards", "EV"],
  },
  {
    id: "7",
    psId: "SIH26-1620",
    title: "Dynamic bus scheduling from live ridership signals",
    organization: "Ministry of Road Transport & Highways",
    theme: "Transportation & Logistics",
    category: "Software",
    difficulty: "Advanced",
    tags: ["Optimisation", "GTFS", "Simulation"],
  },
  {
    id: "8",
    psId: "SIH26-1711",
    title: "Autonomous drone survey for post-flood damage assessment",
    organization: "National Disaster Management Authority",
    theme: "Robotics & Drones",
    category: "Hardware",
    difficulty: "Advanced",
    tags: ["SLAM", "Aerial Imagery", "Geospatial"],
  },
  {
    id: "9",
    psId: "SIH26-1808",
    title: "Traceable plastic waste collection with incentive wallets",
    organization: "Ministry of Environment, Forest & Climate Change",
    theme: "Clean & Green Technology",
    category: "Software",
    difficulty: "Intermediate",
    tags: ["Circular Economy", "Payments", "Mobile"],
  },
  {
    id: "10",
    psId: "SIH26-1902",
    title: "Rooftop solar yield estimator from satellite imagery",
    organization: "Ministry of New & Renewable Energy",
    theme: "Renewable Energy",
    category: "Software",
    difficulty: "Intermediate",
    tags: ["Remote Sensing", "Maps", "Forecasting"],
  },
  {
    id: "11",
    psId: "SIH26-2014",
    title: "Tamper-proof academic credential verification network",
    organization: "Ministry of Education",
    theme: "Blockchain & Cybersecurity",
    category: "Software",
    difficulty: "Advanced",
    tags: ["Zero Knowledge", "Identity", "APIs"],
  },
  {
    id: "12",
    psId: "SIH26-2109",
    title: "Adaptive learning companion for first-generation engineers",
    organization: "AICTE",
    theme: "Smart Education",
    category: "Software",
    difficulty: "Beginner",
    tags: ["LLM", "Assessment", "Analytics"],
  },
  {
    id: "13",
    psId: "SIH26-2233",
    title: "Community flood early-warning mesh for low-connectivity zones",
    organization: "Ministry of Home Affairs",
    theme: "Disaster Management",
    category: "Hardware",
    difficulty: "Advanced",
    tags: ["LoRa", "Mesh Network", "Alerts"],
  },
  {
    id: "14",
    psId: "SIH26-2340",
    title: "Gamified financial literacy for rural high-school students",
    organization: "Department of Financial Services",
    theme: "Toys & Games",
    category: "Software",
    difficulty: "Beginner",
    tags: ["Game Design", "Regional Languages", "Progression"],
  },
  {
    id: "15",
    psId: "SIH26-2411",
    title: "Debris-collision risk visualiser for small satellite operators",
    organization: "ISRO",
    theme: "Space Technology",
    category: "Software",
    difficulty: "Advanced",
    tags: ["Orbital Mechanics", "3D", "Data Viz"],
  },
  {
    id: "16",
    psId: "SIH26-2508",
    title: "Smart itinerary assistant for heritage circuits in Maharashtra",
    organization: "Ministry of Tourism",
    theme: "Travel & Tourism",
    category: "Software",
    difficulty: "Beginner",
    tags: ["Recommendations", "Maps", "Local Guides"],
  },
];

export const announcements: Announcement[] = [
  {
    id: "a1",
    date: "2026-07-24",
    tag: "Registration",
    title: "Internal SIH registration is now open",
    body: "NMIET teams can submit their internal entry until the college deadline. One entry per team.",
  },
  {
    id: "a2",
    date: "2026-07-18",
    tag: "Problem Statements",
    title: "New problem statements published",
    body: "Fresh statements across MedTech, Space and Disaster Management are live in the explorer.",
  },
  {
    id: "a3",
    date: "2026-07-11",
    tag: "Mentorship",
    title: "Faculty mentor allotment desk opens Monday",
    body: "Drop by the innovation cell to get a mentor mapped to your chosen theme.",
  },
];
