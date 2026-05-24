"use client";

import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, Loader2, SendHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";

const DRAG_CONSTRAINTS = { left: 0, right: 155 };
const DRAG_THRESHOLD = 0.9;

const BUTTON_STATES = {
  initial: { width: "12rem" },
  completed: { width: "8rem" },
};

const ANIMATION_CONFIG = {
  spring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 40,
    mass: 0.8,
  },
};

type SlideButtonProps = {
  className?: string;
  label?: string;
  disabled?: boolean;
  onSubmit: () => Promise<boolean>;
};

type StatusIconProps = {
  status: "loading" | "success" | "error" | "idle";
};

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  if (status === "idle") return null;

  const iconMap: Record<"loading" | "success" | "error", JSX.Element> = useMemo(
    () => ({
      loading: <Loader2 className="animate-spin" size={20} />,
      success: <Check size={20} />,
      error: <X size={20} />,
    }),
    [],
  );

  return (
    <motion.div
      key={crypto.randomUUID()}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      {iconMap[status]}
    </motion.div>
  );
};

const SlideButton = forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ className, label = "Publish Blog", disabled = false, onSubmit }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [status, setStatus] = useState<
      "idle" | "loading" | "success" | "error"
    >("idle");
    const dragHandleRef = useRef<HTMLDivElement | null>(null);

    const dragX = useMotionValue(0);
    const springX = useSpring(dragX, ANIMATION_CONFIG.spring);
    const dragProgress = useTransform(
      springX,
      [0, DRAG_CONSTRAINTS.right],
      [0, 1],
    );

    const handleDragStart = useCallback(() => {
      if (completed || disabled) return;
      setIsDragging(true);
    }, [completed, disabled]);

    const handleDragEnd = useCallback(async () => {
      if (completed || disabled) return;
      setIsDragging(false);

      const progress = dragProgress.get();
      if (progress >= DRAG_THRESHOLD) {
        setCompleted(true);
        setStatus("loading");
        const success = await onSubmit();
        setStatus(success ? "success" : "error");
      } else {
        dragX.set(0);
      }
    }, [completed, disabled, dragProgress, dragX, onSubmit]);

    const handleDrag = useCallback(
      (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (completed || disabled) return;
        const newX = Math.max(
          0,
          Math.min(info.offset.x, DRAG_CONSTRAINTS.right),
        );
        dragX.set(newX);
      },
      [completed, disabled, dragX],
    );

    const adjustedWidth = useTransform(springX, (x) => x + 10);

    return (
      <motion.div
        animate={completed ? BUTTON_STATES.completed : BUTTON_STATES.initial}
        transition={ANIMATION_CONFIG.spring}
        className="relative flex h-10 items-center justify-center rounded-full border border-white/20 bg-white/5 no-swipe"
        data-no-swipe="true"
      >
        {!completed && (
          <motion.div
            style={{
              width: adjustedWidth,
            }}
            className="absolute inset-y-0 left-0 z-0 rounded-full bg-white/15"
          />
        )}
        <AnimatePresence>
          {!completed && (
            <motion.div
              ref={dragHandleRef}
              drag="x"
              dragConstraints={DRAG_CONSTRAINTS}
              dragElastic={0.05}
              dragMomentum={false}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrag={handleDrag}
              style={{ x: springX }}
              className="absolute left-0 z-10 flex cursor-grab items-center justify-start active:cursor-grabbing"
            >
              <button
                ref={ref}
                type="button"
                disabled={status === "loading" || disabled}
                className={cn(
                  "shadow-button rounded-full drop-shadow-xl h-9 w-9 flex items-center justify-center bg-white/30 hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed",
                  isDragging && "scale-105 transition-transform",
                )}
              >
                <SendHorizontal className="size-4 text-white" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {completed && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                ref={ref}
                type="button"
                disabled={status === "loading"}
                className={cn(
                  "size-full rounded-full transition-all duration-300 bg-white/20 flex items-center justify-center",
                  className,
                )}
              >
                <AnimatePresence mode="wait">
                  <StatusIcon status={status} />
                </AnimatePresence>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

SlideButton.displayName = "SlideButton";

export { SlideButton };
