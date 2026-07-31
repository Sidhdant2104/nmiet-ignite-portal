import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  CarFront,
  Cpu,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  Plane,
  Rocket,
  Shapes,
  ShieldCheck,
  Siren,
  Sprout,
  Sun,
  Truck,
} from "lucide-react";

export const themeIcons: Record<string, LucideIcon> = {
  cpu: Cpu,
  activity: Activity,
  landmark: Landmark,
  "heart-pulse": HeartPulse,
  sprout: Sprout,
  "car-front": CarFront,
  truck: Truck,
  bot: Bot,
  leaf: Leaf,
  plane: Plane,
  sun: Sun,
  "shield-check": ShieldCheck,
  "graduation-cap": GraduationCap,
  siren: Siren,
  shapes: Shapes,
  "gamepad-2": Gamepad2,
  rocket: Rocket,
};

export function getThemeIcon(name: string): LucideIcon {
  return themeIcons[name] ?? Shapes;
}
