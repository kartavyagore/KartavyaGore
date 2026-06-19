"use client"

import * as React from "react"
import {
  ArrowRight,
  Link as LinkIcon,
  Zap,
  Code,
  FileText,
  User,
  Clock,
} from "@/lib/lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimelineItem {
  id: number
  title: string
  date: string
  content: string
  category: string
  icon: React.ElementType
  relatedIds: number[]
  status: "completed" | "in-progress" | "pending"
  energy: number
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[]
}

const aboutTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Started Coding",
    date: "2022",
    content:
      "Began my journey in web development by learning HTML, CSS, and JavaScript, building small projects to understand fundamentals.",
    category: "Learning",
    icon: Code,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Built First Projects",
    date: "2023",
    content:
      "Developed full-stack projects using modern technologies, focusing on solving real-world problems and improving practical skills.",
    category: "Projects",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "Full Stack Development",
    date: "2024",
    content:
      "Worked with Next.js, Spring Boot, and Docker to build scalable applications and understand backend architecture and deployment.",
    category: "Growth",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 85,
  },
  {
    id: 4,
    title: "Founded LLP",
    date: "2025",
    content:
      "Started an LLP and began working with clients to design and deliver custom software solutions tailored to their business needs.",
    category: "Business",
    icon: User,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 95,
  },
  {
    id: 5,
    title: "Client Work & Scaling",
    date: "Present",
    content:
      "Actively building and deploying client projects, focusing on performance, scalability, and real-world impact.",
    category: "Work",
    icon: Clock,
    relatedIds: [4],
    status: "in-progress",
    energy: 90,
  },
]

const statusLabel: Record<TimelineItem["status"], string> = {
  completed: "COMPLETE",
  "in-progress": "IN PROGRESS",
  pending: "PENDING",
}

function RadialOrbitalTimeline({ timelineData }: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = React.useState<Record<number, boolean>>({})
  const [viewMode] = React.useState<"orbital">("orbital")
  const [rotationAngle, setRotationAngle] = React.useState<number>(0)
  const [autoRotate, setAutoRotate] = React.useState<boolean>(true)
  const [pulseEffect, setPulseEffect] = React.useState<Record<number, boolean>>({})
  const [centerOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [activeNodeId, setActiveNodeId] = React.useState<number | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const orbitRef = React.useRef<HTMLDivElement>(null)
  const nodeRefs = React.useRef<Record<number, HTMLDivElement | null>>({})

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({})
      setActiveNodeId(null)
      setPulseEffect({})
      setAutoRotate(true)
    }
  }

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId)
    return currentItem ? currentItem.relatedIds : []
  }

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return
    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId)
    const totalNodes = timelineData.length
    const targetAngle = (nodeIndex / totalNodes) * 360
    setRotationAngle(270 - targetAngle)
  }

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {}
      Object.keys(prev).forEach((key) => {
        const k = parseInt(key)
        if (k !== id) newState[k] = false
      })
      newState[id] = !prev[id]
      if (!prev[id]) {
        setActiveNodeId(id)
        setAutoRotate(false)
        const relatedItems = getRelatedItems(id)
        const newPulseEffect: Record<number, boolean> = {}
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true
        })
        setPulseEffect(newPulseEffect)
        centerViewOnNode(id)
      } else {
        setActiveNodeId(null)
        setAutoRotate(true)
        setPulseEffect({})
      }
      return newState
    })
  }

  React.useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval> | undefined
    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)))
      }, 50)
    }
    return () => {
      if (rotationTimer) clearInterval(rotationTimer)
    }
  }, [autoRotate, viewMode])

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360
    const radius = 200
    const radian = (angle * Math.PI) / 180
    const x = Number((radius * Math.cos(radian) + centerOffset.x).toFixed(3))
    const y = Number((radius * Math.sin(radian) + centerOffset.y).toFixed(3))
    const zIndex = Math.round(100 + 50 * Math.cos(radian))
    const opacity = Number(
      Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))).toFixed(6),
    )
    return { x, y, zIndex, opacity }
  }

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false
    return getRelatedItems(activeNodeId).includes(itemId)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      className="flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background"
    >
      <div className="relative flex h-full w-full max-w-4xl items-center justify-center">
        <div
          ref={orbitRef}
          className="absolute flex h-full w-full items-center justify-center"
          style={{
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          <div className="pointer-events-none absolute top-8 z-50 flex w-full flex-col items-center">
            <h1 className="font-archive bg-gradient-to-r from-foreground via-accent to-purple-500 bg-clip-text text-3xl font-extrabold tracking-wide text-transparent md:text-5xl">
              My Coding Journey
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
              Interactive orbital timeline
            </p>
          </div>

          <div className="absolute h-96 w-96 rounded-full border border-border" />

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length)
            const isExpanded = expandedItems[item.id]
            const isRelated = isRelatedToActive(item.id)
            const isPulsing = pulseEffect[item.id]
            const Icon = item.icon

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el
                }}
                className="absolute cursor-pointer transition-all duration-700"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleItem(item.id)
                }}
              >
                <div
                  className={cn(
                    "absolute -inset-1 rounded-full",
                    isPulsing && "animate-pulse duration-1000",
                  )}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(var(--accent-rgb, 59 130 246) / 0.2) 0%, rgba(var(--accent-rgb, 59 130 246) / 0) 70%)",
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div
                  data-status={item.status}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                    "border-border bg-surface text-foreground",
                    isExpanded &&
                      "scale-150 border-accent bg-accent text-accent-foreground shadow-lg",
                    isRelated && "animate-pulse border-accent/60 bg-accent-soft text-accent",
                  )}
                >
                  <Icon size={16} />
                </div>

                <div
                  className={cn(
                    "absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
                    isExpanded ? "scale-125 text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <Card className="absolute left-1/2 top-20 w-64 -translate-x-1/2 overflow-visible border-accent/40 bg-card shadow-2xl backdrop-blur-lg">
                    <div className="absolute -top-3 left-1/2 h-3 w-px -translate-x-1/2 bg-border" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="accent"
                          className="px-2 text-xs"
                        >
                          {statusLabel[item.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <CardTitle className="mt-2 text-sm">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-foreground/80">
                      <p>{item.content}</p>

                      <div className="mt-4 border-t border-border pt-3">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center">
                            <Zap size={10} className="mr-1" />
                            Energy Level
                          </span>
                          <span>{item.energy}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-purple-500"
                            style={{ width: `${item.energy}%` }}
                          />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <div className="mb-2 flex items-center">
                            <LinkIcon size={10} className="mr-1 text-muted-foreground" />
                            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Connected Nodes
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId)
                              return (
                                <Button
                                  key={relatedId}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 rounded-none px-2 py-0 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleItem(relatedId)
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} className="ml-1" />
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function RadialOrbitalTimelineSection() {
  return <RadialOrbitalTimeline timelineData={aboutTimelineData} />
}

export default RadialOrbitalTimeline
