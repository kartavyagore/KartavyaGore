"use client"

import dynamic from "next/dynamic"

/**
 * The admin surface is a heavy client component (passkey login, MFA,
 * AI studio). Loaded only on /recruiter/admin. Wrapped in a tiny
 * client component so we can use `next/dynamic` with `ssr: false`,
 * which Next 16 disallows inside Server Components.
 */
const RecruiterMode = dynamic(
  () => import("./recruiter-mode").then((m) => m.default),
  { ssr: false }
)

export function RecruiterAdminClient() {
  return <RecruiterMode />
}
