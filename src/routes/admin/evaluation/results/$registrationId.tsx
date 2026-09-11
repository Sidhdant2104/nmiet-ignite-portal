import { createFileRoute } from "@tanstack/react-router";
import { TeamEvaluationResult } from "@/components/evaluation-results";

export const Route = createFileRoute("/admin/evaluation/results/$registrationId")({
  component: TeamResultPage,
});

function TeamResultPage() {
  const { registrationId } = Route.useParams();
  return <TeamEvaluationResult registrationId={registrationId} />;
}
