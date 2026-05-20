"use client"

import { useState, useEffect } from "react"
import PromptingIsAllYouNeed from "@/components/ui/animated-hero-section"
import NetflixIntro from "@/components/ui/netflix-intro"

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    setShowIntro(true)
  }, [])

  const handleIntroComplete = () => {
    setShowIntro(false)
    setIntroDone(true)
  }

  return (
    <>
      {showIntro && <NetflixIntro onComplete={handleIntroComplete} />}
      {(introDone || !showIntro) && <PromptingIsAllYouNeed />}
    </>
  )
}
