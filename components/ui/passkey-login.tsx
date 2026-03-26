"use client"

import { useState, useEffect } from "react"
import { startAuthentication } from "@simplewebauthn/browser"
import { browserSupportsWebAuthn } from "@simplewebauthn/browser"
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser"

interface PasskeyLoginProps {
  onSuccess: () => void
  onError?: (error: string) => void
  onFallbackToPassword?: () => void
  showToast?: (message: string, type: "success" | "error") => void
}

export default function PasskeyLogin({
  onSuccess,
  onError,
  onFallbackToPassword,
  showToast,
}: PasskeyLoginProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [supportsWebAuthn, setSupportsWebAuthn] = useState(true)

  useEffect(() => {
    // Check browser support
    setSupportsWebAuthn(browserSupportsWebAuthn())
  }, [])

  const handleLoginWithPasskey = async () => {
    setIsAuthenticating(true)

    try {
      // Step 1: Get authentication options from server
      const challengeResponse = await fetch("/api/auth/login/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: "admin",
        }),
      })

      if (!challengeResponse.ok) {
        if (challengeResponse.status === 404) {
          throw new Error("No passkeys registered. Please register a passkey first.")
        }
        const payload = (await challengeResponse.json().catch(() => ({}))) as {
          error?: string
        }
        throw new Error(payload.error || "Failed to get authentication challenge")
      }

      const { options, challengeId } = await challengeResponse.json()

      // Step 2: Prompt user for biometric authentication
      let asseResp: AuthenticationResponseJSON
      try {
        asseResp = await startAuthentication({ optionsJSON: options })
      } catch (error: any) {
        if (error.name === "NotAllowedError") {
          throw new Error("User cancelled authentication")
        } else if (error.name === "InvalidStateError") {
          throw new Error("Authenticator is in an invalid state")
        } else {
          throw new Error("Biometric authentication failed")
        }
      }

      // Step 3: Verify authentication on server
      const verifyResponse = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          response: asseResp,
          challengeId,
        }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || "Authentication verification failed")
      }

      // Success!
      showToast?.("Logged in successfully with passkey!", "success")
      onSuccess()
    } catch (error: any) {
      console.error("Passkey authentication error:", error)
      const errorMessage = error.message || "Failed to authenticate with passkey"
      showToast?.(errorMessage, "error")
      onError?.(errorMessage)
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (!supportsWebAuthn) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-300">
            Your browser doesn't support passkeys. Please use a modern browser or try the password option.
          </p>
        </div>
        {onFallbackToPassword && (
          <button
            onClick={onFallbackToPassword}
            className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/80 transition-all hover:bg-white/10"
          >
            Use Password Instead
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleLoginWithPasskey}
        disabled={isAuthenticating}
        className="w-full rounded-full border border-blue-500/30 bg-blue-500/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300 transition-all hover:bg-blue-500/20 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isAuthenticating ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
            Authenticating...
          </>
        ) : (
          <>
            <svg
              className="h-6 w-6"
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
            Login with Passkey
          </>
        )}
      </button>

      {onFallbackToPassword && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-white/40">Or</span>
          </div>
        </div>
      )}

      {onFallbackToPassword && (
        <button
          onClick={onFallbackToPassword}
          disabled={isAuthenticating}
          className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/60 transition-all hover:bg-white/10 hover:text-white/80 disabled:opacity-50"
        >
          Use Password Instead
        </button>
      )}

      <p className="text-xs text-white/40 text-center mt-4">
        Touch your fingerprint sensor, use Face ID, or insert your security key
      </p>
    </div>
  )
}
