import { Github, Heart } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LATEST_VERSION } from "@/lib/versions";
import { SITE } from "@/lib/site";

const v = LATEST_VERSION.id;

const columns = [
  {
    title: "Documentation",
    links: [
      { href: "/docs", label: "Vue d’ensemble" },
      { href: `/docs/${v}/quickstart`, label: "Démarrage rapide" },
      { href: `/docs/${v}/contracts`, label: "Contrats" },
      { href: `/docs/${v}/mcp`, label: "MCP" },
      { href: `/docs/${v}/cli`, label: "CLI" },
    ],
  },
  {
    title: "Référence",
    links: [
      { href: `/docs/${v}/decorators`, label: "Décorateurs" },
      { href: `/docs/${v}/core-api`, label: "API core" },
      { href: `/docs/${v}/configuration`, label: "Configuration" },
      { href: `/docs/${v}/types`, label: "Types" },
      { href: `/docs/${v}/errors`, label: "Erreurs" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { href: `/docs/${v}/releases`, label: `Notes ${LATEST_VERSION.label}` },
      { href: `/docs/${v}/versioning`, label: "Politique de versions" },
      { href: `/docs/${v}/deployment`, label: "Déploiement" },
      { href: `/docs/${v}/testing`, label: "Tests" },
      { href: `/docs/${v}/contributing`, label: "Contribuer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer relative mt-6 border-t border-[var(--border)]">
      <div className="site-container pb-10 pt-12">
        <p
          aria-hidden
          className="wordmark-outline pointer-events-none -mb-3 select-none overflow-hidden text-[clamp(4rem,15vw,12rem)] font-bold leading-[0.78]"
        >
          raiton
        </p>

        <div className="relative grid gap-10 border-t border-[var(--border)] pt-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href="/" aria-label="Raiton, accueil">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
              {SITE.tagline} Optimisé pour Bun, compatible Node.js et Deno.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SITE.github}
                target="_blank"
                rel="noreferrer"
                className="chip transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <a
                href={SITE.npm}
                target="_blank"
                rel="noreferrer"
                className="chip font-mono transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
              >
                npm
              </a>
              <span className="chip font-mono">{LATEST_VERSION.tag}</span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--faint)]">
                {column.title}
              </p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--accent-strong)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] pt-6 text-[12px] text-[var(--faint)] sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {SITE.fullName}. Licence {SITE.license}.
          </p>
          <p className="flex items-center gap-1.5">
            Conçu avec <Heart className="h-3.5 w-3.5 text-[var(--rose)]" /> par {SITE.author}
          </p>
        </div>
      </div>
    </footer>
  );
}
