import type { Metadata } from "next";
import LogisticsApp from "@/components/logistics/LogisticsApp";

export const metadata: Metadata = {
  title: "WarHaul — WARDOGS Logistics Calculator",
  description: "Compare Season 1 vs Season 2 logistics pay, delivery streaks, and whether to drive back or respawn.",
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Logistics · Season 1 vs Season 2</div>
        <h1>Supply run calculator</h1>
        <p>
          Season 2 cut base logistics pay but added delivery streaks. Plug in your own run times and cargo to see what you actually earn per hour,
          how fast you level, and whether driving back beats respawning at base.
        </p>
      </section>
      <LogisticsApp />
    </>
  );
}
