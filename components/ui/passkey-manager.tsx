"use client"

import { useState, useEffect } from "react"
import PasskeyRegister from "./passkey-register"

interface PasskeyCredential {
  id: string
  deviceName: string | null
  createdAt: string
  lastUsedAt: string | null
}

interface PasskeyManagerProps {
  isAuthenticated: boolean
  showToast?: (message: string, type: "success" | "error") => void
}

export default function PasskeyManager({
  isAuthenticated,
  showToast,
}: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadPasskeys()
    }
  }, [isAuthenticated])

  const loadPasskeys = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/passkeys", { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setPasskeys(data.passkeys || [])
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        showToast?.(data.error || "Failed to load passkeys", "error")
      }
    } catch (error) {
      console.error("Failed to load passkeys:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePasskey = async (id: string, deviceName: string | null) => {
    if (
      !confirm(
        `Are you sure you want to delete the passkey for "${deviceName || "Unknown Device"}"?`
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/auth/passkeys?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        showToast?.(
          `Passkey for ${deviceName || "device"} deleted successfully`,
          "success"
        )
        loadPasskeys()
      } else {
        throw new Error("Failed to delete passkey")
      }
    } catch (error) {
      console.error("Delete passkey error:", error)
      showToast?.("Failed to delete passkey", "error")
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Manage Passkeys</h3>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/20"
        >
          {showRegisterForm ? "Cancel" : "+ Add Passkey"}
        </button>
      </div>

      {showRegisterForm && (
        <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
          <PasskeyRegister
            onSuccess={() => {
              setShowRegisterForm(false)
              loadPasskeys()
            }}
            showToast={showToast}
          />
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-300"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-lg border border-white/10 bg-white/[0.03]">
            <svg
              className="h-12 w-12 text-white/20 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p className="text-sm text-white/60">No passkeys registered yet</p>
            <p className="text-xs text-white/40 mt-1">
              Add a passkey to enable quick biometric login
            </p>
          </div>
        ) : (
          passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <svg
                    className="h-5 w-5 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {passkey.deviceName || "Unknown Device"}
                  </p>
                  <p className="text-xs text-white/40">
                    Added {formatDate(passkey.createdAt)} •{" "}
                    Last used {formatDate(passkey.lastUsedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  handleDeletePasskey(passkey.id, passkey.deviceName)
                }
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-red-300 transition-all hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {passkeys.length > 0 && (
        <p className="text-xs text-white/40 text-center">
          You can use any of these passkeys to log in securely
        </p>
      )}
    </div>
  )
}
