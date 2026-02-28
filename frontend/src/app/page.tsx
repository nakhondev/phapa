import { PageRouter } from "@/components/PageRouter";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const params = await searchParams;
  return <PageRouter eventId={params.event || null} />;
}
