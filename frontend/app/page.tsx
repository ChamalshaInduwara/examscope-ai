import { auth } from "@/auth";
import { Navbar } from "@/components/landing/navbar";
import { HeroInteractive } from "@/components/landing/hero-interactive";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { PredictionRadar } from "@/components/landing/prediction-radar";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { TestimonialsAndFaq } from "@/components/landing/testimonials-and-faq";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-[#05070c] text-white font-sans selection:bg-[#00b4d8] selection:text-black">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-1">
        <HeroInteractive />
        <FeaturesGrid />
        <PredictionRadar />
        <ComparisonSection />
        <TestimonialsAndFaq />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}