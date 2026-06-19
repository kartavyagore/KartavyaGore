"use client"

import { useState } from "react"
import { startRegistration } from "@simplewebauthn/browser"
import type { RegistrationResponseJSON } from "@simplewebauthn/browser"
import { KeyRound, Loader2 } from "@/lib/lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PasskeyRegisterProps {
  onSuccess: () => void
  onError?: (error: string) => void
  showToast?: (message: string, type: "success" | "error") => void
}

export default function PasskeyRegister({
  onSuccess,
  onError,
  showToast,
}: PasskeyRegisterProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [deviceName, setDeviceName] = useState("")
  const [showDeviceNameInput, setShowDeviceNameInput] = useState(false)

  const handleRegisterPasskey = async () => {
    if (!deviceName.trim()) {
      setShowDeviceNameInput(true)
      return
    }

    setIsRegistering(true)
    setShowDeviceNameInput(false)

    try {
      const challengeResponse = await fetch("/api/auth/register/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: "admin", userName: "Admin User" }),
      })

      if (!challengeResponse.ok) {
        throw new Error("Failed to get registration challenge")
      }

      const { options, challengeId } = await challengeResponse.json()

      let attResp: RegistrationResponseJSON
      try {
        attResp = await startRegistration({ optionsJSON: options })
      } catch (error: unknown) {
        const name = (error as { name?: string }).name
        if (name === "NotAllowedError") {
          throw new Error("User cancelled passkey registration")
        } else if (name === "InvalidStateError") {
          throw new Error("This device is already registered")
        } else {
          throw new Error("Biometric authentication failed")
        }
      }

      const verifyResponse = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          response: attResp,
          challengeId,
          deviceName: deviceName.trim(),
        }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || "Registration verification failed")
      }

      showToast?.(
        `Passkey registered successfully on ${deviceName}!`,
        "success",
      )
      setDeviceName("")
      onSuccess()
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string }).message || "Failed to register passkey"
      showToast?.(errorMessage, "error")
      onError?.(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-4">
      {!showDeviceNameInput ? (
        <Button
          variant="accent"
          onClick={() => setShowDeviceNameInput(true)}
          disabled={isRegistering}
          className={cn(
            "h-auto w-full justify-center gap-2 rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em]",
          )}
        >
          <KeyRound className="h-5 w-5" />
          Register New Passkey
        </Button>
      ) : (
        <div className="space-y-3 rounded-lg border border-border bg-muted p-4">
          <div>
            <label
              htmlFor="deviceName"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
            >
              Device Name
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegisterPasskey()}
              placeholder="e.g., My Laptop, iPhone 15"
              autoFocus
              disabled={isRegistering}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="accent"
              onClick={handleRegisterPasskey}
              disabled={isRegistering || !deviceName.trim()}
              className="h-auto flex-1 rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]"
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </span>
              ) : (
                "Continue"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeviceNameInput(false)
                setDeviceName("")
              }}
              disabled={isRegistering}
              className="h-auto rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em]"
            >
              Cancel
            </Button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            You&apos;ll be prompted to use your fingerprint, Face ID, or security key to register this device.
          </p>
        </div>
      )}
    </div>
  )
}