import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminEditor } from "../../components/admin-editor";
import { isAuthenticated } from "../../lib/auth";
import { getLinks, getProfile } from "../../lib/db";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const token = cookies().get("admin_session")?.value;
  if (!isAuthenticated(token)) {
    redirect("/admin/login");
  }

  const profile = getProfile();
  const links = getLinks();

  return <AdminEditor initialProfile={profile} initialLinks={links} />;
}
