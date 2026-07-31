import { createFileRoute } from "@tanstack/react-router";
import { problemStatements } from "@/lib/sih-data";

const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/problem-statements")({
  server: {
    handlers: {
      GET: async () => json({ problemStatements, total: problemStatements.length }),
    },
  },
});
