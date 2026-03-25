import * as React from "react"
import { cn } from "@/lib/utils"

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "ghost"
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
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-50",
        size === "lg" && "h-11 px-8 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-10 w-10",
        size === "default" && "h-9 px-4 text-sm",
        variant === "default" && "bg-white text-black hover:bg-white/90",
        variant === "outline" && "border border-white/25 bg-transparent text-white hover:bg-white/10",
        variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
        className,
      )}
      {...props}
    />
  )
}
