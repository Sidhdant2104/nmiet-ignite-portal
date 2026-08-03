import type { OperationalTeam } from "@/components/organizing-committee/team-data";

export function MetaStrip({ team }: { team: OperationalTeam }) {
  const teamSize = 1 + (team.coLead ? 1 : 0);

  const items = [
    { label: "Mission", value: team.mission },
    { label: "Impact", value: team.description },
    { label: "Team Size", value: `${teamSize} lead${teamSize > 1 ? "s" : ""}` },
    { label: "Open Positions", value: "Recruiting" },
  ];

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
        style={{ background: team.accent.glow, color: team.accent.accent }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ background: team.accent.accent }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ background: team.accent.accent }}
          />
        </span>
        Currently Recruiting
      </span>

      {items.map((item) => (
        <span
          key={item.label}
          className="rounded-full border border-border/60 bg-card/50 px-3 py-1 text-[0.65rem] font-medium text-muted-foreground backdrop-blur"
        >
          <span className="text-foreground/70">{item.label}:</span> {item.value}
        </span>
      ))}
    </div>
  );
}
