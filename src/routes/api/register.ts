import { createFileRoute } from "@tanstack/react-router";

/**
 * Frontend-only placeholder. Nothing is persisted — it echoes a mock
 * reference number so the registration flow can be demoed end to end.
 */
export const Route = createFileRoute("/api/register")({
  server: {
    handlers: {
      POST: async () => {
        const reference = `NMIET-SIH26-${Math.floor(1000 + Math.random() * 8999)}`;
        return new Response(
          JSON.stringify({
            ok: true,
            persisted: false,
            reference,
            receivedAt: new Date().toISOString(),
          }),
          { headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
