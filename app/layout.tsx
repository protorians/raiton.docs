import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Atmosphere } from "@/components/atmosphere";
import { Interactions } from "@/components/interactions";
import { LocaleRuntime } from "@/components/locale-runtime";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SplashScreen } from "@/components/splash-screen";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { BASE_PATH, SITE, getSiteCopy } from "@/lib/site";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://raiton.protorians.dev").replace(/\/$/, "");
const metadataBase = new URL(`${siteUrl}${BASE_PATH}`);
const copy = getSiteCopy(DEFAULT_LOCALE);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Raiton · Le framework backend TypeScript",
    template: "%s · Raiton",
  },
  description: copy.description,
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
    description: copy.description,
    images: [{ url: "/brand/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raiton · Le framework backend TypeScript",
    description: copy.description,
    images: ["/brand/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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

/**
 * First-visit language detection. Runs before paint:
 * - an explicit /en path pins English;
 * - an explicit French choice is always respected;
 * - otherwise English browsers are redirected to /en.
 */
const localeScript = `
  (function () {
    try {
      var base = ${JSON.stringify(BASE_PATH)};
      var path = location.pathname || '/';
      var rest = path.indexOf(base) === 0 ? path.slice(base.length) : path;
      var isEnglishPath = rest === '/en' || rest.indexOf('/en/') === 0;
      document.documentElement.lang = isEnglishPath ? 'en' : 'fr';

      if (isEnglishPath) {
        try { localStorage.setItem('raiton-locale', 'en'); } catch (e) {}
        return;
      }

      var stored = null;
      try { stored = localStorage.getItem('raiton-locale'); } catch (e) {}
      if (stored === 'fr') return;

      var languages = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ''];
      var wantsEnglish = stored === 'en';

      if (!wantsEnglish) {
        for (var i = 0; i < languages.length; i += 1) {
          if (/^en([-_]|$)/i.test(languages[i])) { wantsEnglish = true; break; }
        }
      }

      if (!wantsEnglish) return;

      var suffix = rest === '/' || rest === '' ? '/' : rest;
      var target = base + '/en' + suffix;
      if (!/\/$/.test(target) && !/\.[a-z0-9]+$/i.test(target)) {
        target += '/';
      }
      if (location.pathname !== target) {
        location.replace(target + location.search + location.hash);
      }
    } catch (e) {}
  })();
`;

/**
 * Resolve the splash before the first paint so a returning visitor never sees
 * a flash of the overlay. `?splash=1` replays it for previews.
 */
const splashScript = `
  (function () {
    try {
      var force = /[?&]splash=1(&|$)/.test(location.search);
      var seen = sessionStorage.getItem('raiton-splash') === 'seen';
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.documentElement.dataset.splash = force || !(seen || calm) ? 'on' : 'off';
    } catch (e) {
      document.documentElement.dataset.splash = 'on';
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}.splash{display:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-screen">
        <SplashScreen />
        <Atmosphere />
        <Interactions />
        <LocaleRuntime />
        <SiteHeader />
        <div id="content" className="relative z-[1]">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
