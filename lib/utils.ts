import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combine class names with `clsx` (conditional) and resolve Tailwind
 * conflicts with `tailwind-merge`. This is the standard shadcn/ui pattern.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
