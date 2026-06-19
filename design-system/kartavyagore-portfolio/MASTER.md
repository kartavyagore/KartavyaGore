# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/kartavyagore-portfolio/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** KartavyaGore Portfolio
**Generated:** 2026-06-19
**Category:** Portfolio/Personal
**Stack:** Next.js 16.2.1 · React 19 · Tailwind v4 (CSS-first `@theme inline`) · framer-motion · next/font/google

---

## Global Rules

### Theme Strategy — Dual Theme with Toggle

The site ships **two complete themes** that share a single token surface.

- **Default theme:** `dark` (matches the original NetflixIntro cinematic feel)
- **Opt-in theme:** `light`
- **Persistence:** `localStorage.kg-theme` → `prefers-color-scheme` → `"dark"` fallback
- **Mechanism:** `<html data-theme="dark" | "light">` toggled by `ThemeProvider` (`lib/theme-context.tsx`).
  An inline `<script>` in `<head>` (rendered server-side, runs before paint) reads `localStorage` and writes `data-theme` to avoid an SSR flash.
- **Toggle UI:** `components/theme/theme-toggle.tsx`, mounted in `MinimalDock`.
  Icons: `Sun` / `Moon` from `@/lib/lucide-react`. `aria-label`, `aria-pressed`, focus rings on `accent`.

### Color Palette — Token Layer

All colors flow through CSS variables defined in `app/globals.css` and exposed to Tailwind via `@theme inline`.
**Never hardcode `bg-white` / `bg-black` / `text-white` / `border-white/*` in components — always use the token utilities.**

| Role | Token utility | Light (`[data-theme="light"]`) | Dark (`[data-theme="dark"]`) |
|------|---------------|-------------------------------|------------------------------|
| Page background | `bg-background` | `#FAFAFA` | `#09090B` |
| Primary text | `text-foreground` | `#09090B` | `#FAFAFA` |
| Raised surface (cards, inputs) | `bg-card` | `#FFFFFF` | `#18181B` |
| Card text | `text-card-foreground` | `#09090B` | `#FAFAFA` |
| Inline surface (chips, hover) | `bg-surface` | `#FFFFFF` | `#18181B` |
| Muted surface | `bg-muted` | `#F4F4F5` | `#27272A` |
| Muted text | `text-muted-foreground` | `#52525B` | `#A1A1AA` |
| Border | `border-border` | `#E4E4E7` | `rgba(255,255,255,0.08)` |
| Accent (CTA, links) | `bg-accent` / `text-accent` | `#2563EB` | `#3B82F6` |
| Accent text (on accent bg) | `text-accent-foreground` | `#FFFFFF` | `#FFFFFF` |
| Accent soft (badge halo) | `bg-accent-soft` | `rgba(37,99,235,0.12)` | `rgba(59,130,246,0.18)` |
| Success | `text-success-foreground` / `bg-success` | `#16A34A` | `#22C55E` |
| Warning | `text-warning-foreground` / `bg-warning` | `#D97706` | `#F59E0B` |
| Danger | `text-danger-foreground` / `bg-danger` | `#DC2626` | `#EF4444` |
| Modal overlay | `bg-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.65)` |

**Adding a new color:** add it as a CSS variable under `:root` (light) and `[data-theme="dark"]` (dark) in `globals.css`, then expose it via `@theme inline { --color-your-token: var(--your-token); }`.

### Typography — Archivo + Space Grotesk

Loaded via `next/font/google` in `app/layout.tsx` and mapped to CSS variables.

| Role | Font | Token | Tailwind utility |
|------|------|-------|------------------|
| Display / headings | Archivo | `--font-archive` | `font-archive` |
| Body / UI | Space Grotesk | `--font-space-grotesk` | `font-space-grotesk` |

- Use `font-archive` for: `<h1>`, `<h2>`, card titles, hero headlines.
- Use `font-space-grotesk` (or omit — it is the body default) for: paragraphs, labels, buttons, inputs.
- Track headings with `tracking-tight` for Archivo, `tracking-[0.18em] uppercase` for UI micro-copy.
- Mood: minimal · portfolio · designer · creative · clean · artistic.

### Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

Standard shadows are defined in `globals.css`. Keep using Tailwind's `shadow-*` utility classes.

Custom shadows preserved:

- `.shadow-button` — primary CTA (raised look)
- `.shadow-button-inset` — recessed inner edge
- `.shadow-button-inset-dark` — dark-theme inset

### Radius

- `--radius-sm: 0.5rem` · `--radius-md: 0.75rem` · `--radius-lg: 1rem` · `--radius-xl: 1.5rem`
- Cards and modals: `rounded-2xl` / `rounded-3xl`. Buttons and pills: `rounded-full`. Inputs: `rounded-lg`.

### Motion

- **Default easing:** Tailwind default `transition-colors duration-200`.
- **Entrances:** framer-motion `initial` / `animate` with `duration: 0.5–0.7`, `ease: "easeOut"`.
- **Hover lifts:** `whileHover={{ y: -4 }}` for cards, `whileHover={{ y: -6 }}` for hero project cards.
- **`prefers-reduced-motion: reduce`** is honored globally (`globals.css`). framer-motion respects it automatically.
  Components that animate outside React (Canvas 2D Pong, `NetflixIntro` audio) check `window.matchMedia` manually.

---

## Component Specs

### Primitives (`components/ui/`)

- **`<Button variant="primary" | "secondary" | "outline" | "accent" | "ghost">`** — use the primitive instead of inline `<button className>`.
  All buttons get `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background`.
- **`<Card>`** — `font-archive` on `CardTitle`, `bg-card` surface, `rounded-2xl` border, `border-border`.
- **`<Badge variant="default" | "accent" | "success" | "warning" | "danger">`** — rounded-full, semantic colors.
- **`<ToastContainer>`** — semantic success / warning / danger come from `toast.tsx`; uses token classes.

### Specialized Surfaces

- **`<NetflixIntro>`** — intentionally cinematic. Hardcoded `bg-black` / `bg-white` flash stays.
- **`<AnimatedHeroSection>` (Pong)** — Canvas 2D. Hex colors are hardcoded inside the canvas; only the surrounding Cmd-K pill and chrome use tokens.
- **`<SlideButton>`** — preserves the `shadow-button` utility and `no-swipe` mobile-nav marker.
- **`<RadialOrbitalTimeline>`** — status colors come from `data-status` attribute selectors, not inline class branches.
- **`<MinimalDock>`** — token-styled nav + mounts `<ThemeToggle>`.

---

## Accessibility Rules

- All icon-only buttons have `aria-label` (e.g., `aria-label="Toggle theme"`).
- Theme toggle also has `aria-pressed` reflecting the active theme.
- Focus rings: `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background` on every interactive element.
- `prefers-reduced-motion: reduce` — all motion collapses; canvas animations skip their RAF loops.
- `prefers-contrast: more` — border opacity bumps from 0.08 to 0.2 (`@media` block in `globals.css`).
- Maintain 4.5:1 contrast minimum for body text. Token palettes are tuned to clear this in both themes.

---

## Style Guidelines

**Style:** Motion-Driven · Monochrome + Blue · Cinematic entry

**Keywords:** Animation-heavy, microinteractions, smooth transitions, scroll effects, parallax, entrance anim, page transitions, dual-theme, Netflix-feel intro.

**Best For:** Portfolio sites, storytelling platforms, interactive experiences, creative SaaS.

### Page Pattern

**Pattern Name:** Cinematic Portfolio Grid

- **Conversion Strategy:** Hover overlay info · lightbox view · visuals first · filter by category · fast loading essential.
- **CTA Placement:** Project Card Hover + Footer Contact.
- **Section Order:**
  1. **Hero** — NetflixIntro splash → Pong-game prompt-fight pixel text (`/` route)
  2. **About** — glassmorphism block → radial orbital timeline → education scroll (`/about`)
  3. **Projects** — full-bleed scroll-progress bar + project cards (`/projects`)
  4. **Blogs** — list + detail with TOC sidebar (`/blogs`, `/blogs/[slug]`)
  5. **Recruiter** — curated view with AI studio (`/recruiter`)
  6. **Contact** — minimal card (`/contact`)

---

## Anti-Patterns (Do NOT Use)

- ❌ Hardcoded colors (`bg-white`, `text-white`, `border-white/*`, `bg-black`, `from-white`, etc.) in any component
- ❌ Imports from `"lucide-react"` — always use `@/lib/lucide-react`
- ❌ Class-based theme switching — use `data-theme` attribute on `<html>`
- ❌ Corporate templates
- ❌ Generic layouts

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Lucide via local re-export)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No hardcoded `bg-white`/`bg-black`/`text-white`/`border-white/*` (allowed exceptions: `netflix-intro.tsx`, canvas code)
- [ ] All icons imported from `@/lib/lucide-react`, never from `"lucide-react"`
- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Dark mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation (`focus-visible:ring-accent`)
- [ ] `prefers-reduced-motion` respected
- [ ] `prefers-contrast: more` respected (handled in `globals.css`)
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Theme toggle works (click, persists across reload, no SSR flash)

---

## How to Apply This System

1. Need a color? Pick a token from the table above. If none fits, add a new CSS variable + `@theme inline` entry in `globals.css`.
2. Building a page? Check `design-system/kartavyagore-portfolio/pages/[page-name].md` first; if it exists, its rules override this file.
3. New component? Default to primitives (`Button`, `Card`, `Badge`, `Toast`); token-route everything; honor focus + motion rules.
4. After any change to `globals.css`, re-test in **both themes** by clicking the dock toggle.
