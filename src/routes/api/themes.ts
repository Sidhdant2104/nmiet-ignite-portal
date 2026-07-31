import { createFileRoute } from "@tanstack/react-router";
import { themes } from "@/lib/sih-data";

const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/themes")({
  server: {
    handlers: {
      GET: async () => json({ themes }),
    },
  },
});
