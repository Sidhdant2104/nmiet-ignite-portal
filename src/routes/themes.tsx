import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { Skeleton } from "@/components/ui/skeleton";
import { themesQuery } from "@/lib/api";

const title = "SIH Themes — NMIET SIH Portal";
const description = "Explore every Smart India Hackathon theme, directly from the official SIH source.";

export const Route = createFileRoute("/themes")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ThemesPage,
});

function ThemesPage() {
  const { data, isLoading, isError } = useQuery(themesQuery);
  const themes = data ?? [];

  return (
    <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
      <AmbientBackdrop variant="soft" className="-z-10" />
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Compass className="h-3.5 w-3.5 text-primary" aria-hidden /> Smart India Hackathon 2026
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl">
            SIH <span className="text-gradient">Themes</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Explore the official SIH themes and find the domain that best fits your team&apos;s idea.
          </p>
        </motion.div>

        <div className="mt-12">
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-border bg-card p-6">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <Skeleton className="mt-5 h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="text-sm text-muted-foreground">
              Themes could not be loaded right now. Please refresh in a moment.
            </p>
          ) : null}

          {!isLoading && !isError && themes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No themes are available right now.</p>
          ) : null}

          {!isLoading && !isError && themes.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to="/problem-statements"
                    className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
                  >
                    <div
                      aria-hidden
                      className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />
                    {theme.icon ? (
                      <img
                        src={theme.icon}
                        alt={theme.name}
                        loading="lazy"
                        className="relative h-16 w-16 object-contain"
                      />
                    ) : null}
                    <h2 className="relative mt-5 font-display text-base font-semibold">{theme.name}</h2>
                    <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {theme.description}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
