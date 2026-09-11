import { createFileRoute } from "@tanstack/react-router";
import { TrackLeaderboard } from "@/components/evaluation-results";

export const Route = createFileRoute("/admin/evaluation/leaderboard/$trackId")({
  component: TrackLeaderboardPage,
});

function TrackLeaderboardPage() {
  const { trackId } = Route.useParams();
  return <TrackLeaderboard trackId={trackId} />;
}
