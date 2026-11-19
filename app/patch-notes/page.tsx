import type { Metadata } from "next";
import PatchNotes from "@/components/PatchNotes";
import { SOURCE_URL } from "@/lib/patchNotes";

export const metadata: Metadata = {
  title: "Season 3 Patch Notes — WarLogs",
  description: "WARDOGS Season 03 patch notes sorted by category, with every change tagged as a buff, nerf, new, change or fix.",
};

export default function PatchNotesPage() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Season 03 · Live 12 November 2026</div>
        <h1>Patch notes, decoded</h1>
        <p>
          Browse the Season 3 launch changes by category, or filter by buff, nerf, new feature, change or fix.
        </p>
        <div className="meta">
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            Official notes on Steam ↗
          </a>
        </div>
      </section>
      <PatchNotes />
    </>
  );
}
