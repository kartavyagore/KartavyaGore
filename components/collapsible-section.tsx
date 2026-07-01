"use client"

import { useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"

/**
 * A collapsible editorial section. Renders:
 *   - A small eyebrow label (top-left)
 *   - A giant headline / stream (the body)
 *
 * Behaviour:
 *   - Collapsed by default: the giant content is clipped so only
 *     one line peeks. The section takes about half a viewport.
 *   - On hover over the inner content, the body scales up by ~6%
 *     and the section expands slightly to reveal more of the text.
 *   - On click anywhere on the section, navigates to `href` (the
 *     section's index page, e.g. /projects). The label is also a
 *     link to the same target for accessibility.
 *
 * The hover handler is on the *content* (inner div), not the
 * outer section padding, so that moving the mouse into the section
 * via the empty chrome strip (top/bottom of the viewport) doesn't
 * trigger the scale-up.
 */
type Props = {
  /** The eyebrow label, e.g. "Projects", "Writing", "About". */
  label: string
  /** Section index page to navigate to on click. */
  href: string
  /** The giant body content (titles, stream, etc.). */
  children: ReactNode
  /** aria-label for the section. */
  ariaLabel: string
  /** id for in-page anchors. */
  id?: string
  /**
   * When true, the eyebrow is rendered as a non-link span (because
   * the section is itself a deep-link target like /about, and the
   * body content already includes the right links).
   */
  labelIsSpan?: boolean
}

export function CollapsibleSection({
  label,
  href,
  children,
  ariaLabel,
  id,
  labelIsSpan = false,
}: Props) {
  const router = useRouter()
  const [hover, setHover] = useState(false)

  // Scale grows on hover. Also reveal more of the giant content
  // by raising the clip height.
  const scale = hover ? 1.05 : 1
  const revealPx = hover ? 320 : 120

  return (
    <section
      aria-label={ariaLabel}
      id={id}
      className="kg-section kg-edge kg-collapsible"
      data-hover={hover ? "true" : "false"}
      onClick={(e) => {
        // Don't hijack clicks that originate on a link inside the
        // body — let the user open the deep-link directly.
        const target = e.target as HTMLElement
        if (target.closest("a")) return
        router.push(href)
      }}
      style={{ cursor: "pointer" }}
    >
      <div
        className="kg-collapsible-inner"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        {labelIsSpan ? (
          <span className="kg-eyebrow">{label}</span>
        ) : (
          <a
            href={href}
            className="kg-eyebrow kg-section-link"
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </a>
        )}

        <div
          className="kg-collapsible-body"
          style={{
            marginTop: "1.5rem",
            maxHeight: `${revealPx}px`,
            transform: `scale(${scale})`,
            transformOrigin: "left top",
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
