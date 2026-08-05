import { createFileRoute } from "@tanstack/react-router";
import { AdminPage, PptReviewDetails } from "@/components/admin-panel";
export const Route = createFileRoute("/admin/ppt/$id")({component:()=>{const {id}=Route.useParams();return <AdminPage page="ppt"><PptReviewDetails id={id}/></AdminPage>}});
