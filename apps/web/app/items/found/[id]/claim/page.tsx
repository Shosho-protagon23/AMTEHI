import { ClaimPage } from '@/components/claims/ClaimPage';

export const metadata = { title: 'Ajukan Klaim — AMTEHI' };

export default async function FoundItemClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClaimPage type="found" itemId={id} />;
}
