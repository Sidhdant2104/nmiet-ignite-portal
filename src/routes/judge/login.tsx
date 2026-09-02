import { createFileRoute } from "@tanstack/react-router";
import { JudgeLoginPage } from "@/components/judge-panel";

export const Route = createFileRoute("/judge/login")({
  component: JudgeLoginPage,
});
