"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Check, Loader2, SendHorizontal, X } from "@/lib/lucide-react";
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

  const iconMap = React.useMemo(
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

const SlideButton = React.forwardRef<HTMLButtonElement, SlideButtonProps>(
  ({ className, label = "Publish Blog", disabled = false, onSubmit }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [completed, setCompleted] = React.useState(false);
    const [status, setStatus] = React.useState<
      "idle" | "loading" | "success" | "error"
    >("idle");
    const dragHandleRef = React.useRef<HTMLDivElement | null>(null);

    const dragX = useMotionValue(0);
    const springX = useSpring(dragX, ANIMATION_CONFIG.spring);
    const dragProgress = useTransform(
      springX,
      [0, DRAG_CONSTRAINTS.right],
      [0, 1],
    );

    const handleDragStart = React.useCallback(() => {
      if (completed || disabled) return;
      setIsDragging(true);
    }, [completed, disabled]);

    const handleDragEnd = React.useCallback(async () => {
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

    const handleDrag = React.useCallback(
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
        aria-label={label}
        className={cn(
          "relative flex h-10 items-center justify-center rounded-full border border-border bg-surface no-swipe",
          className,
        )}
        data-no-swipe="true"
      >
        {!completed && (
          <motion.div
            style={{ width: adjustedWidth }}
            className="absolute inset-y-0 left-0 z-0 rounded-full bg-accent/30"
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
                  "shadow-button flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground drop-shadow-xl transition-transform hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                  isDragging && "scale-105",
                )}
              >
                <SendHorizontal className="size-4" />
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
                  "size-full flex items-center justify-center rounded-full bg-accent/20 text-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
