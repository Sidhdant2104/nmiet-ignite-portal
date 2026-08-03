import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { ProblemStatementExplorer } from "@/components/problem-statement-explorer";

const title = "Problem Statements — NMIET SIH Portal";
const description =
  "Search, filter and sort every Smart India Hackathon problem statement by theme, category and organisation.";

export const Route = createFileRoute("/problem-statements")({
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
  component: ProblemStatementsPage,
});

function ProblemStatementsPage() {
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
            Problem <span className="text-gradient">Statements</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every statement is loaded live from the portal API. Filter down to your domain, note the
            PS ID, and use it during registration.
          </p>
        </motion.div>

        <div className="mt-12">
          <ProblemStatementExplorer />
        </div>
      </div>
    </div>
  );
}
