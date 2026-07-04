/**
 * Footer wajib AMTEHI — copyright branding di semua halaman.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row">
        <p className="font-mono">
          <span className="text-primary">©</span> {year}{' '}
          <span className="text-text">Faga</span> |{' '}
          <span className="text-secondary">echofaga</span> · AMTEHI
        </p>
        <p className="text-xs">Amikom Temu Hilang — Lost &amp; Found Kampus</p>
      </div>
    </footer>
  );
}
