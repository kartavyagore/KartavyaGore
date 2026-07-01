import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import "./globals.css";

/**
 * Inter — used only for the tiny UI labels (section labels, breadcrumb,
 * theme toggle, language switcher). Never for headlines.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

/**
 * Playfair Display — the editorial face. Used for the oversized serif
 * hero, section titles, project/post titles, the "Kartavya Gore is a
 * software engineer…" opening line, and every large word in the site.
 * Weight 400–500 reads at huge sizes.
 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Kartavya Gore",
  description:
    "Kartavya Gore — software engineer based in Pune. I build backend systems, secure products, and full-stack apps.",
  keywords: [
    "Kartavya Gore",
    "software engineer",
    "full stack",
    "Java",
    "Next.js",
  ],
  authors: [{ name: "Kartavya Gore" }],
  openGraph: {
    title: "Kartavya Gore",
    description: "Software engineer. Backend systems, secure products, full-stack apps.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Inline script that runs before paint to set `data-theme` from
 * localStorage or `prefers-color-scheme`. Prevents a light/dark flash
 * on first load.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('kg-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="kg-body min-h-full bg-background font-sans text-foreground">
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
