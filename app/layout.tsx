import type { Metadata, Viewport } from "next";
import { Archivo, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/lib/theme-context";
import MinimalDock from "@/components/ui/minimal-dock";
import { CommandPalette } from "@/components/ui/command-palette";
import MobileSwipeNav from "@/components/ui/mobile-swipe-nav";
import GlobalAiChatWidget from "@/components/ui/global-ai-chat-widget";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archive",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kartavya Gore | Java Full-Stack Developer Portfolio",
  description:
    "Portfolio of Kartavya Gore - Full-Stack Developer specializing in Next.js, TypeScript, and modern web technologies. View projects, blogs, and get in touch.",
  keywords: [
    "Kartavya Gore",
    "Full Stack Developer",
    "Next.js",
    "TypeScript",
    "React",
    "Portfolio",
  ],
  authors: [{ name: "Kartavya Gore" }],
  openGraph: {
    title: "Kartavya Gore | Java Full-Stack Developer Portfolio",
    description:
      "Portfolio showcasing projects, blogs, and expertise in modern web development",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Inline script that runs before paint to set `data-theme` from
 * localStorage or `prefers-color-scheme`. Prevents a light/dark flash
 * on first load. Kept tiny — only reads, no React involved.
 */
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('kg-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored === 'light' || stored === 'dark' ? stored : (prefersDark ? 'dark' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
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
      className={`${archivo.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground pb-28">
        <ThemeProvider>
          <MobileSwipeNav>{children}</MobileSwipeNav>
          <MinimalDock />
          <CommandPalette />
          <GlobalAiChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
