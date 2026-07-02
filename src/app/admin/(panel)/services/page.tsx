import { requireUser } from "@/app/admin/actions";
import { getAllServices } from "@/db/queries";
import { ServicesCrud } from "@/components/admin/ServicesCrud";
import { canEditContent } from "@/lib/roles";

export const revalidate = 0; // Don't cache admin page fetches

export default async function AdminServicesPage() {
  const user = await requireUser();
  const canEdit = canEditContent(user.role);
  
  // Retrieve all registered services from database
  const services = await getAllServices();

  return <ServicesCrud services={services} canEdit={canEdit} />;
}
