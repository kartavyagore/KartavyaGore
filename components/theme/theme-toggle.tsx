"use client"

import * as React from "react"
import { Moon, Sun } from "@/lib/lucide-react"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

type ThemeToggleProps = {
  /**
   * Visual variant.
   * - "default" — small icon button (h-9 w-9 rounded-full), used standalone.
   * - "dock" — full dock-item-sized square (h-11 w-11 rounded-lg) so it
   *   sits flush with the rest of the MinimalDock row.
   */
  variant?: "default" | "dock"
  className?: string
}

/**
 * Icon-only button that toggles between light and dark.
 * Uses `aria-pressed` to communicate state to assistive tech.
 */
export function ThemeToggle({ variant = "default", className }: ThemeToggleProps) {
  const { theme, toggle } = useTheme()

  // Avoid a mismatch: render an empty placeholder with the same box size
  // until we know the resolved theme. The default icon is Sun, which matches
  // the light-mode "click to go dark" affordance.
  const isDark = theme === "dark"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className={cn(
        "inline-flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:-translate-y-0.5 hover:bg-muted",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" &&
          "h-9 w-9 rounded-full border border-border bg-surface text-foreground",
        variant === "dock" &&
          "h-11 w-11 rounded-lg border border-border bg-surface text-foreground",
        className
      )}
    >
      {isDark ? <Moon size={variant === "default" ? 16 : 20} /> : <Sun size={variant === "default" ? 16 : 20} />}
    </button>
  )
}