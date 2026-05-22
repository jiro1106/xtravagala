import { HeroSection } from "./HeroSection";
import { EventsSection } from "./EventsSection";
import { DestinationsSection } from "./DestinationsSection";
import { TrustSection } from "./TrustSection";
import { HostSection } from "./HostSection";
import { FinalCTASection } from "./FinalCTASection";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <EventsSection />
      <DestinationsSection />
      <TrustSection />
      <HostSection />
      <FinalCTASection />
    </>
  );
}
