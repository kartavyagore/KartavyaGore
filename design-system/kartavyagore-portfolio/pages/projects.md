# Projects Page (`/projects`) — Page Overrides

> These rules override the Master file for the `/projects` route only.

## Layout

- **Page surface:** `<main className="font-space-grotesk relative min-h-screen overflow-hidden bg-background text-foreground">`
- **Scroll progress bar:** fixed top, `h-1`, `origin-left`, gradient `from-blue-400 via-cyan-300 to-purple-400`. Driven by `useScroll` + `useSpring`.
- **Background blobs:** two `blur-3xl` halos (`-left-40 top-20`, `-right-40 top-72`) — `bg-blue-500/20` and `bg-purple-500/20`. Slow + fast parallax via `useTransform`. Decorative only; don't add focusable elements inside.

## Hero

- **Heading:** `font-archive`, `text-4xl md:text-6xl font-extrabold`, gradient `from-foreground via-blue-100 to-purple-200` with `bg-clip-text text-transparent`.
- **No eyebrow** — the previous `text-white/60` "Projects" kicker was removed in the v2 refactor.

## Project Cards

- **Container:** `rounded-3xl border border-border bg-muted backdrop-blur-xl p-6 md:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.45)]`.
- **Hover:** `whileHover={{ y: -6 }}`, plus a `pointer-events-none absolute inset-0` overlay with `from-card via-transparent to-transparent opacity-0 group-hover:opacity-100` — gives the "shine" effect without touching text contrast.
- **Entrance:** `initial={{ opacity: 0, y: 80, scale: 0.97 }}` → `whileInView={{ opacity: 1, y: 0, scale: 1 }}` with `viewport={{ once: true, amount: 0.25 }}` and `delay: index * 0.08`.
- **Layout inside the card:** `grid md:grid-cols-[1.2fr_1fr] gap-8`.

### Card content

- **Tag pill:** `rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground`.
- **Status:** `text-xs uppercase tracking-[0.16em] text-muted-foreground` — sits next to the tag pill.
- **Title:** `font-archive text-2xl md:text-3xl font-bold tracking-tight text-foreground`.
- **Summary:** `mt-4 max-w-2xl text-sm md:text-base leading-7 text-muted-foreground`.

### Card CTAs

- **Live Demo** (when present): `rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-foreground hover:bg-card`.
- **GitHub Repo:** same shape with `bg-transparent hover:bg-muted` — visually quieter than Live Demo.

### Tech Stack panel

- `rounded-2xl border border-border bg-card p-5`
- Eyebrow: `text-xs uppercase tracking-[0.2em] text-muted-foreground`
- Pills: `rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground/85`

## Theme Behavior

- All colors token-route through Master palette.
- Gradient hero text uses `from-foreground` (NOT `from-white`) so it stays visible in both themes — the `via-blue-100 to-purple-200` middle/end stays consistent.
- In light mode, the `shadow-[0_25px_80px_rgba(0,0,0,0.45)]` becomes the only thing giving card depth — that's intentional, the soft surface on a white page is the look.

## Anti-Patterns for this page

- ❌ Don't reintroduce `text-white/60` eyebrow text — it disappeared on purpose.
- ❌ Don't use `bg-white/*` for the shine overlay — `from-card via-transparent to-transparent` is the token-correct form.
- ❌ Don't move the scroll progress bar — it's the only persistent indicator that the page is scroll-driven.
