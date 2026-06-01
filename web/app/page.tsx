import ThemeToggle from "@/components/ThemeToggle";
import Intro from "@/components/Intro";
import ScrollHero from "@/components/ScrollHero";
import Vision from "@/components/Vision";
import Features from "@/components/Features";
import CTA from "@/components/CTA";
import AmbientScene from "@/components/AmbientSceneClient";

export default function Home() {
  return (
    <main className="relative">
      <AmbientScene />
      <ThemeToggle />

      <div className="relative z-10">
        <Intro />
        <ScrollHero />
        <Vision />
        <Features />
        <CTA />
      </div>
    </main>
  );
}
