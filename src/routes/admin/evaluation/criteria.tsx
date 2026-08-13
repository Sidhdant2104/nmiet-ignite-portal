import { createFileRoute } from "@tanstack/react-router";
import { Criteria } from "@/components/evaluation-admin";

export const Route = createFileRoute("/admin/evaluation/criteria")({
  component: Criteria,
});
