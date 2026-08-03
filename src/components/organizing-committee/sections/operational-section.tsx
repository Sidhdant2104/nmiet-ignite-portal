import { motion } from "framer-motion";
import { Portrait } from "@/components/organizing-committee/portrait";
import { TeamCreditsBlock } from "@/components/organizing-committee/team-credits";
import type { OperationalTeam, TeamPerson } from "@/components/organizing-committee/team-data";
import { operationalTeams } from "@/components/organizing-committee/team-data";

const ease = [0.22, 1, 0.36, 1] as const;

function TeamIcon({ team }: { team: OperationalTeam }) {
  const Icon = team.icon;

  return (
    <span
      className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 shadow-sm backdrop-blur sm:h-16 sm:w-16"
      style={{ background: team.accent.glow, color: team.accent.accent }}
    >
      <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.6} />
    </span>
  );
}

function LeaderCard({ person, label, team }: { person: TeamPerson; label: string; team: OperationalTeam }) {
  return (
    <article className="group relative flex min-w-0 flex-col items-center overflow-hidden rounded-[1.65rem] border border-border/60 bg-background/45 px-5 py-8 text-center shadow-[0_12px_32px_oklch(0.2_0.02_260_/_6%)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lift sm:px-8 sm:py-9">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 top-0 h-px opacity-80"
        style={{ background: team.accent.accent }}
      />
      <motion.div
        className="mx-auto w-fit"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Portrait name={person.name} photo={person.photo} size="xl" glowColor={team.accent.glow} />
      </motion.div>
      <h4 className="mt-6 font-display text-xl font-semibold tracking-tight sm:text-2xl">{person.name}</h4>
      <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em]" style={{ color: team.accent.accent }}>
        {label}
      </p>
      {person.department ? <p className="mt-4 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">{person.department}</p> : null}
      {person.year ? <p className="mt-1 text-sm text-muted-foreground/80">{person.year}</p> : null}
    </article>
  );
}

function OperationalDomainCard({ team }: { team: OperationalTeam }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.42, ease }}
      whileHover={{ y: -4 }}
      className="group relative mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/65 p-1 shadow-soft backdrop-blur-xl transition-[transform,box-shadow] duration-300 hover:shadow-lift sm:rounded-[2.5rem]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ background: `linear-gradient(135deg, ${team.accent.glow}, transparent 42%, ${team.accent.glow})` }}
      />
      <div className="relative rounded-[1.8rem] border border-white/25 bg-background/35 px-5 py-8 sm:rounded-[2.3rem] sm:px-10 sm:py-11">
        <header className="mx-auto flex max-w-xl flex-col items-center text-center">
          <TeamIcon team={team} />
          <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{team.domain}</h3>
          <p className="mt-3 max-w-lg font-display text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
            &ldquo;{team.mission}&rdquo;
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground/85">{team.description}</p>
        </header>

        <div className={`mx-auto mt-8 grid w-full gap-4 ${team.coLead ? "max-w-3xl sm:grid-cols-2" : "max-w-md"}`}>
          <LeaderCard person={team.lead} label="Lead" team={team} />
          {team.coLead ? <LeaderCard person={team.coLead} label="Co-Lead" team={team} /> : null}
        </div>

        <TeamCreditsBlock accentColor={team.accent.accent} className="mx-auto mt-4 max-w-3xl sm:mt-5" />
      </div>
    </motion.article>
  );
}

export function OperationalSection() {
  return (
    <section className="relative border-t border-border/40 py-14 sm:py-20">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.42, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Operational Teams</p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Every domain. One mission.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Nine dedicated teams working behind the scenes to make SIH 2026 unforgettable.
          </p>
        </motion.div>

        <div className="mt-10 space-y-8 sm:mt-14 sm:space-y-10">
          {operationalTeams.map((team) => (
            <OperationalDomainCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </section>
  );
}
