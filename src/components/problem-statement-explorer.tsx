import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  Lightbulb,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { problemStatementsQuery, themesQuery, type ProblemStatement } from "@/lib/api";

const PAGE_SIZE = 9;
const DESCRIPTION_MAX_LENGTH = 160;

function truncateDescription(text: string, maxLength = DESCRIPTION_MAX_LENGTH): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return deadline;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProblemStatementExplorer() {
  const { data, isLoading, isError } = useQuery(problemStatementsQuery);
  const { data: themes } = useQuery(themesQuery);

  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [category, setCategory] = useState("all");
  const [organization, setOrganization] = useState("all");
  const [sort, setSort] = useState("id-asc");
  const [page, setPage] = useState(1);

  const organizations = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.organization))).sort(),
    [data],
  );

  const categories = useMemo(
    () => Array.from(new Set((data ?? []).map((p) => p.category))).sort(),
    [data],
  );

  const filtered = useMemo(() => {
    let list = data ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.ps_number, p.organization].join(" ").toLowerCase().includes(q),
      );
    }
    if (theme !== "all") list = list.filter((p) => p.theme === theme);
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (organization !== "all") list = list.filter((p) => p.organization === organization);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "org-asc":
          return a.organization.localeCompare(b.organization);
        default:
          return a.ps_number.localeCompare(b.ps_number);
      }
    });
  }, [data, query, theme, category, organization, sort]);

  useEffect(() => {
    setPage(1);
  }, [query, theme, category, organization, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters =
    query !== "" || theme !== "all" || category !== "all" || organization !== "all";

  const reset = () => {
    setQuery("");
    setTheme("all");
    setCategory("all");
    setOrganization("all");
  };

  const isEmpty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <div>
      <div className="glass sticky top-20 z-30 rounded-4xl p-4 shadow-lift sm:p-5">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, PS number or organisation"
            aria-label="Search problem statements"
            className="h-14 rounded-3xl border-border bg-card/70 pl-12 text-base"
          />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            value={theme}
            onChange={setTheme}
            label="Theme"
            icon={<Filter className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
            options={(themes ?? []).map((t) => t.name)}
            allLabel="All themes"
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            label="Category"
            icon={
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            }
            options={categories}
            allLabel="All categories"
          />
          <FilterSelect
            value={organization}
            onChange={setOrganization}
            label="Organisation"
            icon={<Building2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
            options={organizations}
            allLabel="All organisations"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              aria-label="Sort problem statements"
              className="h-12 min-w-0 rounded-2xl border-border bg-card/70"
            >
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id-asc">PS number (ascending)</SelectItem>
              <SelectItem value="title-asc">Title (A–Z)</SelectItem>
              <SelectItem value="org-asc">Organisation (A–Z)</SelectItem>
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

      <div className="mt-10">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border bg-card p-6">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-6 w-full" />
                <Skeleton className="mt-2 h-6 w-3/4" />
                <Skeleton className="mt-5 h-4 w-40" />
                <Skeleton className="mt-3 h-16 w-full" />
                <div className="mt-5 flex gap-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            title="Couldn't load problem statements"
            body="The portal API didn't respond. Refresh the page to try again."
          />
        ) : isEmpty ? (
          <EmptyState title="No problem statements available." />
        ) : filtered.length === 0 ? (
          <EmptyState title="No problem statements match your filters." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {current.map((ps, i) => (
                  <ProblemCard key={ps.ps_number} ps={ps} index={i} />
                ))}
              </AnimatePresence>
            </div>

            {pageCount > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-12 flex items-center justify-center gap-2"
              >
                <PageButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </PageButton>
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPage(i + 1)}
                    aria-current={page === i + 1 ? "page" : undefined}
                    className={`h-10 min-w-10 rounded-2xl border px-3 text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:bg-accent"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <PageButton
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  label="Next page"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </PageButton>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function ProblemCard({ ps, index }: { ps: ProblemStatement; index: number }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[0.68rem] font-semibold text-accent-foreground">
          {ps.ps_number}
        </span>
        <span className="rounded-full border border-border px-2.5 py-1 text-[0.68rem] font-semibold text-muted-foreground">
          {ps.category}
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold leading-snug">{ps.title}</h3>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4 shrink-0" aria-hidden />
        <span className="min-w-0 truncate">{ps.organization}</span>
      </p>
      {ps.department ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{ps.department}</p>
      ) : null}
      <p className="mt-1.5 text-xs font-medium text-primary">{ps.theme}</p>
      {ps.description ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {truncateDescription(ps.description)}
        </p>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {ps.submitted_ideas} submitted {ps.submitted_ideas === 1 ? "idea" : "ideas"}
        </span>
        {ps.deadline ? (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {formatDeadline(ps.deadline)}
          </span>
        ) : null}
      </div>
    </motion.article>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  icon,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  icon: React.ReactNode;
  options: string[];
  allLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={`Filter by ${label.toLowerCase()}`}
        className="h-12 min-w-0 rounded-2xl border-border bg-card/70"
      >
        {icon}
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-card transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function EmptyState({ title, body }: { title: string; body?: string }) {
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
      {body ? <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p> : null}
    </motion.div>
  );
}
