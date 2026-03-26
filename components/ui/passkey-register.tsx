"use client"

import { useState } from "react"
import { startRegistration } from "@simplewebauthn/browser"
import type { RegistrationResponseJSON } from "@simplewebauthn/browser"

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
      // Step 1: Get registration options from server
      const challengeResponse = await fetch("/api/auth/register/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: "admin",
          userName: "Admin User",
        }),
      })

      if (!challengeResponse.ok) {
        throw new Error("Failed to get registration challenge")
      }

      const { options, challengeId } = await challengeResponse.json()

      // Step 2: Prompt user for biometric authentication
      let attResp: RegistrationResponseJSON
      try {
        attResp = await startRegistration({ optionsJSON: options })
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          throw new Error("User cancelled passkey registration")
        } else if (error.name === "InvalidStateError") {
          throw new Error("This device is already registered")
        } else {
          throw new Error("Biometric authentication failed")
        }
      }

      // Step 3: Verify registration on server
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

      // Success!
      showToast?.(
        `Passkey registered successfully on ${deviceName}!`,
        "success"
      )
      setDeviceName("")
      onSuccess()
    } catch (error: any) {
      console.error("Passkey registration error:", error)
      const errorMessage = error.message || "Failed to register passkey"
      showToast?.(errorMessage, "error")
      onError?.(errorMessage)
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-4">
      {!showDeviceNameInput ? (
        <button
          onClick={() => setShowDeviceNameInput(true)}
          disabled={isRegistering}
          className="w-full rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg
            className="h-5 w-5"
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
          Register New Passkey
        </button>
      ) : (
        <div className="space-y-3 p-4 rounded-lg border border-white/10 bg-white/[0.03]">
          <div>
            <label
              htmlFor="deviceName"
              className="block text-xs font-semibold uppercase tracking-[0.18em] text-white/60 mb-2"
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
              className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
              disabled={isRegistering}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRegisterPasskey}
              disabled={isRegistering || !deviceName.trim()}
              className="flex-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                  Registering...
                </span>
              ) : (
                "Continue"
              )}
            </button>
            <button
              onClick={() => {
                setShowDeviceNameInput(false)
                setDeviceName("")
              }}
              disabled={isRegistering}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/60 transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-white/40 mt-2">
            You'll be prompted to use your fingerprint, Face ID, or security key
            to register this device.
          </p>
        </div>
      )}
    </div>
  )
}
