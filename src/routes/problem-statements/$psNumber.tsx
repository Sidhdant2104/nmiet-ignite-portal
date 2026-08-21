import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Layers,
  Lightbulb,
  Palette,
  Play,
  Send,
  Database,
  Mail,
  Loader2,
} from "lucide-react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { problemDetailQuery } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const Route = createFileRoute("/problem-statements/$psNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.psNumber} — NMIET SIH Portal` },
      {
        name: "description",
        content: `View complete details for SIH problem statement ${params.psNumber}.`,
      },
      { property: "og:title", content: `${params.psNumber} — NMIET SIH Portal` },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ProblemDetailPage,
});

function ProblemDetailPage() {
  const { psNumber } = Route.useParams();
  const navigate = useNavigate();
  const { data: problem, isLoading, isError } = useQuery(problemDetailQuery(psNumber));

  if (isLoading) {
    return (
      <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
        <AmbientBackdrop variant="soft" className="-z-10" />
        <div className="shell">
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Loading problem statement…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
        <AmbientBackdrop variant="soft" className="-z-10" />
        <div className="shell">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-4xl border border-dashed border-border bg-card/60 px-8 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-muted-foreground">
              <FileText className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-xl font-semibold">
              Problem statement not found
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We couldn't find <span className="font-mono font-semibold">{psNumber}</span>.
              It may have been removed or the PS number is incorrect.
            </p>
            <Link
              to="/problem-statements"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all problems
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
      <AmbientBackdrop variant="soft" className="-z-10" />
      <div className="shell">
        {/* Breadcrumb / Back */}
        <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
          <Link
            to="/problem-statements"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            All Problem Statements
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-8 max-w-4xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-bold text-primary">
              {problem.ps_number}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
              {problem.category}
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.5rem]">
            {problem.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-primary" />
              {problem.organization}
            </span>
            {problem.department && (
              <span className="inline-flex items-center gap-2">
                <Layers className="h-4 w-4 shrink-0 text-primary" />
                {problem.department}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Palette className="h-4 w-4 shrink-0 text-primary" />
              {problem.theme}
            </span>
            {problem.deadline && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-primary" />
                {new Date(problem.deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="inline-flex items-center gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 text-primary" />
              {problem.submitted_ideas} submitted{" "}
              {problem.submitted_ideas === 1 ? "idea" : "ideas"}
            </span>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Description */}
            {problem.description && (
              <motion.section
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
              >
                <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  Problem Description
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {problem.description}
                </div>
              </motion.section>
            )}

            {/* Expected Solution */}
            {problem.expected_solution && (
              <motion.section
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
              >
                <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-green/10 text-brand-green">
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  Expected Solution
                </h2>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {problem.expected_solution}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Register CTA Card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-6 shadow-soft"
            >
              <h3 className="font-display text-lg font-semibold">
                Interested in this problem?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Register your team of 6 members to work on this problem statement
                during Smart India Hackathon 2026.
              </p>
              <button
                onClick={() =>
                  navigate({
                    to: "/register",
                    search: { ps: problem.ps_number },
                  })
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                <Send className="h-4 w-4" />
                Register Team
              </button>
            </motion.div>

            {/* Resource Links */}
            {(problem.youtube_link || problem.dataset_link || problem.contact_info) && (
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <h3 className="font-display text-base font-semibold">Resources</h3>
                <div className="mt-4 space-y-3">
                  {problem.youtube_link && (
                    <a
                      href={problem.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-500/10 text-red-500">
                        <Play className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">YouTube Link</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {problem.youtube_link}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </a>
                  )}

                  {problem.dataset_link && (
                    <a
                      href={problem.dataset_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-blue/10 text-brand-blue">
                        <Database className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Dataset</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {problem.dataset_link}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                    </a>
                  )}

                  {problem.contact_info && (
                    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-green/10 text-brand-green">
                        <Mail className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Contact</p>
                        <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                          {problem.contact_info}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick Info Card */}
            <motion.div
              {...fadeUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <h3 className="font-display text-base font-semibold">Quick Info</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">PS Number</dt>
                  <dd className="font-mono font-semibold">{problem.ps_number}</dd>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{problem.category}</dd>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Theme</dt>
                  <dd className="text-right font-medium max-w-[60%]">{problem.theme}</dd>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd className="text-right font-medium max-w-[60%] truncate">{problem.organization}</dd>
                </div>
              </dl>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
