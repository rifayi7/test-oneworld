import { requireAdmin, getCurrentUser } from "@/app/admin/actions";
import { listAllUsers } from "@/lib/users";
import { UserCrud } from "@/components/admin/UserCrud";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  
  // Guard route for Administrators only
  if (!currentUser) {
    redirect("/admin/login");
  }

  // Double check admin role access bounds
  await requireAdmin();

  // Retrieve all registered staff member accounts
  const users = await listAllUsers();

  return <UserCrud users={users} currentUser={currentUser} />;
}
