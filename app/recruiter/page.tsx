import type { Metadata } from "next"
import RecruiterMode from "@/components/ui/recruiter-mode"

export const metadata: Metadata = {
  title: "Recruiter Mode | Kartavya Gore",
  description:
    "A recruiter-focused view of Kartavya Gore's portfolio with curated projects, key strengths, and direct contact links.",
}

export default function RecruiterPage() {
  return <RecruiterMode />
}
