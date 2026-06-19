import * as React from "react"

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number
}

function Icon({ children, size = 24, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </Icon>
)

export const ArrowLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </Icon>
)

export const ArrowUpRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </Icon>
)

export const BookOpen = (props: IconProps) => (
  <Icon {...props}>
    <path d="M2 5a2 2 0 0 1 2-2h6v16H4a2 2 0 0 1-2-2z" />
    <path d="M12 3h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
  </Icon>
)

export const Bot = (props: IconProps) => (
  <Icon {...props}>
    <rect x="4" y="7" width="16" height="12" rx="3" />
    <path d="M12 3v4" />
    <path d="M9 11h.01" />
    <path d="M15 11h.01" />
    <path d="M8 15h8" />
  </Icon>
)

export const BriefcaseBusiness = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    <path d="M3 12h18" />
  </Icon>
)

export const Calendar = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M3 9h18" />
  </Icon>
)

export const Check = (props: IconProps) => (
  <Icon {...props}>
    <path d="m20 6-11 11-5-5" />
  </Icon>
)

export const Clock = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Icon>
)

export const Code = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 18-6-6 6-6" />
    <path d="m15 6 6 6-6 6" />
  </Icon>
)

export const Copy = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
)

export const KeyRound = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="7.5" cy="15.5" r="3.5" />
    <path d="M11 12l7-7" />
    <path d="M15 8h3v3" />
  </Icon>
)

export const FileText = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h6" />
  </Icon>
)

export const FolderGit2 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <circle cx="10" cy="12" r="1.5" />
    <path d="M10 13.5v3" />
    <circle cx="15" cy="12" r="1.5" />
  </Icon>
)

export const Home = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v10h14V10" />
  </Icon>
)

export const Link = (props: IconProps) => (
  <Icon {...props}>
    <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
    <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 1 1-7-7l1-1" />
  </Icon>
)

export const Loader2 = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
  </Icon>
)

export const Mail = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
)

export const Trash = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
)

export const Moon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </Icon>
)

export const Sun = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m4.93 19.07 1.41-1.41" />
    <path d="m17.66 6.34 1.41-1.41" />
  </Icon>
)

export const MailPlus = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
    <path d="M18 11v6" />
    <path d="M15 14h6" />
  </Icon>
)

export const PenLine = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </Icon>
)

export const RefreshCw = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 0 1 15-6" />
    <path d="M18 6v4h-4" />
    <path d="M21 12a9 9 0 0 1-15 6" />
    <path d="M6 18v-4h4" />
  </Icon>
)

export const Search = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
)

export const MessageCircle = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.2 8.2 0 0 1-4-.98L3 20l1.04-5.5A8.2 8.2 0 0 1 3.5 11 8.4 8.4 0 0 1 12 2.5a8.4 8.4 0 0 1 9 9z" />
  </Icon>
)

export const SendHorizontal = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 12h14" />
    <path d="M14 5l7 7-7 7" />
  </Icon>
)

export const Send = (props: IconProps) => (
  <Icon {...props}>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </Icon>
)

export const Sparkles = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" />
    <path d="M5 3l.8 2.2L8 6l-2.2.8L5 9l-.8-2.2L2 6l2.2-.8Z" />
  </Icon>
)

export const SquareKanban = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="M15 4v16" />
  </Icon>
)

export const TerminalSquare = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3" />
    <path d="M13 15h4" />
  </Icon>
)

export const User = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </Icon>
)

export const X = (props: IconProps) => (
  <Icon {...props}>
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </Icon>
)

export const Zap = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Icon>
)
