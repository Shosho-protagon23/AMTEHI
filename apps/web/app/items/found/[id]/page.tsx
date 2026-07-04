import { ItemDetail } from '@/components/items/ItemDetail';

export const metadata = { title: 'Detail Barang Temuan — AMTEHI' };

export default async function FoundItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetail type="found" id={id} />;
}
