import { motion } from "framer-motion";
import type { ComponentType } from "react";
import { LeadPortrait } from "@/components/organizing-committee/portrait";
import type { OperationalTeam, SectionLayout } from "@/components/organizing-committee/team-data";
import { coreTeamPlaceholder, operationalTeams } from "@/components/organizing-committee/team-data";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

function TeamIcon({ team }: { team: OperationalTeam }) {
  const Icon = team.icon;
  return (
    <span
      className="grid h-16 w-16 place-items-center rounded-2xl backdrop-blur sm:h-20 sm:w-20"
      style={{
        background: team.accent.glow,
        color: team.accent.accent,
      }}
    >
      <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.5} />
    </span>
  );
}

function LeftLayout({ team }: { team: OperationalTeam }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20 max-md:gap-7">
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.85, ease }}
        className="flex flex-wrap items-end gap-8 sm:gap-12 max-md:justify-center max-md:gap-5"
      >
        <LeadPortrait name={team.lead.name} photo={team.lead.photo} label="Lead" />
        {team.coLead ? (
          <LeadPortrait name={team.coLead.name} photo={team.coLead.photo} label="Co-Lead" />
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.85, delay: 0.08, ease }}
      >
        <TeamIcon team={team} />
        <h3 className="mt-8 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] max-md:mt-5 max-md:text-2xl">
          {team.domain}
        </h3>
        <p className="mt-6 font-display text-xl italic leading-relaxed text-muted-foreground sm:text-2xl max-md:mt-3 max-md:text-lg">
          &ldquo;{team.mission}&rdquo;
        </p>
        <p className="mt-10 text-sm leading-relaxed text-muted-foreground/80 max-md:mt-5">{coreTeamPlaceholder}</p>
      </motion.div>
    </div>
  );
}

function RightLayout({ team }: { team: OperationalTeam }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20 max-md:gap-7">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.85, ease }}
        className="lg:text-right max-md:text-center"
      >
        <div className="lg:flex lg:justify-end">
          <TeamIcon team={team} />
        </div>
        <h3 className="mt-8 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] max-md:mt-5 max-md:text-2xl">
          {team.domain}
        </h3>
        <p className="mt-6 font-display text-xl italic leading-relaxed text-muted-foreground sm:text-2xl max-md:mt-3 max-md:text-lg">
          &ldquo;{team.mission}&rdquo;
        </p>
        <p className="mt-10 text-sm leading-relaxed text-muted-foreground/80 max-md:mt-5">{coreTeamPlaceholder}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.85, delay: 0.08, ease }}
        className="flex flex-wrap items-end justify-start gap-8 sm:gap-12 lg:justify-end max-md:justify-center max-md:gap-5"
      >
        <LeadPortrait name={team.lead.name} photo={team.lead.photo} label="Lead" />
        {team.coLead ? (
          <LeadPortrait name={team.coLead.name} photo={team.coLead.photo} label="Co-Lead" />
        ) : null}
      </motion.div>
    </div>
  );
}

function CenterLayout({ team }: { team: OperationalTeam }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease }}
      className="mx-auto max-w-3xl text-center"
    >
      <div className="flex justify-center">
        <TeamIcon team={team} />
      </div>
      <h3 className="mt-8 font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] max-md:mt-5 max-md:text-2xl">
        {team.domain}
      </h3>
      <p className="mt-6 font-display text-xl italic leading-relaxed text-muted-foreground sm:text-2xl max-md:mt-3 max-md:text-lg">
        &ldquo;{team.mission}&rdquo;
      </p>

      <div className="mt-14 flex flex-wrap items-start justify-center gap-10 sm:gap-16 max-md:mt-7 max-md:gap-5">
        <LeadPortrait name={team.lead.name} photo={team.lead.photo} label="Lead" />
        {team.coLead ? (
          <LeadPortrait name={team.coLead.name} photo={team.coLead.photo} label="Co-Lead" />
        ) : null}
      </div>

      <p className="mt-14 text-sm leading-relaxed text-muted-foreground/80 max-md:mt-6">{coreTeamPlaceholder}</p>
    </motion.div>
  );
}

const layoutComponents: Record<SectionLayout, ComponentType<{ team: OperationalTeam }>> = {
  left: LeftLayout,
  right: RightLayout,
  center: CenterLayout,
};

function TeamStory({ team }: { team: OperationalTeam }) {
  const Layout = layoutComponents[team.layout];

  return (
    <section className="relative flex min-h-[85svh] items-center py-24 sm:py-32 max-md:min-h-0 max-md:py-14">
      {/* Accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={cn(
            "absolute top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full blur-[130px]",
            team.layout === "left" && "left-0 -translate-x-1/3",
            team.layout === "right" && "right-0 translate-x-1/3",
            team.layout === "center" && "left-1/2 -translate-x-1/2",
          )}
          style={{ background: team.accent.glow }}
        />
      </div>

      <div className="shell relative w-full">
        <Layout team={team} />
      </div>
    </section>
  );
}

export function OperationalSection() {
  return (
    <div className="relative border-t border-border/40">
      <div className="shell py-20 sm:py-28 max-md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-2xl"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Operational Teams
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Every domain. One mission.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Nine dedicated teams working behind the scenes to make SIH 2026 unforgettable.
          </p>
        </motion.div>
      </div>

      {operationalTeams.map((team) => (
        <TeamStory key={team.id} team={team} />
      ))}
    </div>
  );
}
