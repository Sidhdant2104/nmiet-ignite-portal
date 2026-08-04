import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, RegistrationDetails } from "@/components/admin-panel";

export const Route = createFileRoute("/admin/registrations/$id")({
  component: () => {
    const { id } = Route.useParams();
    return <AdminPage page="registrations"><RegistrationDetails id={id} /></AdminPage>;
  },
});
