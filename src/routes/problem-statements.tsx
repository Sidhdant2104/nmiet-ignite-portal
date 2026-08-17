import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Compass, Sparkles } from "lucide-react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { ProblemStatementExplorer } from "@/components/problem-statement-explorer";

const title = "Problem Statements — NMIET SIH Portal";
const description =
  "Official Smart India Hackathon problem statements will be published here once released.";

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
            Official Problem Statements <span className="text-gradient">Coming Soon</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Official SIH problem statements have not been released yet. Registration is currently
            based on SIH themes, and teams may submit their own proposed problem statement title.
          </p>
        </motion.div>

        <div className="mt-8 flex max-w-2xl items-start gap-3 rounded-3xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p>Once official statements are released, they will appear here with search, filters, and full statement details.</p>
        </div>

        <div className="mt-12">
          <ProblemStatementExplorer />
        </div>
      </div>
    </div>
  );
}
