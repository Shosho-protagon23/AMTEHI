import { ClaimPage } from '@/components/claims/ClaimPage';

export const metadata = { title: 'Ajukan Klaim — AMTEHI' };

export default async function LostItemClaimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ClaimPage type="lost" itemId={id} />;
}
