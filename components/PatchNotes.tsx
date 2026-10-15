"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, TAG_META, type Note, type Tag } from "@/lib/patchNotes";
import OverviewCharts from "@/components/charts/OverviewCharts";

const TAGS: Tag[] = ["buff", "nerf", "new", "change", "fix"];
const TAG_COLOR: Record<Tag, string> = {
  buff: "var(--buff)",
  nerf: "var(--nerf)",
  new: "var(--new)",
  change: "var(--change)",
  fix: "var(--fix)",
};

function fmtVal(v: number | string, unit?: Note["unit"]) {
  if (typeof v === "string") return v;
  const n = Math.abs(v).toLocaleString("en-US");
  const sign = v < 0 ? "−" : "";
  switch (unit) {
    case "$":
      return `${sign}$${n}`;
    case "XP":
      return `${sign}${n} XP`;
    case "%":
      return `${sign}${n}%`;
    case "s":
      return `${sign}${n}s`;
    case "lvl":
      return `Lvl ${sign}${n}`;
    default:
      return `${sign}${n}`;
  }
}

function Delta({ note }: { note: Note }) {
  const { from, to, unit } = note;
  if (to === undefined) return <div className="delta" />;
  // Percent changes with a 0 baseline are shown as a single value
  if (unit === "%" && from === 0 && typeof to === "number") {
    return (
      <div className="delta">
        <span className="to" style={{ color: to < 0 ? "var(--nerf)" : "var(--buff)" }}>
          {to > 0 ? "+" : ""}
          {fmtVal(to, unit)}
        </span>
      </div>
    );
  }
  if (from === undefined) {
    return (
      <div className="delta">
        <span className="to">{fmtVal(to, unit)}</span>
      </div>
    );
  }
  let pct: number | null = null;
  if (typeof from === "number" && typeof to === "number" && from !== 0 && unit !== "lvl") {
    pct = ((to - from) / Math.abs(from)) * 100;
  }
  const good = note.tag === "buff";
  const bad = note.tag === "nerf";
  return (
    <div className="delta">
      <span className="from">{fmtVal(from, unit)}</span>
      <span className="arrow">→</span>
      <span className="to" style={{ color: good ? "var(--buff)" : bad ? "var(--nerf)" : undefined }}>
        {fmtVal(to, unit)}
      </span>
      {pct !== null && (
        <span className={`pct ${good ? "up" : bad ? "down" : ""}`}>
          {pct > 0 ? "+" : ""}
          {Math.round(pct)}%
        </span>
      )}
    </div>
  );
}

export default function PatchNotes() {
  const [active, setActive] = useState<Set<Tag>>(new Set());
  const [q, setQ] = useState("");
  const stickyRef = useRef<HTMLDivElement>(null);

  // Keep category headers clear of the site header + sticky filter bar when jumping to them
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const apply = () => {
      const header = document.querySelector(".site-header") as HTMLElement | null;
      const offset = (header?.offsetHeight ?? 60) + el.offsetHeight + 16;
      document.documentElement.style.setProperty("--stick-offset", `${offset}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  const jumpTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const header = document.querySelector(".site-header") as HTMLElement | null;
    const sticky = stickyRef.current;
    const offset = (header?.offsetHeight ?? 60) + (sticky?.offsetHeight ?? 0) + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
  };

  const totals = useMemo(() => {
    const t: Record<Tag, number> = { buff: 0, nerf: 0, new: 0, change: 0, fix: 0 };
    CATEGORIES.forEach((c) => c.notes.forEach((n) => t[n.tag]++));
    return t;
  }, []);
  const all = Object.values(totals).reduce((a, b) => a + b, 0);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATEGORIES.map((c) => ({
      ...c,
      shown: c.notes.filter(
        (n) =>
          (active.size === 0 || active.has(n.tag)) &&
          (!needle || n.t.toLowerCase().includes(needle) || (n.why ?? "").toLowerCase().includes(needle) || c.name.toLowerCase().includes(needle)),
      ),
    })).filter((c) => c.shown.length > 0);
  }, [active, q]);

  const toggle = (t: Tag) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  return (
    <>
      {/* Headline tiles */}
      <div className="grid grid-4 section">
        <div className="stat accent">
          <div className="label">Level 20 now needs</div>
          <div className="value">111,500 XP</div>
          <div className="hint">was 250,000 — 55% quicker</div>
        </div>
        <div className="stat">
          <div className="label">.308 damage</div>
          <div className="value" style={{ color: "var(--nerf)" }}>
            −25%
          </div>
          <div className="hint">
            Also <b>7.62x54R −20%</b>, <b>7.62x39 −19%</b>, <b>.50 Cal −16%</b>
          </div>
        </div>
        <div className="stat">
          <div className="label">Logistics base pay</div>
          <div className="value" style={{ color: "var(--nerf)" }}>
            ½ cash
          </div>
          <div className="hint">but new streaks up to +$1,000 per crate</div>
        </div>
        <div className="stat">
          <div className="label">Changes tracked</div>
          <div className="value">{all}</div>
          <div className="hint">
            <span style={{ color: "var(--buff)" }}>{totals.buff} buffs</span> · <span style={{ color: "var(--nerf)" }}>{totals.nerf} nerfs</span> ·{" "}
            <span style={{ color: "var(--new)" }}>{totals.new} new</span>
          </div>
        </div>
      </div>

      <OverviewCharts />

      {/* Filters */}
      <div ref={stickyRef} className="panel section" style={{ position: "sticky", top: 68, zIndex: 20 }}>
        <div className="toolbar">
          <input className="search" placeholder="Search changes… e.g. helmet, crate, Havoc" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search changes" />
          {TAGS.map((t) => (
            <button key={t} className={`chip ${active.has(t) ? "on" : ""}`} onClick={() => toggle(t)} aria-pressed={active.has(t)}>
              <span className={`tag ${TAG_META[t].className}`} style={{ padding: "0 6px", border: 0, background: "none" }}>
                {TAG_META[t].label}
              </span>
              <span className="count">{totals[t]}</span>
            </button>
          ))}
          {(active.size > 0 || q) && (
            <button
              className="chip"
              onClick={() => {
                setActive(new Set());
                setQ("");
              }}
            >
              Clear
            </button>
          )}
        </div>
        <div className="cat-nav" style={{ marginTop: 10 }}>
          {filtered.map((c) => (
            <a key={c.id} href={`#${c.id}`} onClick={jumpTo(c.id)}>
              {c.icon} {c.name} <span className="mono muted">{c.shown.length}</span>
            </a>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <div className="empty">No changes match that filter.</div>}

      {filtered.map((c) => {
        const tally: Record<Tag, number> = { buff: 0, nerf: 0, new: 0, change: 0, fix: 0 };
        c.notes.forEach((n) => tally[n.tag]++);
        return (
          <section key={c.id} id={c.id} className="cat panel section">
            <div className="cat-head">
              <div className="cat-icon" aria-hidden>
                {c.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2>{c.name}</h2>
                <p className="sub">{c.blurb}</p>
                <div className="tally-bar" aria-hidden>
                  {TAGS.map((t) => (tally[t] ? <span key={t} style={{ width: `${(tally[t] / c.notes.length) * 100}%`, background: TAG_COLOR[t] }} /> : null))}
                </div>
              </div>
              <div className="cat-tally">
                {TAGS.filter((t) => tally[t]).map((t) => (
                  <span key={t} className={`tag ${TAG_META[t].className}`}>
                    {tally[t]} {TAG_META[t].label}
                  </span>
                ))}
              </div>
            </div>
            <ul className="notes">
              {c.shown.map((n, i) => (
                <li key={i} className="note">
                  <div>
                    <span className={`tag ${TAG_META[n.tag].className}`}>{TAG_META[n.tag].label}</span>
                  </div>
                  <div>
                    <div className="title">{n.t}</div>
                    {n.why && <div className="why">{n.why}</div>}
                  </div>
                  <Delta note={n} />
                </li>
              ))}
            </ul>
            {c.id === "logistics" && (
              <div className="logi-cta">
                <span>Is it better now? Depends how long you stay in the vehicle. Run the numbers for your own routes.</span>
                <Link href="/logistics" className="btn">
                  Open the logistics calculator →
                </Link>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
