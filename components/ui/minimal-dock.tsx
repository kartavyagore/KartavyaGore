'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Home, SquareKanban, User } from "lucide-react"

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
  { id: "blogs", icon: <BookOpen size={20} />, label: "Blogs", href: "/blogs" },
]

export default function MinimalDock() {
  const pathname = usePathname()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto">
        <div className="flex items-end gap-3 rounded-2xl border border-white/15 bg-black/60 px-6 py-4 shadow-2xl backdrop-blur-xl">
          {dockItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.id}
                href={item.href}
                className="group relative"
                aria-label={item.label}
              >
                <div
                  className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border backdrop-blur-[2px] transition-all duration-300 ease-out ${
                    isActive
                      ? "scale-110 -translate-y-1 border-white/30 bg-white/15 shadow-lg shadow-white/10"
                      : "border-white/10 bg-white/5 hover:scale-105 hover:-translate-y-0.5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-white transition-all duration-300 group-hover:scale-105">
                    {item.icon}
                  </div>
                </div>

                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/5 bg-black/70 px-2.5 py-1 text-xs font-normal text-white opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  {item.label}
                  <div className="absolute left-1/2 top-full -translate-x-1/2">
                    <div className="h-2 w-2 rotate-45 border-b border-r border-white/5 bg-black/70"></div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
