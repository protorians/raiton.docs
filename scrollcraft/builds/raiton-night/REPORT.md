# Raiton Docs — Night Observatory

Build folder: `scrollcraft/builds/raiton-night/`
Local build: `http://localhost:4600` (static export served from `out/`)

## Brief

Self-authored under explicit creative delegation. The user asked for a full art
direction rework of the whole site using `murowallpaper.com` as the visual
reference, with the `scroll-craft` and `ui-ux-pro-max` skills. The eight topics,
feeling curve and peak are recorded in `BRIEF.md`.

## Grammar and why the others lost

**Night observatory / chaptered workspace.** Raiton is a documentation product,
not a campaign. A filmic one-shot, a pinned scroll sequence or a worldflight
would break deep links, search, the permanent sidebar and the reading flow that
make docs usable. The page keeps a persistent instrument bar and a held stage per
chapter; the scroll is the light moving through one room, not a camera flight.

## Signature move

**The Raiton signal.** A live request trace in the hero: `POST /api/users`
lights the controller, the contract, the generated artefacts and the response in
order, with the exact decorator and output read out for each stage. It has a
pause control and respects reduced motion, so it is useful documentation, not a
decorative loop.

## Journey and feeling curve

| Act | Feeling | What causes it |
|---|---|---|
| Arrival | Curiosity | Fixed star field, glass bar, a code window floating with its own light and telemetry cards. |
| The trace | Understanding | The signal walks the stack and names what each stage produces. |
| The pieces | Confidence | A six-card bento, each capability linked to its page. |
| The code | Appetite | Two real files in night code windows, then the one command to run them. |
| The path | Orientation | Three steps on a lit rail, from scaffold to deploy. |
| The close | Resolve | A release card and a moonlit CTA that holds. |

**Peak:** the trace. It has the strongest light on the page, the only continuous
motion in the hero, and the largest single component there.

## Score

| Act | Device | Why |
|---|---|---|
| Arrival | Layered hero + pointer parallax | Depth without video; the code is the subject. |
| Trace | Bespoke live signal | The signature move; informative, not ornamental. |
| Pieces | Spotlight bento | Pointer light reveals the card edge; six capabilities at a glance. |
| Code | Night windows + command bar | Real markup, real code, no fake screenshots. |
| Path | Lit rail | Sequence is the content. |
| Close | Held glass panel + moon | Resolves instead of fading to a footer. |

At least four device families, no repeats back to back. Reduced motion keeps
every state readable and removes travel, not content.

## Fingerprint gate

The only existing row is `kordont-rework` (chaptered editorial marketplace).
This build differs on all six dimensions: grammar, nav treatment, hero device,
act-sequence shape, close pattern and signature move. Result: **6/6**.

## What changed

- **Tokens.** Deep night `#05070d`, ice accent `#a9c4ff`, violet/teal secondary
  light, glass borders, inset highlights, and a daylight reading for light mode.
- **Typography.** Geist display at tight tracking, mono kickers and labels,
  larger section titles, calmer body measure.
- **Navigation.** Floating glass instrument bar with a sliding active pill and a
  pointer light; compact tool cluster; mobile glass menu.
- **Homepage.** Layered parallax hero, the live signal, proof strip, bento
  features, code windows, lifecycle rail, documentation wall, release card and
  moonlit CTA.
- **Docs.** Glass sidebar with version block and support card, rail-style TOC,
  night code surfaces, restyled tables, callouts and prev/next navigation.
- **Search.** Frosted modal, glass result rows, ice highlight, keyboard hints.
- **404.** A held night page with an orb, no dead end.
- **Open Graph.** New 1200x630 night card generated from real markup and the
  brand mark.

## Verification

Run against the static export at `http://localhost:4600`:

- `npm run typecheck`, `npm run build`: pass (162 static pages).
- Desktop 1440 dark and light, full page.
- Mobile 390x844 dark: hero, signal, features, code, close.
- Docs page 1440 dark/light and 390 mobile.
- Search dialog, mobile menu, 404.
- No console errors, no horizontal overflow, one `h1` per page.
- All 28 `[data-reveal]` elements reach `.in` after a real scroll; reduced
  motion shows all content immediately.
- Contrast samples: dark muted 7.76:1, dark faint 5.84:1, light muted 5.31:1,
  light faint 5.10:1, light accent 5.45:1, white on light accent 5.84:1.
- Touch targets: header controls 40px, primary buttons 44/50px.

## Not verified

- A physical iPhone or Android device, iOS Safari video/decoder behaviour. No
  video is used, but the real-device check is still outside this run.
- GitHub Pages deployment and the production `basePath`. The export passes
  locally with `NEXT_PUBLIC_BASE_PATH` unset.
- No generated photography or footage; none was needed. The build uses the
  existing brand mark, code, CSS light and the star field.

## Evidence

`lab/` contains the desktop, light, mobile, docs, search and 404 captures.
