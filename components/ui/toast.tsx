"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning"

type ToastProps = {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const variantStyles: Record<ToastType, string> = {
  success: "border-success/40 bg-success/15 text-success",
  warning: "border-warning/40 bg-warning/15 text-warning",
  error: "border-danger/40 bg-danger/15 text-danger",
}

export function Toast({ message, type = "error", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      className={cn(
        "fixed right-6 top-6 z-50 max-w-md rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-xl",
        variantStyles[type],
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss notification"
          className="cursor-pointer text-lg leading-none opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

type ToastItem = { id: number; message: string; type: ToastType }

type ToastContainerProps = {
  toasts: ToastItem[]
  onRemove: (id: number) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((toast, index) => (
        <motion.div
          key={toast.id}
          style={{ top: `${24 + index * 80}px` }}
          className="fixed right-6 z-50"
          layout
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}