import { motion } from "framer-motion";
import { useState } from "react";
import { getInitials } from "@/components/organizing-committee/profile-avatar";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const sizes = {
  hero: "h-56 w-56 sm:h-72 sm:w-72 lg:h-80 lg:w-80 text-5xl sm:text-6xl",
  xl: "h-44 w-44 sm:h-52 sm:w-52 lg:h-60 lg:w-60 text-4xl sm:text-5xl",
  lg: "h-28 w-28 sm:h-32 sm:w-32 text-2xl sm:text-3xl",
  md: "h-20 w-20 sm:h-24 sm:w-24 text-xl sm:text-2xl",
} as const;

export function Portrait({
  name,
  photo,
  size = "xl",
  glowColor,
  className,
  parallax = false,
}: {
  name: string;
  photo: string;
  size?: keyof typeof sizes;
  glowColor?: string;
  className?: string;
  parallax?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const initials = getInitials(name);
  const showInitials = failed || !photo;

  return (
    <div className={cn("group relative", className)}>
      {/* Ambient glow */}
      {glowColor ? (
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full blur-3xl transition-opacity duration-700 group-hover:opacity-100"
          style={{ background: glowColor, opacity: 0.7, scale: 1.15 }}
          animate={{ scale: [1.1, 1.2, 1.1], opacity: [0.5, 0.75, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <motion.div
        className={cn(
          "relative overflow-hidden rounded-full ring-1 ring-border/60 ring-offset-4 ring-offset-background shadow-lift",
          sizes[size],
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.5, ease }}
      >
        {showInitials ? (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,var(--color-primary),oklch(0.56_0.2_264))] font-display font-semibold text-primary-foreground"
          >
            {initials}
          </span>
        ) : (
          <motion.img
            src={photo}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setFailed(true)}
            style={parallax ? { willChange: "transform" } : undefined}
          />
        )}
      </motion.div>
    </div>
  );
}

export function LeadPortrait({
  name,
  photo,
  label,
  className,
}: {
  name: string;
  photo: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <Portrait name={name} photo={photo} size="md" />
      <div className="text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-base font-semibold sm:text-lg">{name}</p>
      </div>
    </div>
  );
}
