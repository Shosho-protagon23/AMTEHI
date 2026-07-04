import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

/** Landing page AMTEHI dengan nuansa terminal. */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="card-surface mx-auto max-w-3xl">
            {/* Title bar terminal */}
            <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
              <span className="h-3 w-3 rounded-full bg-danger" />
              <span className="h-3 w-3 rounded-full bg-accent" />
              <span className="h-3 w-3 rounded-full bg-success" />
              <span className="ml-2 font-mono text-xs text-muted">
                amtehi@amikom: ~
              </span>
            </div>

            <p className="font-mono text-sm text-success">
              $ ./amtehi --temukan-barangmu
            </p>
            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
              <span className="text-primary">Amikom</span>{' '}
              <span className="text-secondary">Temu</span>{' '}
              <span className="text-accent">Hilang</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted">
              Platform lost &amp; found digital khusus lingkungan kampus Amikom.
              Laporkan barang hilang, umumkan barang temuan, dan klaim dengan
              verifikasi yang aman.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/items/lost" className="btn-primary">
                Lihat Barang Hilang
              </Link>
              <Link href="/items/found" className="btn-ghost">
                Lihat Barang Temuan
              </Link>
            </div>
          </div>
        </section>

        {/* Fitur */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                cmd: 'lapor',
                title: 'Lapor Cepat',
                desc: 'Laporkan barang hilang atau temuan lengkap dengan foto dan lokasi.',
              },
              {
                cmd: 'klaim',
                title: 'Klaim Aman',
                desc: 'Ajukan klaim dengan bukti kepemilikan, diverifikasi admin kampus.',
              },
              {
                cmd: 'cari',
                title: 'Pencarian Pintar',
                desc: 'Filter berdasarkan kategori, status, lokasi, dan kata kunci.',
              },
            ].map((f) => (
              <div key={f.cmd} className="card-surface">
                <p className="font-mono text-sm text-primary">
                  $ amtehi {f.cmd}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
