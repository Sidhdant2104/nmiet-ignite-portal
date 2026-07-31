import { createFileRoute } from "@tanstack/react-router";
import { announcements } from "@/lib/sih-data";

const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/announcements")({
  server: {
    handlers: {
      GET: async () => json({ announcements }),
    },
  },
});
