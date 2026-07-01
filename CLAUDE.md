# CLAUDE.md — Software Engineer Portfolio (inspired by fionavilmer.com)

> Reference: http://fionavilmer.com/en (design by Atelier Trois)
> The screenshots show a **full-viewport oversized-serif** editorial design.
> Before building, open the reference site, use DevTools → Computed styles
> on the `<body>` and a section heading, and update the "TO CONFIRM" values
> below with the real ones.

## Design Philosophy

This is a **typography-as-design** portfolio. The personality comes from a
single oversized serif filling the entire viewport. There are no cards, no
grids, no icons, no chrome.

Core principles:
- One long single-page scroll, full viewport width — type fills the screen
- Each "row" is one full-viewport-tall section, separated by halftone hairlines
- Tiny sans-serif category labels in the corner of each section
- Click a section to zoom it in (URL changes to the section slug, ESC closes)
- Click a project title to see it full-screen (URL changes to section/item-slug)
- No accent color anywhere. Pure white background, pure black text.
- Content density over decoration — let the work titles speak

## Page Structure (single page, top to bottom)

1. **Opening line (hero)**
   - A single huge serif sentence: "Kartavya Gore is a software engineer based
     in Pune. He builds [what], mostly with [stack]."
   - Spans the full viewport width
   - No H1 tag, no eyebrow, no buttons

2. **Section: Projects**
   - Tiny sans label "Projects" flush top-left
   - One huge serif row of project titles separated by `;` — each title is a
     link, with a tiny inline grayscale thumbnail
   - Section is a clickable link to `/projects`

3. **Section: Writing**
   - Same pattern: "Writing" label + stream of post titles

4. **Section: Open Source**
   - Same pattern: "Open source" label + stream of repo names

5. **Section: About** (deep-link at `/about`)
   - Full bio paragraph in large serif

6. **Section: Contact** (deep-link at `/contact`)
   - Email as a `mailto:` link, GitHub and LinkedIn below

7. **Footer chrome**
   - Bottom-left: tiny URL breadcrumb (e.g. `kartavyagore.com/about`)
   - Bottom-right: tiny language/theme toggle

## Typography

- **Font family for the big type:** a single high-contrast classical serif.
  Playfair Display is the closest free Google Font and works well at large sizes.
  No pairing — Playfair for everything large AND small.
- **Font family for tiny UI labels:** a humanist sans (Inter is the obvious pick).
  Used ONLY for section labels, breadcrumb, toggle.
- **Base font size:** 17–18px, line-height ~1.4 — text should feel readable
- **Section headings (huge serif):** clamp(4rem, 10vw, 10rem), Playfair, weight 400–500
- **Inline links within the giant text:** same serif, same color, underline only

## Color

```css
--color-bg: #ffffff;         /* pure white */
--color-text: #000000;       /* pure black */
--color-link: #000000;       /* links inherit text color */
--color-link-hover: #000000; /* same color, underline on hover */
--color-muted: #6a6a6a;      /* tiny UI labels, breadcrumb */
--color-rule: #000000;       /* the halftone hairline */
```

Rules:
- No accent color anywhere. No blue links. Links are the same color as body text.
- **Section separator:** a halftone/dithered/cross-hatched pattern (not a solid
  border). Looks like a printed newspaper rule. Can be implemented as a CSS
  `background-image: radial-gradient(...)` repeating-linear-gradient, or an
  inline SVG.

## Layout & Spacing

- Full viewport width. Sections span the entire browser window.
- Small left/right margin (~20–40px) so text isn't flush to the edge.
- Each section is approximately one viewport tall.
- Vertical gap between sections: zero (the halftone rule is the only separator).
- No card backgrounds, no shadows, no rounded corners anywhere.

## Interaction

- **Section click:** zooms the section in, pushes other sections up/away.
  URL changes to `/section-name`. ~300ms ease. ESC or click on the dimmed
  area closes.
- **Project title click:** opens a full-screen item view at `/section/item-slug`.
  Large title, large image (if any), description. × close button top-right.
- **Hover:** the link's underline appears, or text becomes muted — pick one.
- All transitions 200–400ms ease. No bounce. No slide.
- Minimal JS. A simple route handler for the section/item URL.

## Content Tone

- Bio copy: first-person, plain, factual.
- Project titles: short, one line each. Use `;` to separate them in the giant row.
- Let the list of work be the proof.

## Tech Stack

- Next.js 16 (already in use)
- Playfair Display + Inter from `next/font/google`
- framer-motion is already installed — use the `motion` package (`motion/react`)
- No UI framework. No shadcn.

## What NOT to do

- Don't use a 12-col grid, don't use cards, don't use a 640px column
- Don't pair Playfair with Inter for body text — Playfair for everything large,
  Inter only for tiny UI labels
- Don't add a hero image, profile photo, or illustration (except inline thumbnails)
- Don't add a sticky nav bar
- Don't add a color accent "for branding"
- Don't make it static-routes-only — the section zoom needs `useRouter` + URL state
