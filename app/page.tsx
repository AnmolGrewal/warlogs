import PatchNotes from "@/components/PatchNotes";
import { SOURCE_URL } from "@/lib/patchNotes";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="eyebrow">Season 02 · Live 15 October 2026</div>
        <h1>Patch notes, decoded</h1>
        <p>
          The full Season 2 changelog sorted into categories, with every change tagged as a buff, nerf, new, change or fix — so you can see at a glance
          what got better and what got worse.
        </p>
        <div className="meta">
          <span>Maintenance: 08:00–09:30 UTC (1:00–2:30 AM Pacific)</span>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer">
            Official notes on Steam ↗
          </a>
        </div>
      </section>
      <PatchNotes />
    </>
  );
}
