"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CALIBRE_CUTS, CATEGORIES, XP_CURVE } from "@/lib/patchNotes";
import { AXIS, GRID, TOOLTIP, kfmt } from "./chartTheme";

const SHORT: Record<string, string> = {
  launch: "Launch",
  content: "New content",
  weather: "Rain",
  damage: "Damage/Armor",
  weapons: "Weapons",
  building: "Building",
  vehicles: "Vehicles",
  progression: "Progression",
  rewards: "Rewards",
  logistics: "Logistics",
  spotting: "Spotting",
  prices: "Prices",
  teams: "Factions",
  servers: "Servers/QoL",
  exploits: "Exploits",
};

export default function OverviewCharts() {
  const tally = CATEGORIES.map((c) => ({
    name: SHORT[c.id] ?? c.name,
    full: c.name,
    buff: c.notes.filter((n) => n.tag === "buff").length,
    nerf: c.notes.filter((n) => n.tag === "nerf").length,
    new: c.notes.filter((n) => n.tag === "new").length,
  }))
    .filter((d) => d.buff + d.nerf + d.new > 0)
    .sort((a, b) => b.buff + b.nerf + b.new - (a.buff + a.nerf + a.new));

  return (
    <div className="grid grid-2 section">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>XP needed per role level</h3>
            <p className="sub">Total XP to reach each level. Lower = faster.</p>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer>
            <LineChart data={XP_CURVE} margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="level" {...AXIS} label={{ value: "Role level", position: "insideBottom", offset: -14, fill: "var(--faint)", fontSize: 12 }} />
              <YAxis {...AXIS} tickFormatter={kfmt} width={52} />
              <Tooltip {...TOOLTIP} labelFormatter={(l) => `Level ${l}`} formatter={(v: unknown) => Number(v).toLocaleString("en-US") + " XP"} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="s1" name="Season 1" stroke="var(--s1)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="s2" name="Season 2" stroke="var(--s2)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Buffs vs nerfs by category</h3>
            <p className="sub">Count of changes we tagged in each area.</p>
          </div>
        </div>
        <div className="chart-box">
          <ResponsiveContainer>
            <BarChart data={tally} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }} barCategoryGap={4}>
              <CartesianGrid {...GRID} horizontal={false} vertical />
              <XAxis type="number" {...AXIS} allowDecimals={false} />
              <YAxis type="category" dataKey="name" {...AXIS} width={110} interval={0} />
              <Tooltip {...TOOLTIP} labelFormatter={(_, p) => (p?.[0]?.payload?.full as string) ?? ""} />
              <Legend verticalAlign="top" height={30} wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="buff" name="Buff" stackId="a" fill="var(--buff)" />
              <Bar dataKey="nerf" name="Nerf" stackId="a" fill="var(--nerf)" />
              <Bar dataKey="new" name="New" stackId="a" fill="var(--new)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel" style={{ gridColumn: "1 / -1" }}>
        <div className="panel-head">
          <div>
            <h3>Base damage cut by calibre</h3>
            <p className="sub">Applies to every gun and vehicle weapon using that round. Snipers get extra hit-location damage to compensate.</p>
          </div>
        </div>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={CALIBRE_CUTS} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }}>
              <CartesianGrid {...GRID} horizontal={false} vertical />
              <XAxis type="number" {...AXIS} domain={[0, 30]} tickFormatter={(v) => `−${v}%`} />
              <YAxis type="category" dataKey="name" {...AXIS} width={80} />
              <Tooltip {...TOOLTIP} formatter={(v: unknown) => `−${String(v)}% base damage`} />
              <Bar dataKey="cut" name="Damage cut" fill="var(--nerf)" radius={[0, 4, 4, 0]} barSize={22}>
                <LabelList dataKey="cut" position="right" formatter={(v: unknown) => `−${String(v)}%`} fill="var(--text)" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
