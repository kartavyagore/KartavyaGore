"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Home,
  SquareKanban,
  User,
} from "@/lib/lucide-react"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { cn } from "@/lib/utils"

interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
  href: string
}

const dockItems: DockItem[] = [
  { id: "home", icon: <Home size={20} />, label: "Home", href: "/" },
  { id: "about", icon: <User size={20} />, label: "About", href: "/about" },
  { id: "projects", icon: <SquareKanban size={20} />, label: "Projects", href: "/projects" },
  { id: "recruiter", icon: <BriefcaseBusiness size={20} />, label: "Recruiter Mode", href: "/recruiter" },
  { id: "blogs", icon: <BookOpen size={20} />, label: "Blogs", href: "/blogs" },
]

export default function MinimalDock() {
  const pathname = usePathname()

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("kg:open-ai-chat"))
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto">
        <nav
          aria-label="Primary"
          className="flex items-end gap-2 rounded-2xl border border-border bg-surface/80 px-4 py-3 shadow-2xl backdrop-blur-xl"
        >
          {dockItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative"
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border backdrop-blur-[2px] transition-all duration-300 ease-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive
                      ? "scale-110 -translate-y-1 border-accent/40 bg-accent-soft shadow-lg"
                      : "border-border bg-surface hover:scale-105 hover:-translate-y-0.5 hover:bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "transition-all duration-300 group-hover:scale-105",
                      isActive ? "text-accent" : "text-foreground",
                    )}
                  >
                    {item.icon}
                  </div>
                </div>

                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface/95 px-2.5 py-1 text-xs font-normal text-foreground opacity-0 shadow-md backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.label}
                  <div className="absolute left-1/2 top-full -translate-x-1/2">
                    <div className="h-2 w-2 rotate-45 border-b border-r border-border bg-surface/95" />
                  </div>
                </div>
              </Link>
            )
          })}

          <div className="mx-1 h-6 w-px self-center bg-border" aria-hidden="true" />

          <div className="group relative">
            <button
              type="button"
              onClick={openAiChat}
              aria-label="Open AI chat"
              className={cn(
                "relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border backdrop-blur-[2px] transition-all duration-300 ease-out",
                "border-accent/30 bg-accent-soft text-accent",
                "hover:scale-105 hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              <Bot className="transition-transform duration-300 group-hover:scale-105" size={20} />
            </button>

            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface/95 px-2.5 py-1 text-xs font-normal text-foreground opacity-0 shadow-md backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              Ask AI
              <div className="absolute left-1/2 top-full -translate-x-1/2">
                <div className="h-2 w-2 rotate-45 border-b border-r border-border bg-surface/95" />
              </div>
            </div>
          </div>

          <div className="group relative">
            <ThemeToggle variant="dock" />
            <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface/95 px-2.5 py-1 text-xs font-normal text-foreground opacity-0 shadow-md backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              Toggle theme
              <div className="absolute left-1/2 top-full -translate-x-1/2">
                <div className="h-2 w-2 rotate-45 border-b border-r border-border bg-surface/95" />
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  )
}