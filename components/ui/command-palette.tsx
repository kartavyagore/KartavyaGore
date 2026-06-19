"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  BriefcaseBusiness,
  FileText,
  FolderGit2,
  MailPlus,
  Search,
  TerminalSquare,
  User,
} from "@/lib/lucide-react"
import type { BlogPost } from "@/lib/blogs"

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
)

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
      clipRule="evenodd"
    />
  </svg>
)

const itemBase =
  "group flex cursor-pointer items-center rounded-xl px-3 py-3 text-sm text-foreground/80 aria-selected:bg-accent-soft aria-selected:text-foreground transition-colors"

const iconBase = "mr-3 h-4 w-4 shrink-0"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // macOS uses metaKey (Cmd). Windows uses ctrlKey (Ctrl).
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (open && blogs.length === 0) {
      fetch("/api/blogs")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.blogs) {
            setBlogs(data.blogs)
          }
        })
        .catch(console.error)
    }
  }, [open, blogs.length])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm sm:p-6"
      onClick={() => setOpen(false)}
    >
      <Command
        shouldFilter={true}
        className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b border-border px-4">
          <Search className={`${iconBase} text-muted-foreground`} />
          <Command.Input
            placeholder="Type a command or search..."
            autoFocus
            className="w-full bg-transparent py-4 text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />
        </div>
        <Command.List className="cmdk-list max-h-[50vh] overflow-y-auto p-2 scrollbar-thin sm:max-h-[60vh]">
          <Command.Empty className="py-10 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          <Command.Group heading="Pages" className="cmdk-group px-2 py-2 text-xs">
            <Command.Item
              onSelect={() => runCommand(() => router.push("/"))}
              className={itemBase}
            >
              <TerminalSquare className={`${iconBase} text-emerald-500`} />
              Home
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/about"))}
              className={itemBase}
            >
              <User className={`${iconBase} text-blue-500`} />
              About
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/projects"))}
              className={itemBase}
            >
              <FolderGit2 className={`${iconBase} text-purple-500`} />
              Projects
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/recruiter"))}
              className={itemBase}
            >
              <BriefcaseBusiness className={`${iconBase} text-cyan-500`} />
              Recruiter Mode
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push("/blogs"))}
              className={itemBase}
            >
              <FileText className={`${iconBase} text-orange-500`} />
              Insight Blogs
            </Command.Item>
          </Command.Group>

          {blogs.length > 0 && (
            <Command.Group heading="Blogs" className="cmdk-group mt-2 px-2 py-2 text-xs">
              {blogs.map((blog) => (
                <Command.Item
                  key={blog.slug}
                  value={blog.title}
                  onSelect={() => runCommand(() => router.push(`/blogs/${blog.slug}`))}
                  className={itemBase}
                >
                  <FileText className={`${iconBase} text-muted-foreground`} />
                  <span className="truncate">{blog.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group heading="Social" className="cmdk-group mt-2 px-2 py-2 text-xs">
            <Command.Item
              onSelect={() =>
                runCommand(() => window.open("https://github.com/kartavyagore", "_blank"))
              }
              className={itemBase}
            >
              <GithubIcon className={`${iconBase} text-muted-foreground`} />
              GitHub
            </Command.Item>
            <Command.Item
              onSelect={() =>
                runCommand(() =>
                  window.open("https://www.linkedin.com/in/kartavya-gore/", "_blank"),
                )
              }
              className={itemBase}
            >
              <LinkedinIcon className={`${iconBase} text-blue-500`} />
              LinkedIn
            </Command.Item>
            <Command.Item
              onSelect={() =>
                runCommand(() => {
                  navigator.clipboard.writeText("kartavyagore0@gmail.com")
                })
              }
              className={itemBase}
            >
              <MailPlus className={`${iconBase} text-rose-500`} />
              Copy Email
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="mt-auto flex items-center justify-between border-t border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Navigation Command Palette</p>
          <div className="flex gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              ↑↓ to navigate
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Enter to select
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Esc to close
            </span>
          </div>
        </div>
      </Command>
    </div>
  )
}