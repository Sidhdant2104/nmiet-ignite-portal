import { createFileRoute } from "@tanstack/react-router";
import { JudgeEvaluation } from "@/components/evaluation-portals";

export const Route = createFileRoute("/judge/evaluation")({
  component: JudgeEvaluation,
});
