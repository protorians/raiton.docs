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
app/                 routes Next.js (accueil, /docs, /docs/[version])
components/          header, sidebar, TOC, recherche, landing
content/             pages Markdown versionnées
content/versions/    overrides par version
lib/                 chargement, rendu Markdown, versions, site
scripts/             génération de l'index de recherche
public/brand/        logo optimisé et image Open Graph
public/              favicon, apple-icon, .nojekyll
assets/brand/        logo original fourni (non déployé)
```

## Licence

MIT — voir le dépôt du framework.
