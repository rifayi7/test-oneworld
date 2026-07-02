import { getCurrentUser } from "@/app/admin/actions";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Panel - Clean World Solutions",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Route protection gate
  if (!user) {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
