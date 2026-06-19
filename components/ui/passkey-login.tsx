"use client"

import { useState, useEffect } from "react"
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser"
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser"
import { Loader2, KeyRound } from "@/lib/lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    setSupportsWebAuthn(browserSupportsWebAuthn())
  }, [])

  const handleLoginWithPasskey = async () => {
    setIsAuthenticating(true)

    try {
      const challengeResponse = await fetch("/api/auth/login/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: "admin" }),
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

      let asseResp: AuthenticationResponseJSON
      try {
        asseResp = await startAuthentication({ optionsJSON: options })
      } catch (error: unknown) {
        const name = (error as { name?: string }).name
        if (name === "NotAllowedError") {
          throw new Error("User cancelled authentication")
        } else if (name === "InvalidStateError") {
          throw new Error("Authenticator is in an invalid state")
        } else {
          throw new Error("Biometric authentication failed")
        }
      }

      const verifyResponse = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ response: asseResp, challengeId }),
      })

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json()
        throw new Error(error.error || "Authentication verification failed")
      }

      onSuccess()
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string }).message || "Failed to authenticate with passkey"
      showToast?.(errorMessage, "error")
      onError?.(errorMessage)
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (!supportsWebAuthn) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-warning/30 bg-warning/15 p-4">
          <p className="text-sm text-warning">
            Your browser doesn&apos;t support passkeys. Please use a modern browser or try the password option.
          </p>
        </div>
        {onFallbackToPassword && (
          <Button
            variant="outline"
            onClick={onFallbackToPassword}
            className="w-full rounded-full uppercase tracking-[0.18em]"
          >
            Use Password Instead
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Button
        variant="accent"
        onClick={handleLoginWithPasskey}
        disabled={isAuthenticating}
        className={cn(
          "h-auto w-full justify-center gap-3 rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em]",
        )}
      >
        {isAuthenticating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Authenticating...
          </>
        ) : (
          <>
            <KeyRound className="h-5 w-5" />
            Login with Passkey
          </>
        )}
      </Button>

      {onFallbackToPassword && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onFallbackToPassword}
            disabled={isAuthenticating}
            className="w-full rounded-full uppercase tracking-[0.18em]"
          >
            Use Password Instead
          </Button>
        </>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Touch your fingerprint sensor, use Face ID, or insert your security key
      </p>
    </div>
  )
}