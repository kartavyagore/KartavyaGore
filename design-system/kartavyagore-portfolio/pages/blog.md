# Blog Pages (`/blogs`, `/blogs/[slug]`) — Page Overrides

> These rules override the Master file for the blog routes only.

## `/blogs` (Index)

- **Page surface:** `<main className="font-space-grotesk relative min-h-screen bg-background px-4 py-24 text-foreground sm:px-6 lg:px-8">`.
- **Hero heading:** `font-archive`, `bg-gradient-to-r from-foreground via-blue-100 to-purple-200 bg-clip-text text-4xl md:text-6xl font-extrabold text-transparent`. Subhead: `"Ideas, Builds & Learnings"`.
- **Publisher Studio panel:** `rounded-2xl border border-border bg-muted p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl`.
- **Heading:** `flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent`.
- **Search input:** `bg-surface` border `border-border`, `placeholder:text-muted-foreground/60`, focus ring `focus:border-accent focus:ring-2 focus:ring-accent/30`.
- **Tag pills (filter row):** `rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground`; active tag uses `bg-accent text-accent-foreground`.
- **Auth tabs (Passkey / Password / MFA):** active tab uses `border-b-2 border-accent text-foreground`; inactive uses `text-foreground/40 hover:text-foreground/70`.

## `/blogs/[slug]` (Detail)

- **Page surface:** same as index.
- **Scroll progress:** `motion.div` at `top-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 origin-left z-50`. Tracks `useScroll`.
- **Article container:** `rounded-3xl border border-border bg-muted backdrop-blur-xl p-8 md:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.45)]`.

### Header

- **Back / Edit / Delete pills:** `rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground hover:bg-muted`.
- **Delete:** `border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20`.
- **Hero card:** `rounded-2xl border border-border bg-gradient-to-r from-card via-muted to-transparent p-6`.
- **Title:** `font-archive bg-gradient-to-r from-foreground via-blue-100 to-purple-200 bg-clip-text text-3xl md:text-5xl font-extrabold leading-tight text-transparent`.
- **Meta:** `text-xs uppercase tracking-[0.18em] text-foreground/55`.
- **Tags:** `rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground/80`.

### Markdown body

- Wrapper: `mt-10 rounded-2xl border border-border bg-card p-6 md:p-8`.
- Body text: `text-foreground/85` with `leading-relaxed md:text-lg`.
- `blockquote`: `border-l-4 border-accent pl-4 py-1 mb-8 text-foreground/70 italic bg-muted rounded-r-lg`.
- Inline `code`: `bg-muted text-purple-300 px-1.5 py-0.5 rounded text-sm font-space-grotesk`.
- Block code (`pre`): `relative mb-8 mt-4 rounded-xl overflow-hidden border border-border bg-[#0d1117]`. Header row uses `bg-muted border-b border-border text-xs text-foreground/50`. Body text: `text-sm text-purple-300`.
- `a`: `text-accent hover:text-accent/80 underline underline-offset-4` — token-routed, not hardcoded `blue-400`.

### Sidebar (xl+)

- **TOC + Share panels:** `rounded-2xl border border-border bg-muted p-6 backdrop-blur-md`.
- **Eyebrow:** `text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4 font-semibold`.
- **Share buttons:** `rounded-full border border-border bg-muted text-foreground/80 hover:bg-overlay`. Twitter brand color stays `text-[#1DA1F2]`; LinkedIn stays `text-[#0A66C2]` — those are intentional brand hexes.
- **Copy button success state:** `text-green-400` (semantic, not themed).

### Modals

- **Image preview overlay:** `bg-overlay`, with `<button>` close affordance `rounded-full border border-border bg-overlay/40 text-foreground/85 hover:bg-muted`.
- **Auth modal:** `bg-overlay backdrop-blur-sm` overlay, `rounded-2xl border border-border bg-card p-6 shadow-2xl` panel.
- **Tab buttons (Passkey / Password / MFA):** active uses `border-b-2 border-accent text-foreground`, inactive `text-foreground/40 hover:text-foreground/70`.
- **Inputs:** `rounded-lg border border-border bg-surface text-foreground placeholder:text-foreground/40 focus:border-accent focus:ring-2 focus:ring-accent/30`.
- **Login button:** `rounded-full border border-border bg-muted hover:bg-muted` — same shape as blog pills.
- **Cancel:** `rounded-full border border-border bg-transparent text-foreground/90 hover:bg-muted`.

### Toast / errors

- Use the global `<ToastContainer>` from `components/ui/toast.tsx`. Success / error messages bubble through `showToast(message, "success" | "error")`.

## Anti-Patterns for these pages

- ❌ Don't hardcode brand hexes for the gradient stops (use `from-foreground`).
- ❌ Don't use `bg-black/*` or `bg-white/*` for any surface — go through tokens.
- ❌ Don't reintroduce `from-blue-100 to-purple-200` start as `from-white` — it breaks in light mode.
- ❌ Twitter / LinkedIn brand colors are the **only** intentional hex literals remaining.
