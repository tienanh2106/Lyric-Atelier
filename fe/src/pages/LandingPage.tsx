import { HeroSection } from '../components/landing/HeroSection';
import { ProductsSection } from '../components/landing/ProductsSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { PackagesSection } from '../components/landing/PackagesSection';
import { CTASection } from '../components/landing/CTASection';

export const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <HeroSection />
      <ProductsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PackagesSection />
      <CTASection />
    </div>
  );
};
