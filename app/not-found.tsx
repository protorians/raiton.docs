import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site-container relative flex min-h-[64vh] flex-col items-center justify-center py-20 text-center">
      <div className="orb absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 opacity-80" aria-hidden />
      <div className="relative pt-24">
        <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Erreur 404
        </p>
        <h1 className="display-title mt-3 text-4xl sm:text-5xl">
          Cette page n’existe pas.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--muted)]">
          Le lien est peut-être obsolète, ou la page n’existe pas dans cette version de la
          documentation.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/docs" className="btn btn-primary">
            Retour à la documentation
          </Link>
          <Link href="/" className="btn btn-glass">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
