"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CARGO_DROP_HEIGHTS, CATEGORIES, TAG_META, type Tag } from "@/lib/patchNotes";
import { AXIS, GRID, TOOLTIP } from "./chartTheme";

const SHORT: Record<string, string> = {
  launch: "Map & Modes",
  progression: "Progression",
  logistics: "Logistics",
  weapons: "Equipment",
  vehicles: "Vehicles",
  rewards: "Rewards",
  content: "Cosmetics",
  interface: "Interface",
  servers: "Servers",
  fixes: "Fixes",
};

const TAGS: Tag[] = ["buff", "nerf", "new", "change", "fix"];

const tally = CATEGORIES.map((category) => {
  const counts: Record<Tag, number> = { buff: 0, nerf: 0, new: 0, change: 0, fix: 0 };
  category.notes.forEach((note) => counts[note.tag]++);
  return { name: SHORT[category.id] ?? category.name, full: category.name, ...counts };
});

export default function OverviewCharts() {
  return (
    <div className="grid grid-2 section">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Season 3 at a glance</h3>
            <p className="sub">Tracked changes by category.</p>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer>
            <BarChart data={tally} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barCategoryGap={4}>
              <CartesianGrid {...GRID} horizontal={false} vertical />
              <XAxis type="number" {...AXIS} allowDecimals={false} />
              <YAxis type="category" dataKey="name" {...AXIS} width={90} interval={0} />
              <Tooltip {...TOOLTIP} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ""} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 13 }} />
              {TAGS.map((tag) => (
                <Bar key={tag} dataKey={tag} name={TAG_META[tag].label} stackId="changes" fill={`var(--${tag})`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Cargo drop heights</h3>
            <p className="sub">Approximate limits in meters. Speed also affects breakage.</p>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer>
            <BarChart data={CARGO_DROP_HEIGHTS} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
              <CartesianGrid {...GRID} horizontal={false} vertical />
              <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${v} m`} />
              <YAxis type="category" dataKey="name" {...AXIS} width={100} />
              <Tooltip {...TOOLTIP} formatter={(v: unknown, name: unknown) => [`~${v} m`, String(name)]} />
              <Legend verticalAlign="top" wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="s2" name="Season 2" fill="var(--s2)" barSize={16} />
              <Bar dataKey="s3" name="Season 3" fill="var(--s3)" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
