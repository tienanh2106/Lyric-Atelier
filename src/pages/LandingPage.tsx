import Banner from '../components/Banner';
import { HeroSection } from '../components/landing/HeroSection';
import { PackagesSection } from '../components/landing/PackagesSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';

export const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="mx-auto w-full max-w-5xl p-6">
        <Banner />
        <HeroSection />
        <PackagesSection />
        <FeaturesSection />
      </div>
    </div>
  );
};
