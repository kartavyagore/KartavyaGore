"use client"

import * as React from "react"

export type Theme = "light" | "dark"

type ThemeContextValue = {
  /** Current resolved theme. `null` until the provider has mounted. */
  theme: Theme | null
  /** The user's explicit preference, if any. `null` = follow system. */
  preference: Theme | "system"
  /** Set a specific theme. Persists to localStorage. */
  setTheme: (theme: Theme) => void
  /** Set the preference back to "follow system". */
  setSystem: () => void
  /** Toggle between light and dark. Persists. */
  toggle: () => void
}

const STORAGE_KEY = "kg-theme"

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function readStoredPreference(): Theme | "system" | null {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return null
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-theme", theme)
  document.documentElement.style.colorScheme = theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = React.useState<Theme | "system">("system")
  const [theme, setThemeState] = React.useState<Theme | null>(null)

  // Initial mount: read localStorage, then system, then default to dark.
  React.useEffect(() => {
    const stored = readStoredPreference()
    const resolved: Theme = stored === "light" || stored === "dark" ? stored : getSystemTheme()
    setPreference(stored ?? "system")
    setThemeState(resolved)
    applyTheme(resolved)
  }, [])

  // Track system changes only when user has not expressed a preference.
  React.useEffect(() => {
    if (preference !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = (event: MediaQueryListEvent) => {
      const next: Theme = event.matches ? "dark" : "light"
      setThemeState(next)
      applyTheme(next)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [preference])

  const setTheme = React.useCallback((next: Theme) => {
    setPreference(next)
    setThemeState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    applyTheme(next)
  }, [])

  const setSystem = React.useCallback(() => {
    setPreference("system")
    const resolved = getSystemTheme()
    setThemeState(resolved)
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    applyTheme(resolved)
  }, [])

  const toggle = React.useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === "dark" ? "light" : "dark"
      setPreference(next)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, next)
      }
      applyTheme(next)
      return next
    })
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, preference, setTheme, setSystem, toggle }),
    [theme, preference, setTheme, setSystem, toggle]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>")
  }
  return ctx
}
