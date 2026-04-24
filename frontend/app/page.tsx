import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { UploadSection } from "@/components/upload-section"
import { StatsBar } from "@/components/stats-bar"
import { PatternsSection } from "@/components/patterns-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-void">
      <Navbar />
      <HeroSection />
      <UploadSection />
      <StatsBar />
      <PatternsSection />
      <Footer />
    </main>
  )
}
