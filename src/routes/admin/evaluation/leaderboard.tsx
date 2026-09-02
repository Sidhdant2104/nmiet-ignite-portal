import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/evaluation-admin";

export const Route = createFileRoute("/admin/evaluation/leaderboard")({
  component: Leaderboard,
});
