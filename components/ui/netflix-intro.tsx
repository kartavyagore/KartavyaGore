"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NetflixIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = React.useState<"zoom" | "flash" | "done">("zoom");
  const [targetScale, setTargetScale] = React.useState(10);

  React.useEffect(() => {
    const updateScale = () => {
      const baseWidth = 600;
      const scale = window.innerWidth / baseWidth;
      setTargetScale(scale * 1.2);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  React.useEffect(() => {
    // Respect reduced motion: skip the intro entirely.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    audioRef.current = new Audio("/netflix-intro.mp3");
    audioRef.current.volume = 1.0;

    const playAudio = async () => {
      try {
        await audioRef.current?.play();
      } catch {
        // Browser blocked autoplay - audio will be silent
      }
    };
    playAudio();

    const zoomTimer = setTimeout(() => setPhase("flash"), 3500);
    const doneTimer = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 4300);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(doneTimer);
      audioRef.current?.pause();
    };
  }, [onComplete]);

  // The NetflixIntro is intentionally cinematic and not theme-driven —
  // a black backdrop and white flash are part of the brand moment.
  return (
    <AnimatePresence>
      {phase !== "done" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={
              phase === "zoom"
                ? { scale: targetScale, opacity: 1 }
                : { scale: targetScale * 1.5, opacity: 0 }
            }
            transition={
              phase === "zoom"
                ? { duration: 3.5, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.8, ease: "easeIn" }
            }
          >
            <img
              src="/KartavyaLogoBgRmvd.png"
              alt="Kartavya"
              className="pointer-events-none w-[600px] max-w-[90vw] select-none"
              draggable={false}
            />
          </motion.div>

          {phase === "flash" && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-20 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, times: [0, 0.2, 1] }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}