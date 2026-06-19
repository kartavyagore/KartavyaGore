# Recruiter Dashboard (`/recruiter`) — Page Overrides

> These rules override the Master file for the recruiter dashboard only.

## Layout

- **Page surface:** Rendered by `<RecruiterMode />` (server-rendered route at `app/recruiter/page.tsx`). RecruiterMode owns its own container.
- **Two main surfaces:**
  1. The recruiter-facing showcase (`RecruiterMode`): curated project summary, skill chips, contact CTAs.
  2. The AI Studio (`RecruiterAIStudio`): interactive prompt + chat — uses tokens end-to-end.

## Recruiter Mode Showcase

- **Heading:** `font-archive`, large gradient text (`from-foreground via-blue-100 to-purple-200`), matches the rest of the site's display treatment.
- **Skill chips:** `rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground`.
- **CTA buttons:** use the global `<Button>` primitive (`variant="accent"` for the primary "Hire me" / "Download CV" action, `variant="outline"` for secondary).
- **Contact cards:** `rounded-2xl border border-border bg-card p-6 backdrop-blur-md` — same shell as blog sidebars for visual consistency.

## Recruiter AI Studio

- **Container:** Token-styled shell. No hardcoded colors. Any color used here MUST be from the Master palette.
- **Chat input:** `rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]`; send icon uses `text-accent`.
- **Message bubbles:**
  - User: `bg-accent text-accent-foreground rounded-2xl px-4 py-2.5`.
  - Assistant: `bg-card border border-border text-foreground rounded-2xl px-4 py-2.5`.
- **Quick prompt chips:** `rounded-full border border-border bg-muted text-muted-foreground hover:bg-card hover:text-foreground`.
- **Loading state:** `Loader2` with `animate-spin` + `text-accent`.
- **Empty state / suggestions:** `text-muted-foreground` with token-routed icons from `@/lib/lucide-react`.

## Theming

- The recruiter page is the most "content-heavy" surface and serves both themes equally. When in doubt, prefer:
  - `bg-card` / `bg-muted` / `bg-surface` over `bg-overlay`.
  - `text-foreground` for body, `text-muted-foreground` for meta, `text-accent` for links.
- The AI Studio's "Send" button is the only `bg-accent` surface in this route — it should be the most prominent interactive element.

## Accessibility

- Every chip / pill that triggers a prompt must be a real `<button>` with `aria-label`.
- The chat input must have `aria-label="Ask the recruiter AI about Kartavya"` or equivalent.
- The send button must announce submission (`aria-live="polite"` on the message list, optional).
- Focus must stay visible on every chip — token-routed focus ring `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background`.

## Anti-Patterns for this page

- ❌ Don't introduce a third color for chat bubbles — accent for user, card for assistant.
- ❌ Don't use `bg-black/*` or `bg-white/*` for any chat surface.
- ❌ Don't disable the theme toggle on this route — recruiters may view in either theme.
