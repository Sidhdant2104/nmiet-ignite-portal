import { Outlet, createFileRoute, useChildMatches } from "@tanstack/react-router";
import { Leaderboard } from "@/components/evaluation-results";

export const Route = createFileRoute("/admin/evaluation/leaderboard")({
  component: LeaderboardLayout,
});

function LeaderboardLayout() {
  const childMatches = useChildMatches();
  if (childMatches.length) return <Outlet />;
  return <Leaderboard />;
}
