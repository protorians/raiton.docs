import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Atmosphere } from "@/components/atmosphere";
import { Interactions } from "@/components/interactions";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BASE_PATH, SITE } from "@/lib/site";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://raiton.protorians.dev").replace(/\/$/, "");
const metadataBase = new URL(`${siteUrl}${BASE_PATH}`);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Raiton · Le framework backend TypeScript",
    template: "%s · Raiton",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  keywords: [
    "raiton",
    "framework",
    "typescript",
    "bun",
    "node",
    "deno",
    "backend",
    "dependency injection",
    "mcp",
    "openapi",
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.fullName,
    title: "Raiton · Le framework backend TypeScript",
    description: SITE.description,
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raiton · Le framework backend TypeScript",
    description: SITE.description,
    images: ["/brand/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fc" },
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
  ],
};

const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem('raiton-theme');
      var dark = stored ? stored === 'dark' : true;
      document.documentElement.classList.toggle('dark', dark);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <Atmosphere />
        <Interactions />
        <a
          href="#content"
          className="sr-only z-[300] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-[13px] focus:font-semibold focus:text-[var(--accent-ink)]"
        >
          Aller au contenu
        </a>
        <SiteHeader />
        <div id="content" className="relative z-[1]">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
