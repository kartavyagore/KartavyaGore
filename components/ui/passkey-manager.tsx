"use client"

import { useState, useEffect } from "react"
import { KeyRound, Loader2, Trash } from "@/lib/lucide-react"
import PasskeyRegister from "./passkey-register"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      void loadPasskeys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      !window.confirm(
        `Are you sure you want to delete the passkey for "${deviceName || "Unknown Device"}"?`,
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
          "success",
        )
        void loadPasskeys()
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
        <h3 className="text-lg font-semibold text-foreground">Manage Passkeys</h3>
        <Button
          variant="accent"
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="h-auto rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]"
        >
          {showRegisterForm ? "Cancel" : "+ Add Passkey"}
        </Button>
      </div>

      {showRegisterForm && (
        <div className="rounded-lg border border-accent/20 bg-accent-soft p-4">
          <PasskeyRegister
            onSuccess={() => {
              setShowRegisterForm(false)
              void loadPasskeys()
            }}
            showToast={showToast}
          />
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted px-4 py-8 text-center">
            <KeyRound className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No passkeys registered yet</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Add a passkey to enable quick biometric login
            </p>
          </div>
        ) : (
          passkeys.map((passkey) => (
            <div
              key={passkey.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted p-4 transition-colors hover:bg-muted/80"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-accent-soft p-2">
                  <KeyRound className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {passkey.deviceName || "Unknown Device"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(passkey.createdAt)} • Last used{" "}
                    {formatDate(passkey.lastUsedAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleDeletePasskey(passkey.id, passkey.deviceName)}
                className={cn(
                  "h-auto rounded-full border-danger/30 bg-danger/15 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-danger hover:bg-danger/20 hover:text-danger",
                )}
              >
                <Trash className="mr-1.5 h-3 w-3" />
                Delete
              </Button>
            </div>
          ))
        )}
      </div>

      {passkeys.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          You can use any of these passkeys to log in securely
        </p>
      )}
    </div>
  )
}