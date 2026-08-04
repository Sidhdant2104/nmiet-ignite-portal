import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/admin-panel";
export const Route = createFileRoute("/admin/email")({ component: () => <AdminPage page="email" /> });
