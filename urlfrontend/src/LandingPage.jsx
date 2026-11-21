import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Card from "./components/Card/Card";
import PlatformFeatures from "./components/Features/PlatformFeatures";
import AdditionalFeatures from "./components/Features/AdditionalFeatures";
import "./index.css";

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Card />
      <div id="features">
        <PlatformFeatures />
        <AdditionalFeatures />
      </div>
    </>
  );
}

export default LandingPage;