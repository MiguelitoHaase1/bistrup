import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-b border-border-light bg-white/80 backdrop-blur-sm sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/oversigt" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-coral flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <h1 className="heading text-lg font-bold leading-tight text-text-primary">
                Bistrup Byggeprojekt
              </h1>
              <p className="text-xs text-text-muted">Bistrupgårdsvej 1</p>
            </div>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
