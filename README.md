# Raiton — documentation

Site de présentation et documentation du framework **Raiton**, publié sur GitHub
Pages.

- Framework : [protorians/raiton](https://github.com/protorians/raiton)
- Next.js 15 (App Router, export statique)
- Tailwind CSS
- Contenu Markdown versionné dans `content/`
- Recherche locale (`⌘K`), thème clair/sombre, TOC, navigation par version

## Développement

```bash
npm install
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # génère ./out
npx serve out   # prévisualiser l'export statique
```

## Organisation du contenu

Chaque page est un fichier Markdown dans `content/` :

```yaml
---
title: "Démarrage rapide"
description: "Créer un projet et lancer le serveur."
section: demarrage
order: 3
since: "6.0"
---
```

- `section` : `demarrage`, `concepts`, `fonctionnalites`, `cli`, `reference`,
  `guides` ou `versions`.
- `order` : position dans la section.
- `since` : version minimale qui affiche la page. Une page `since: "6.9"` est
  masquée dans les archives 6.8 et antérieures.
- `draft` : masque la page.

Les liens internes s'écrivent `/docs/<slug>`. Le rendu ajoute
automatiquement la version courante et le `basePath` GitHub Pages.

Les pages spécifiques à une version (notes de release) peuvent remplacer le
contenu partagé via `content/versions/<version>/<slug>.md`.

## Versions

Les versions sont déclarées dans `lib/versions.ts` :

```ts
export const VERSIONS = [
  { id: "6.10", label: "v6.10", status: "latest", ... },
  { id: "6.9", label: "v6.9", status: "archived", ... },
]
```

Le sélecteur de version navigue vers `/docs/<version>`. La version `latest`
est mise en avant, les autres affichent un bandeau d'archive.

## Internationalisation

Le site est disponible en français (langue par défaut, sans préfixe) et en
anglais sous `/en`.

- Les textes d'interface, les métadonnées et les notes de version sont définis
  dans `lib/i18n.ts` et `lib/versions.ts`.
- Le contenu anglais vit dans `content/en/` (même arborescence, mêmes noms de
  fichiers que `content/`). Les pages sans traduction retombent sur le contenu
  français avec un bandeau explicite.
- La langue est détectée au premier chargement à partir de
  `navigator.languages`, puis mémorisée dans `localStorage`
  (`raiton-locale`). Un choix explicite dans le sélecteur de langue est
  prioritaire.
- Le sélecteur de langue du header conserve la page, la version et l'ancre
  courantes.
- Chaque page expose ses alternatives `hreflang` (`fr` et `en`) et le sitemap
  contient les deux arborescences.
- L'index de recherche est généré pour chaque langue :
  `public/search-index.json` et `public/search-index.en.json`.

Pour ajouter une traduction, créez le fichier correspondant dans
`content/en/`. Les liens internes restent écrits `/docs/<slug>` : le rendu
ajoute automatiquement la version, la langue et le `basePath`.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` construit et publie `out/` à chaque
push sur `main`.

1. Dans **Settings → Pages**, choisissez **GitHub Actions** comme source.
2. Pour un site de projet (`https://<user>.github.io/<repo>/`), le workflow
   détecte automatiquement le `basePath` via `actions/configure-pages`.
3. Pour un domaine personnalisé, ajoutez un fichier `public/CNAME` (par exemple
   `raiton.protorians.dev`). Le workflow désactive alors le `basePath`.

Variables utiles :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Sous-chemin de déploiement |
| `NEXT_PUBLIC_SITE_URL` | Origine absolue pour les métadonnées et le sitemap |

## Structure

```text
app/                 routes Next.js (accueil, /docs, /docs/[version], /en)
components/          header, sidebar, TOC, recherche, landing, sélecteur de langue
content/             pages Markdown versionnées (français)
content/en/          traductions anglaises
content/versions/    overrides par version (français)
content/en/versions/ overrides par version (anglais)
lib/                 chargement, rendu Markdown, versions, site, i18n
scripts/             génération de l'index de recherche
public/brand/        logo optimisé et image Open Graph
public/              favicon, apple-icon, .nojekyll
assets/brand/        logo original fourni (non déployé)
```

## Licence

MIT — voir le dépôt du framework.
