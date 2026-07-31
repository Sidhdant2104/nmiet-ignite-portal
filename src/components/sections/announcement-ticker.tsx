import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { announcementsQuery } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

export function AnnouncementTicker() {
  const { data, isLoading } = useQuery(announcementsQuery);

  if (isLoading) {
    return (
      <div className="glass flex items-center gap-4 rounded-2xl px-5 py-3.5">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!data?.length) return null;

  const items = [...data, ...data];

  return (
    <div className="glass relative flex items-center gap-4 overflow-hidden rounded-2xl px-5 py-3.5">
      <span className="flex shrink-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        <Megaphone className="h-4 w-4" aria-hidden /> Latest
      </span>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <ul className="animate-marquee flex w-max items-center gap-10" aria-live="polite">
          {items.map((a, i) => (
            <li key={`${a.id}-${i}`} className="flex items-center gap-2 whitespace-nowrap text-sm">
              <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground">
                {a.tag}
              </span>
              <span className="text-muted-foreground">{a.title}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
