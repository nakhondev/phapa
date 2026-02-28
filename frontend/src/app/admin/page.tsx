import { AdminRouter } from "@/components/AdminRouter";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const params = await searchParams;
  return <AdminRouter eventId={params.event || null} />;
}
