import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Filter, Inbox, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { problemStatementsQuery, themesQuery } from "@/lib/api";
import type { ProblemStatement } from "@/lib/sih-data";

const difficultyTone: Record<ProblemStatement["difficulty"], string> = {
  Beginner: "bg-brand-green/15 text-brand-green",
  Intermediate: "bg-primary-soft text-primary",
  Advanced: "bg-brand-blue/15 text-brand-blue",
};

export function ProblemStatementsSection() {
  const { data, isLoading, isError } = useQuery(problemStatementsQuery);
  const { data: themes } = useQuery(themesQuery);

  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("id-asc");

  const filtered = useMemo(() => {
    let list = data ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.organization, p.psId, p.theme, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (theme !== "all") list = list.filter((p) => p.theme === theme);
    if (category !== "all") list = list.filter((p) => p.category === category);

    const rank = { Beginner: 0, Intermediate: 1, Advanced: 2 } as const;
    return [...list].sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "difficulty-asc":
          return rank[a.difficulty] - rank[b.difficulty];
        case "difficulty-desc":
          return rank[b.difficulty] - rank[a.difficulty];
        default:
          return a.psId.localeCompare(b.psId);
      }
    });
  }, [data, query, theme, category, sort]);

  const hasFilters = query !== "" || theme !== "all" || category !== "all";
  const reset = () => {
    setQuery("");
    setTheme("all");
    setCategory("all");
  };

  return (
    <section id="problem-statements" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          eyebrow="Problem statements"
          title={
            <>
              Search, filter and <span className="text-gradient">shortlist</span>
            </>
          }
          description="Statements are loaded live from the portal API. Filter by theme and category, then note the PS ID — you'll need it during registration."
        />

        <div className="glass sticky top-20 z-30 mt-12 rounded-3xl p-3 shadow-soft sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative min-w-0">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, organisation, PS ID or tag"
                aria-label="Search problem statements"
                className="h-11 rounded-2xl border-border bg-card/70 pl-10"
              />
            </div>

            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger
                aria-label="Filter by theme"
                className="h-11 min-w-0 rounded-2xl border-border bg-card/70"
              >
                <Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">All themes</SelectItem>
                {(themes ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                aria-label="Filter by category"
                className="h-11 min-w-0 rounded-2xl border-border bg-card/70"
              >
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Hardware">Hardware</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger
                aria-label="Sort problem statements"
                className="h-11 min-w-0 rounded-2xl border-border bg-card/70"
              >
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id-asc">PS ID (ascending)</SelectItem>
                <SelectItem value="title-asc">Title (A–Z)</SelectItem>
                <SelectItem value="difficulty-asc">Easiest first</SelectItem>
                <SelectItem value="difficulty-desc">Hardest first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters ? (
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {filtered.length} of {data?.length ?? 0} statements
              </p>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:bg-accent"
              >
                <X className="h-3 w-3" aria-hidden /> Clear filters
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-8">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-6 w-full" />
                  <Skeleton className="mt-2 h-6 w-3/4" />
                  <Skeleton className="mt-5 h-4 w-40" />
                  <div className="mt-5 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Couldn't load problem statements"
              body="The portal API didn't respond. Refresh the page to try again."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No statements match your filters"
              body="Try a broader search term, or clear the theme and category filters."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((ps, i) => (
                  <motion.article
                    key={ps.id}
                    layout
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.04 }}
                    whileHover={{ y: -4 }}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[0.68rem] font-semibold text-accent-foreground">
                        {ps.psId}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${difficultyTone[ps.difficulty]}`}
                      >
                        {ps.difficulty}
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-1 text-[0.68rem] font-semibold text-muted-foreground">
                        {ps.category}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold leading-snug">
                      {ps.title}
                    </h3>
                    <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="min-w-0 truncate">{ps.organization}</span>
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-primary">{ps.theme}</p>
                    <div className="mt-5 flex flex-wrap gap-2 pt-1">
                      {ps.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full bg-secondary font-normal text-secondary-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-md flex-col items-center rounded-4xl border border-dashed border-border bg-card/60 px-8 py-16 text-center"
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-muted-foreground">
        <Inbox className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </motion.div>
  );
}
