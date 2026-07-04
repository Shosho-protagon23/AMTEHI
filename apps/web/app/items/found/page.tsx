import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { ItemGrid } from '@/components/items/ItemGrid';

export const metadata = { title: 'Barang Temuan — AMTEHI' };

export default function FoundItemsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <header className="mb-6">
          <p className="font-mono text-sm text-secondary">$ ls ./barang-temuan</p>
          <h1 className="mt-2 text-2xl font-bold">Barang Temuan</h1>
          <p className="mt-1 text-muted">
            Daftar barang temuan yang menunggu dikembalikan ke pemiliknya.
          </p>
        </header>
        <ItemGrid type="found" />
      </main>
      <Footer />
    </div>
  );
}
