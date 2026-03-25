"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type ToastProps = {
  message: string
  type?: "success" | "error" | "warning"
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = "error", duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor =
    type === "success"
      ? "bg-green-500/20 border-green-500/40"
      : type === "warning"
        ? "bg-yellow-500/20 border-yellow-500/40"
        : "bg-red-500/20 border-red-500/40"

  const textColor = type === "success" ? "text-green-200" : type === "warning" ? "text-yellow-200" : "text-red-200"

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`fixed right-6 top-6 z-50 max-w-md rounded-lg border ${bgColor} px-4 py-3 shadow-2xl backdrop-blur-xl`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`text-lg leading-none ${textColor} opacity-70 transition-opacity hover:opacity-100`}
        >
          ×
        </button>
      </div>
    </motion.div>
  )
}

type ToastContainerProps = {
  toasts: Array<{ id: number; message: string; type: "success" | "error" | "warning" }>
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
          <Toast message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
        </motion.div>
      ))}
    </AnimatePresence>
  )
}
