import { createFileRoute } from "@tanstack/react-router";
import { Tracks } from "@/components/evaluation-admin";

export const Route = createFileRoute("/admin/evaluation/tracks")({
  component: Tracks,
});
