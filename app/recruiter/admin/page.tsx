import { Breadcrumb, CloseButton, ThemeToggle, Wordmark } from "@/components/chrome"
import { RecruiterAdminClient } from "@/components/ui/recruiter-admin-client"

export default function RecruiterAdminPage() {
  return (
    <div className="kg-recruiter">
      {/* Editorial chrome overlay on top of the admin surface so the
          user can always go home and toggle the theme. */}
      <div className="kg-chrome">
        <Wordmark />
        <CloseButton to="/recruiter" />
      </div>
      <div className="kg-chrome-bottom">
        <Breadcrumb path="/recruiter/admin" />
        <ThemeToggle />
      </div>
      <RecruiterAdminClient />
    </div>
  )
}
