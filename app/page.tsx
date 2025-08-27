import { HeroSection } from "@/components/hero-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { ScrollAnimations } from "@/components/scroll-animations"
// import PrescriptionFlow3D from "@/components/prescription-flow-3d"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollAnimations />
      {/* <PrescriptionFlow3D /> */}
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
