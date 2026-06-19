"use client"

import * as React from "react"
import { Search } from "@/lib/lucide-react"
import { cn } from "@/lib/utils"

// The Pong canvas uses hardcoded hex colors because Canvas 2D ignores CSS
// custom properties. This is the only place in the design system where we
// retain non-token colors — it's a deliberate brand moment, not a
// themeable surface.
const COLOR = "#FFFFFF"
const HIT_COLOR = "#333333"
const BACKGROUND_COLOR = "#000000"
const BALL_COLOR = "#FFFFFF"
const PADDLE_COLOR = "#FFFFFF"
const LETTER_SPACING = 1
const WORD_SPACING = 3

const PIXEL_MAP = {
  P: [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  R: [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  O: [
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  K: [
    [1, 0, 0, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 0],
    [1, 0, 0, 1],
  ],
  N: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  G: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  S: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  A: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
  ],
  L: [
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  U: [
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 1],
  ],
  D: [
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  F: [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
  ],
  V: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
}

interface Pixel {
  x: number
  y: number
  size: number
  hit: boolean
}

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
}

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  targetY: number
  isVertical: boolean
}

export function PromptingIsAllYouNeed() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const pixelsRef = React.useRef<Pixel[]>([])
  const ballRef = React.useRef<Ball>({ x: 0, y: 0, dx: 0, dy: 0, radius: 0 })
  const paddlesRef = React.useRef<Paddle[]>([])
  const scaleRef = React.useRef(1)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Honor reduced motion: render the static pixel text once, no animation.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      scaleRef.current = Math.min(canvas.width / 1000, canvas.height / 1000)
      initializeGame()
    }

    const initializeGame = () => {
      const scale = scaleRef.current
      const LARGE_PIXEL_SIZE = 8 * scale
      const SMALL_PIXEL_SIZE = 4 * scale
      const BALL_SPEED = 6 * scale

      pixelsRef.current = []
      const words = ["KARTAVYA DATTA GORE", "SOFTWARE ENGINEER"]

      const calculateWordWidth = (word: string, pixelSize: number) => {
        return (
          word.split("").reduce((width, letter) => {
            const letterWidth = PIXEL_MAP[letter as keyof typeof PIXEL_MAP]?.[0]?.length ?? 0
            return width + letterWidth * pixelSize + LETTER_SPACING * pixelSize
          }, 0) -
          LETTER_SPACING * pixelSize
        )
      }

      const calculateLineWidth = (line: string, pixelSize: number) => {
        return line.split(" ").reduce((width, word, index) => {
          return width + calculateWordWidth(word, pixelSize) + (index > 0 ? WORD_SPACING * pixelSize : 0)
        }, 0)
      }

      const totalWidthLarge = calculateLineWidth(words[0], LARGE_PIXEL_SIZE)
      const totalWidthSmall = calculateLineWidth(words[1], SMALL_PIXEL_SIZE)
      const totalWidth = Math.max(totalWidthLarge, totalWidthSmall)
      const scaleFactor = (canvas.width * 0.8) / totalWidth

      const adjustedLargePixelSize = LARGE_PIXEL_SIZE * scaleFactor
      const adjustedSmallPixelSize = SMALL_PIXEL_SIZE * scaleFactor

      const largeTextHeight = 5 * adjustedLargePixelSize
      const smallTextHeight = 5 * adjustedSmallPixelSize
      const spaceBetweenLines = 5 * adjustedLargePixelSize
      const totalTextHeight = largeTextHeight + spaceBetweenLines + smallTextHeight

      let startY = (canvas.height - totalTextHeight) / 2

      words.forEach((word, wordIndex) => {
        const pixelSize = wordIndex === 0 ? adjustedLargePixelSize : adjustedSmallPixelSize
        const currentLineWidth = calculateLineWidth(word, pixelSize)

        let startX = (canvas.width - currentLineWidth) / 2

        word.split(" ").forEach((subWord, subWordIndex, allWords) => {
          subWord.split("").forEach((letter) => {
            const pixelMap = PIXEL_MAP[letter as keyof typeof PIXEL_MAP]
            if (!pixelMap) return

            for (let i = 0; i < pixelMap.length; i++) {
              for (let j = 0; j < pixelMap[i].length; j++) {
                if (pixelMap[i][j]) {
                  const x = startX + j * pixelSize
                  const y = startY + i * pixelSize
                  pixelsRef.current.push({ x, y, size: pixelSize, hit: false })
                }
              }
            }
            startX += (pixelMap[0].length + LETTER_SPACING) * pixelSize
          })
          if (subWordIndex < allWords.length - 1) {
            startX += WORD_SPACING * pixelSize
          }
        })
        startY += wordIndex === 0 ? largeTextHeight + spaceBetweenLines : 0
      })

      const ballStartX = canvas.width * 0.9
      const ballStartY = canvas.height * 0.1

      ballRef.current = {
        x: ballStartX,
        y: ballStartY,
        dx: prefersReducedMotion ? 0 : -BALL_SPEED,
        dy: prefersReducedMotion ? 0 : BALL_SPEED,
        radius: adjustedLargePixelSize / 2,
      }

      const paddleWidth = adjustedLargePixelSize
      const paddleLength = 10 * adjustedLargePixelSize

      paddlesRef.current = [
        {
          x: 0,
          y: canvas.height / 2 - paddleLength / 2,
          width: paddleWidth,
          height: paddleLength,
          targetY: canvas.height / 2 - paddleLength / 2,
          isVertical: true,
        },
        {
          x: canvas.width - paddleWidth,
          y: canvas.height / 2 - paddleLength / 2,
          width: paddleWidth,
          height: paddleLength,
          targetY: canvas.height / 2 - paddleLength / 2,
          isVertical: true,
        },
        {
          x: canvas.width / 2 - paddleLength / 2,
          y: 0,
          width: paddleLength,
          height: paddleWidth,
          targetY: canvas.width / 2 - paddleLength / 2,
          isVertical: false,
        },
        {
          x: canvas.width / 2 - paddleLength / 2,
          y: canvas.height - paddleWidth,
          width: paddleLength,
          height: paddleWidth,
          targetY: canvas.width / 2 - paddleLength / 2,
          isVertical: false,
        },
      ]
    }

    const updateGame = () => {
      const ball = ballRef.current
      const paddles = paddlesRef.current

      ball.x += ball.dx
      ball.y += ball.dy

      if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy
      }
      if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.dx = -ball.dx
      }

      paddles.forEach((paddle) => {
        if (paddle.isVertical) {
          if (
            ball.x - ball.radius < paddle.x + paddle.width &&
            ball.x + ball.radius > paddle.x &&
            ball.y > paddle.y &&
            ball.y < paddle.y + paddle.height
          ) {
            ball.dx = -ball.dx
          }
        } else {
          if (
            ball.y - ball.radius < paddle.y + paddle.height &&
            ball.y + ball.radius > paddle.y &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width
          ) {
            ball.dy = -ball.dy
          }
        }
      })

      paddles.forEach((paddle) => {
        if (paddle.isVertical) {
          paddle.targetY = ball.y - paddle.height / 2
          paddle.targetY = Math.max(0, Math.min(canvas.height - paddle.height, paddle.targetY))
          paddle.y += (paddle.targetY - paddle.y) * 0.1
        } else {
          paddle.targetY = ball.x - paddle.width / 2
          paddle.targetY = Math.max(0, Math.min(canvas.width - paddle.width, paddle.targetY))
          paddle.x += (paddle.targetY - paddle.x) * 0.1
        }
      })

      pixelsRef.current.forEach((pixel) => {
        if (
          !pixel.hit &&
          ball.x + ball.radius > pixel.x &&
          ball.x - ball.radius < pixel.x + pixel.size &&
          ball.y + ball.radius > pixel.y &&
          ball.y - ball.radius < pixel.y + pixel.size
        ) {
          pixel.hit = true
          const centerX = pixel.x + pixel.size / 2
          const centerY = pixel.y + pixel.size / 2
          if (Math.abs(ball.x - centerX) > Math.abs(ball.y - centerY)) {
            ball.dx = -ball.dx
          } else {
            ball.dy = -ball.dy
          }
        }
      })
    }

    const drawGame = () => {
      ctx.fillStyle = BACKGROUND_COLOR
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      pixelsRef.current.forEach((pixel) => {
        ctx.fillStyle = pixel.hit ? HIT_COLOR : COLOR
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size)
      })

      ctx.fillStyle = BALL_COLOR
      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = PADDLE_COLOR
      paddlesRef.current.forEach((paddle) => {
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height)
      })
    }

    let animationFrame = 0
    const gameLoop = () => {
      updateGame()
      drawGame()
      animationFrame = requestAnimationFrame(gameLoop)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    if (!prefersReducedMotion) {
      gameLoop()
    } else {
      drawGame()
    }

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  const handleOpenPalette = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      ctrlKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 h-full w-full"
        aria-label="Prompting Is All You Need: Fullscreen Pong game with pixel text"
      />
      <button
        type="button"
        onClick={handleOpenPalette}
        aria-label="Open command menu"
        className={cn(
          "fixed top-6 left-1/2 z-10 -translate-x-1/2 group",
          "flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3.5 py-1.5",
          "cursor-pointer select-none shadow-lg backdrop-blur-md",
          "transition-all duration-300 active:scale-95",
          "hover:border-accent/40 hover:bg-surface/90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {/* Mobile View: Clean Touch Button */}
        <span className="flex items-center gap-1.5 px-1 py-0.5 text-xs text-muted-foreground transition-colors group-hover:text-foreground sm:hidden">
          <Search className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
          <span>Open Command Menu</span>
        </span>

        {/* Desktop View: Keyboard Shortcut Pill */}
        <span className="hidden font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground sm:flex sm:items-center sm:gap-1.5">
          <span className="transition-transform duration-300 group-hover:-translate-x-0.5">
            Press
          </span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-foreground/70 transition-colors group-hover:bg-muted group-hover:text-foreground">
            ⌘ K
          </kbd>
          <span className="text-[9px] text-muted-foreground/60">or</span>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] font-medium text-foreground/70 transition-colors group-hover:bg-muted group-hover:text-foreground">
            Ctrl K
          </kbd>
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            to navigate
          </span>
        </span>
      </button>
    </>
  )
}

export default PromptingIsAllYouNeed