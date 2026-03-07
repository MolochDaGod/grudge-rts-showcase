import Header from "@/components/header";
import Hero from "@/components/hero";
import ExpertiseLogos from "@/components/expertise-logos";
import Features from "@/components/features";
import VisualShowcase from "@/components/visual-showcase";
import BrandGallery from "@/components/brand-gallery";
import TechnologyStack from "@/components/technology-stack";
import Mission from "@/components/mission";
import Projects from "@/components/projects";
import GamingShowcase from "@/components/gaming-showcase";
import InvestmentPlatform from "@/components/investment-platform";
import WhiteLabelSolutions from "@/components/white-label-solutions";
import UpcomingProjects from "@/components/upcoming-projects";
import Services from "@/components/services";
import Team from "@/components/team";
import StoreSection from "@/components/store-section";
import SuperEngineShowcase from "@/components/super-engine-showcase";
import Pricing from "@/components/pricing";
import FAQ from "@/components/faq";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <SuperEngineShowcase />
      <ExpertiseLogos />
      <Features />
      <VisualShowcase />
      <BrandGallery />
      <TechnologyStack />
      <Mission />
      <Projects />
      <GamingShowcase />
      <InvestmentPlatform />
      <WhiteLabelSolutions />
      <UpcomingProjects />
      <Services />
      <Team />
      <StoreSection />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}
