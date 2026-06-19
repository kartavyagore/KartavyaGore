import * as React from "react"
import { cn } from "@/lib/utils"

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "outline" | "accent"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "outline" && "border border-border bg-transparent text-foreground",
        variant === "accent" && "bg-accent-soft text-accent border border-accent/20",
        variant === "default" && "bg-muted text-foreground",
        className,
      )}
      {...props}
    />
  )
}