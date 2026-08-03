import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const sizeClasses = {
  xl: "h-28 w-28 text-2xl sm:h-32 sm:w-32 sm:text-3xl",
  lg: "h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl",
  md: "h-14 w-14 text-sm sm:h-16 sm:w-16 sm:text-base",
} as const;

export function getInitials(name: string) {
  const cleaned = name.replace(/^(Dr\.|Prof\.)\s*/i, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

export function ProfileAvatar({
  name,
  photo,
  size = "lg",
  className,
  animate = true,
}: {
  name: string;
  photo: string;
  size?: keyof typeof sizeClasses;
  className?: string;
  animate?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name);
  const showInitials = failed || !photo;

  const inner = (
    <div
      className={cn(
        "relative overflow-hidden rounded-full ring-2 ring-border/80 ring-offset-2 ring-offset-background transition-all duration-500 group-hover:ring-primary/40 group-hover:shadow-glow",
        sizeClasses[size],
        className,
      )}
    >
      {showInitials ? (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-primary),oklch(0.56_0.2_264))] font-display font-semibold text-primary-foreground"
        >
          {initials}
        </span>
      ) : (
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease }}
    >
      {inner}
    </motion.div>
  );
}
