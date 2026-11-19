import type { Metadata } from "next";
import LogisticsApp from "@/components/logistics/LogisticsApp";

export const metadata: Metadata = {
  title: "Supply Run Calculator — WarLogs",
  description: "Estimate WARDOGS Season 3 supply and passenger earnings, compare Season 2 rates, and evaluate driving back versus respawning.",
};

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Logistics · Season 3</div>
        <h1>Supply run calculator</h1>
        <p>Estimate XP and cash for your route, build delivery streaks, and compare driving back with respawning at base.</p>
        <p className="sub">
          Season 3 pays less for lower-value crates and pallets dropped outside friendly FOBs. The patch notes give no exact payouts or new level thresholds.
          Estimates start with Season 2 reward and streak rates. Use “Season 3 cash adjustments” to model the reductions.
        </p>
      </section>
      <LogisticsApp />
    </>
  );
}
