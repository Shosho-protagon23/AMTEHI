import { ItemDetail } from '@/components/items/ItemDetail';

export const metadata = { title: 'Detail Barang Hilang — AMTEHI' };

export default async function LostItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemDetail type="lost" id={id} />;
}
