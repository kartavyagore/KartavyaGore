import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "ghost" | "accent"
}

export function Button({
  className,
  size = "default",
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        size === "lg" && "h-11 px-8 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-10 w-10",
        size === "default" && "h-9 px-4 text-sm",
        variant === "default" && "bg-foreground text-background hover:opacity-90",
        variant === "accent" && "bg-accent text-accent-foreground hover:opacity-90",
        variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-muted",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
        className,
      )}
      {...props}
    />
  )
}