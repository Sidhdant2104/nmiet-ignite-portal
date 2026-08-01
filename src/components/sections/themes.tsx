import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { themesQuery } from "@/lib/api";
import { getThemeIcon } from "@/lib/theme-icons";

export function ThemesSection() {
  const { data, isLoading, isError } = useQuery(themesQuery);

  return (
    <section id="themes" className="section-pad relative">
      <div className="shell">
        <SectionHeading
          eyebrow="Themes"
          title={
            <>
              Eighteen themes. <span className="text-gradient">Pick your battlefield.</span>
            </>
          }
          description="Themes group the problem statements released by ministries and industry partners. Start from the domain your team already loves."
        />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-border bg-card p-6">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <Skeleton className="mt-5 h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))
            : null}

          {isError ? (
            <p className="text-sm text-muted-foreground">
              Themes could not be loaded right now. Please refresh in a moment.
            </p>
          ) : null}

          {data?.map((theme, i) => {
            const Icon = getThemeIcon(theme.icon);
            return (
              <motion.a
                key={theme.id}
                href="/problem-statements"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-colors hover:border-primary/40"
              >
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-brand-blue transition-colors duration-500 group-hover:bg-primary-soft group-hover:text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 -translate-y-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold">{theme.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{theme.blurb}</p>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  Explore statements
                </p>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
