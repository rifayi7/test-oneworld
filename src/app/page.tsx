import { SiteShell } from "@/components/SiteShell";
import { getAllServices, getApprovedFeedbacks } from "@/db/queries";

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function Home() {
  // Query both services catalog and approved customer reviews
  const [services, feedbacks] = await Promise.all([
    getAllServices(),
    getApprovedFeedbacks(),
  ]);

  return <SiteShell initialServices={services} initialFeedbacks={feedbacks} />;
}
