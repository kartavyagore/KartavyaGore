"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const ROUTES = ["/", "/about", "/projects", "/blogs"]
const SWIPE_THRESHOLD = 50

export default function MobileSwipeNav({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) return

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      const deltaY = e.changedTouches[0].clientY - touchStartY.current

      // Ignore vertical swipes (scrolling)
      if (Math.abs(deltaY) > Math.abs(deltaX)) return
      if (Math.abs(deltaX) < SWIPE_THRESHOLD) return

      const currentIndex = ROUTES.indexOf(pathname)
      if (currentIndex === -1) return

      if (deltaX < 0 && currentIndex < ROUTES.length - 1) {
        // Left swipe -> next page
        router.push(ROUTES[currentIndex + 1])
      } else if (deltaX > 0 && currentIndex > 0) {
        // Right swipe -> prev page
        router.push(ROUTES[currentIndex - 1])
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isMobile, pathname, router])

  return <>{children}</>
}
