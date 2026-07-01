"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { AiChat } from "@/components/ui/ai-chat";

/**
 * The fixed top-center wordmark. Two states:
 *   - "Kartavya Datta Gore" — when the user is at the top of the page
 *   - "KDG" — when the user has scrolled away from the top
 *
 * The two labels crossfade in place; the new label slides up
 * slightly as it appears, giving a small editorial animation.
 * Clicking the wordmark (in either state) returns to "/".
 */
export function Wordmark() {
  const router = useRouter();
  const [shrunk, setShrunk] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShrunk(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="kg-wordmark"
      aria-label="Kartavya Gore — home"
    >
      <span
        className={
          shrunk
            ? "kg-wordmark-label kg-wordmark-label-out"
            : "kg-wordmark-label kg-wordmark-label-in"
        }
        aria-hidden={shrunk}
      >
        Kartavya Datta Gore
      </span>
      <span
        className={
          shrunk
            ? "kg-wordmark-label kg-wordmark-label-in"
            : "kg-wordmark-label kg-wordmark-label-out"
        }
        aria-hidden={!shrunk}
      >
        KDG
      </span>
    </button>
  );
}

/**
 * The "×" close button in the top-right of a detail view. Clicking
 * it navigates back to the parent section (or to "/" if no parent
 * was provided).
 */
export function CloseButton({ to }: { to: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(to)}
      className="kg-close"
      aria-label="Close"
    >
      ×
    </button>
  );
}

/**
 * The bottom-right cluster: AI chat trigger stacked above the
 * theme toggle. Both are pure-text editorial labels; no icons.
 */
export function ChromeBottomRight() {
  return (
    <div className="kg-chrome-right">
      <AiChat />
      <ThemeToggle />
    </div>
  );
}

/**
 * The bottom-right language / theme toggle. The reference site uses
 * it for English ⇄ Français; we use it for light ⇄ dark. Kept as
 * one inline string of "EN / FR" semantics — flipping it switches
 * the theme.
 */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      className="kg-toggle"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

/**
 * The bottom-left URL breadcrumb. Renders the current path, e.g.
 * "kartavyagore.com/about" or just "kartavyagore.com" on home.
 */
export function Breadcrumb({ path }: { path: string }) {
  return (
    <span className="kg-breadcrumb">
      kartavya-gore.vercel.app{path === "" ? "" : path}
    </span>
  );
}
