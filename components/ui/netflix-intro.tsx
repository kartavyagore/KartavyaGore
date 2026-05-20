"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NetflixIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<"zoom" | "flash" | "done">("zoom");
  const [targetScale, setTargetScale] = useState(10);

  useEffect(() => {
    const updateScale = () => {
      const baseWidth = 600;
      const scale = window.innerWidth / baseWidth;
      setTargetScale(scale * 1.2);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
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

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
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
              className="w-[600px] max-w-[90vw] select-none pointer-events-none"
              draggable={false}
            />
          </motion.div>

          {phase === "flash" && (
            <motion.div
              className="absolute inset-0 bg-white z-20 pointer-events-none"
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
