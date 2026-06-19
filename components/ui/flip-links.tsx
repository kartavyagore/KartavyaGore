"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type FlipLinkProps = {
  children: string
  href: string
  className?: string
}

export const FlipLink = React.forwardRef<HTMLAnchorElement, FlipLinkProps>(
  ({ children, href, className }, ref) => {
    const isMail = href.startsWith("mailto:")

    return (
      <a
        ref={ref}
        href={href}
        target={isMail ? undefined : "_blank"}
        rel={isMail ? undefined : "noopener noreferrer"}
        className={cn(
          "group relative block overflow-hidden whitespace-nowrap font-archive text-3xl font-black uppercase text-foreground/90 transition-colors hover:text-foreground sm:text-4xl md:text-5xl",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-sm",
          className,
        )}
        style={{ lineHeight: 0.75 }}
      >
        <div className="flex">
          {children.split("").map((letter, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-[110%]"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="absolute inset-0 flex">
          {children.split("").map((letter, i) => (
            <span
              key={i}
              className="inline-block translate-y-[110%] text-accent transition-transform duration-300 ease-in-out group-hover:translate-y-0"
              style={{ transitionDelay: `${i * 25}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
      </a>
    )
  },
)
FlipLink.displayName = "FlipLink"