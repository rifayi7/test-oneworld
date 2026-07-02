import { SiteShell } from "@/components/SiteShell";
import { getAllServices } from "@/db/queries";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function Home() {
  const services = await getAllServices();
  return <SiteShell initialServices={services} />;
}
