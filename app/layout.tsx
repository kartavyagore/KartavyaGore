import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MinimalDock from "@/components/ui/minimal-dock";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kartavya Gore | Java Full-Stack Developer Portfolio",
  description: "Portfolio of Kartavya Gore - Full-Stack Developer specializing in Next.js, TypeScript, and modern web technologies. View projects, blogs, and get in touch.",
  keywords: ["Kartavya Gore", "Full Stack Developer", "Next.js", "TypeScript", "React", "Portfolio"],
  authors: [{ name: "Kartavya Gore" }],
  openGraph: {
    title: "Kartavya Gore | Java Full-Stack Developer Portfolio",
    description: "Portfolio showcasing projects, blogs, and expertise in modern web development",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-white pb-28">
        {children}
        <MinimalDock />
      </body>
    </html>
  );
}
