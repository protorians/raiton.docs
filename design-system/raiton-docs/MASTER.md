# Raiton Docs — Master design system

**Direction:** Night observatory. One continuous night, lit per chapter.
**Reference:** `murowallpaper.com` (fixed sky, floating glass instrument bar,
dimensional code window, restrained motion).
**Product:** technical documentation and framework landing, French, dark-first,
light as a daylight reading of the same room.

## 1. Palette

### Night (default)

| Role | Value | Token |
|---|---|---|
| Canvas | `#05070d` | `--bg` |
| Raised canvas | `#080c16` | `--bg-soft` |
| Sunken canvas | `#03050a` | `--bg-deep` |
| Panel (glass) | `rgba(16,20,32,.62)` | `--panel` |
| Panel solid | `#0a0e1a` | `--panel-solid` |
| Ink | `#eef1f8` | `--fg` |
| Ink soft | `#c8cfdd` | `--fg-soft` |
| Muted | `#98a1b4` | `--muted` |
| Faint | `#828aa0` | `--faint` |
| Accent (ice) | `#a9c4ff` | `--accent` |
| Accent high | `#c7d8ff` | `--accent-hi` |
| Accent text | `#c3d6ff` | `--accent-strong` |
| Accent ink | `#08101f` | `--accent-ink` |
| Border | `rgba(255,255,255,.1)` | `--border` |
| Border strong | `rgba(255,255,255,.18)` | `--border-strong` |
| Code surface | `#04060c` | `--code-bg` |
| Violet light | `#7b4dff` | secondary |
| Blue light | `#3f7bff` | secondary |
| Teal light | `#4fd6c9` | secondary |
| Mint (success) | `#7de8a8` | `--mint` |
| Rose (brand warmth) | `#ff8fa5` | `--rose` |

### Daylight

| Role | Value |
|---|---|
| Canvas | `#f5f7fc` |
| Raised | `#eef2fb` |
| Panel | `rgba(255,255,255,.82)` |
| Ink | `#0a0f1c` |
| Muted | `#5c677d` |
| Faint | `#5f6a7c` |
| Accent | `#2f5dd0` |
| Accent text | `#2447b8` |
| Accent ink | `#ffffff` |
| Border | `#dfe6f4` |
| Border strong | `#cbd6ea` |

**Rule:** code is always a night surface, in both themes. Never invert the code
window to a light card.

## 2. Typography

- Display and body: **Geist Sans** (existing local variable font).
- Mono: **Geist Mono** for kickers, tags, commands, version tags, metadata.
- Display tracking: `-0.04em` to `-0.055em`; weight 700.
- Body: 15-17px, line-height 1.6-1.8; long-form docs 15px/1.8.
- Kickers: mono, 10-11px, uppercase, `0.14-0.16em` tracking.
- No gradient text. Emphasis uses size, weight, or a single accent word.

Scale reference:

| Use | Size |
|---|---|
| Hero | `clamp(2.55rem, 6vw, 4.35rem)` |
| Section title | `2rem` to `2.6rem` |
| Card title | `15px` to `17px` |
| Body | `13px` to `17px` |
| Mono label | `9px` to `11px` |

## 3. Surfaces and light

- `.glass`: white 5.5%/2.2% gradient, 1px border, inset top highlight, blur 18px.
- `.glass-window`: `#101522 → #080b13`, white 14% border, deep double shadow.
- `.nav-glass`: 28/33/48 gradient with blur 22px and saturate 160%; pointer light
  at `--nx`.
- `.spotlight`: 340px radial pointer light at `--px/--py`, 13% ice.
- Halo/orb: radial ice blue sphere, inset shadows, no neon.
- The fixed `.atmosphere` carries the star canvas, two aurora blooms and a grain
  layer. It never moves between chapters.

## 4. Geometry

- Page wrap: 1280px max, 20/28/40px gutters.
- Radii: 10px controls, 16-20px cards, 22-26px panels, 30px close cards, pills.
- Shadows: inset highlight plus large soft drop; never a neutral grey card.
- Borders: 1px hairline at 10% white (night) or `#dfe6f4` (day).
- Spacing rhythm: 4/8/12/16/24/32/48/64/96.

## 5. Motion

- Reveal: opacity 0→1, translateY 18px→0, 750ms `cubic-bezier(.23,1,.32,1)`,
  stagger 70ms via `--d`.
- Pointer parallax: max ±30px, `data-parallax` + `--mx/--my`, disabled on coarse
  pointers and reduced motion.
- Hover: 160-220ms, colour/opacity/shadow only. Never `transition: all`.
- No width/height/top/left animation. Use transform, opacity, clip-path.
- Signature move: the live request trace, with pause control, stops under
  `prefers-reduced-motion`.
- Every scroll state is readable with motion disabled and with JS disabled
  (noscript reveals all `[data-reveal]`).

## 6. Components

- **Header:** floating glass bar, brand app-icon tile, centre tab pill with a
  sliding active pill, compact search / version / theme / GitHub cluster.
- **Buttons:** pill, 44px (34 small, 50 large). Primary is ice gradient with dark
  ink; glass is translucent with a 1px border. The button never lifts; press
  moves 1px.
- **Chips:** mono 10-11px, 1px border, glass fill, used for versions and metadata.
- **Cards:** glass, optional spotlight, 2xl radius. Hover changes border/colour,
  not layout.
- **Code:** `glass-window` chrome with three dots, filename, language tag; night
  syntax in both themes; horizontal scroll for long lines.
- **Docs prose:** 15px/1.8, accent underlined links, callouts with a 2px left
  rule, tables with glass header, inline code pill.
- **Sidebar:** glass support card, mono section labels, active item has an ice
  left bar and tinted fill.
- **TOC:** 1px rail, active item gets an ice dot and accent text.
- **Search:** frosted modal, solid panel, glass rows, ice highlight, keyboard
  hints in the footer.
- **Footer:** giant outlined wordmark, four columns, mono headings.

## 7. Accessibility

- Body text contrast ≥ 4.5:1 in both themes. Measured samples: dark muted 7.76,
  dark faint 5.84, light muted 5.31, light faint 5.10, light accent 5.45.
- Focus ring: 2px accent, 3px offset, 10px radius.
- Touch targets: 40px header controls, 44px primary actions, 36px minimum links.
- One `h1` per page; headings in order; decorative icons `aria-hidden`.
- The trace is a tablist with a pause control; the docs wall is `aria-hidden`.
- Reduced motion: no travel, no loop, no auto-advance; all content visible.
- No emoji as icons, no low-contrast grey body copy, no colour-only state.

## 8. Anti-patterns

- No coral/peach page background, no white paper panels in dark mode.
- No gradient text, neon glow or zero-offset coloured halos.
- No section counters, scroll cues, or "scroll to explore" nudges.
- No full-frame dark overlay to fix contrast; scrim only where text sits.
- No invented metrics. Numbers on the page are real or removed.
- No generated clay dioramas or stock photography. Depth comes from code, light
  and layered CSS.
- No second brand in light mode; daylight is the same room at noon.
