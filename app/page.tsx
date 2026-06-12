"use client"

import { useState } from "react"
import PromptingIsAllYouNeed from "@/components/ui/animated-hero-section"
import NetflixIntro from "@/components/ui/netflix-intro"

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)
  const [introDone, setIntroDone] = useState(false)

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
