"use client";

import { useMemo } from "react";
import { oneOf, usePersistentState } from "@/lib/usePersistentState";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  RATES,
  fmt,
  fmtCash,
  fmtMin,
  grossTotal,
  runMinutes,
  series,
  streakMaxRuns,
  type Inputs,
  type Metric,
  type Mode,
  type Season,
  type Strategy,
} from "@/lib/logistics";
import { AXIS, GRID, TOOLTIP, kfmt } from "@/components/charts/chartTheme";
import { Segmented } from "./Controls";

interface LineDef {
  key: string;
  season: Season;
  strategy: Strategy;
  label: string;
  color: string;
  dashed: boolean;
}

const LINES: LineDef[] = [
  { key: "s3-rt", season: "s3", strategy: "driveBack", label: "Season 3 estimate — round trips", color: "var(--s3)", dashed: false },
  { key: "s2-rt", season: "s2", strategy: "driveBack", label: "Season 2 — round trips", color: "var(--s2)", dashed: false },
  { key: "s3-rs", season: "s3", strategy: "respawn", label: "Season 3 estimate — drop & respawn", color: "var(--s3)", dashed: true },
  { key: "s2-rs", season: "s2", strategy: "respawn", label: "Season 2 — drop & respawn", color: "var(--s2)", dashed: true },
];

function cargoText(inp: Inputs) {
  const parts = [
    inp.small ? `${inp.small} small crate${inp.small > 1 ? "s" : ""}` : "",
    inp.large ? `${inp.large} large crate${inp.large > 1 ? "s" : ""}` : "",
    inp.pallets ? `${inp.pallets} pallet${inp.pallets > 1 ? "s" : ""}` : "",
    inp.passengers ? `${inp.passengers} players` : "",
  ].filter(Boolean);
  return parts.join(" + ") || "no cargo";
}

/** X ticks on each round trip (0, 9, 18 …), thinned out if there would be too many. */
function tickList(session: number, step: number): number[] {
  const count = Math.floor(session / step);
  const every = Math.max(1, Math.ceil(count / 12));
  const out: number[] = [];
  for (let i = 0; i <= count; i += every) out.push(Math.round(i * step * 10) / 10);
  return out;
}

/** Round trips vs drop-off-and-respawn over one match, for ground vehicles. */
export default function StrategyChart({ mode, inp }: { mode: Mode; inp: Inputs }) {
  const [metric, setMetric] = usePersistentState<Metric>("warlogs-strategy-metric", "cash", oneOf<Metric>("cash", "xp"));
  const [show, setShow] = usePersistentState<"both" | "s3">("warlogs-strategy-seasons-v2", "both", oneOf<"both" | "s3">("both", "s3"));

  const d = useMemo(() => {
    const lines = LINES.filter((l) => show === "both" || l.season === "s3").map((l) => ({
      ...l,
      data: series(mode, inp, l.season, metric, l.strategy),
    }));
    const tot = {
      s2: { rt: grossTotal(mode, inp, "s2", "driveBack"), rs: grossTotal(mode, inp, "s2", "respawn") },
      s3: { rt: grossTotal(mode, inp, "s3", "driveBack"), rs: grossTotal(mode, inp, "s3", "respawn") },
    };
    return { lines, tot, rtMin: runMinutes(mode, inp, "driveBack"), rsMin: runMinutes(mode, inp, "respawn") };
  }, [mode, inp, metric, show]);

  const s3 = d.tot.s3;
  const cashGap = s3.rt.net - s3.rs.net; // + = round trips earn more cash
  const xpGap = s3.rt.xp - s3.rs.xp; // + = round trips earn more XP
  const trucksRespawn = s3.rs.runs; // you buy a truck every run when you abandon it

  let headline: string;
  let tone: "good" | "bad" | "" = "";
  if (cashGap >= 0 && xpGap >= 0) {
    headline = `Round trips win on both: ${fmtCash(cashGap)} more net cash and ${Math.round(xpGap).toLocaleString("en-US")} more XP per match.`;
    tone = "good";
  } else if (cashGap <= 0 && xpGap <= 0) {
    headline = `Respawning wins on both: ${fmtCash(-cashGap)} more net cash and ${Math.round(-xpGap).toLocaleString("en-US")} more XP per match.`;
    tone = "bad";
  } else if (xpGap < 0) {
    const per1k = cashGap / (-xpGap / 1000);
    headline = `Respawning gets ${Math.round(-xpGap).toLocaleString("en-US")} more XP but costs ${fmtCash(cashGap)} — about ${fmtCash(per1k)} per extra 1,000 XP.`;
  } else {
    headline = `Round trips get ${Math.round(xpGap).toLocaleString("en-US")} more XP, respawning ${fmtCash(-cashGap)} more cash.`;
  }

  const ends = d.lines
    .map((l) => ({ key: l.key, label: l.label, color: l.color, dashed: l.dashed, v: l.data[l.data.length - 1].v }))
    .sort((a, b) => b.v - a.v);
  const S = RATES.s3.streaks;
  const mx = streakMaxRuns(mode, inp, "driveBack");
  const xMax = Math.max(inp.sessionMin, d.rtMin, d.rsMin);

  return (
    <div className="panel">
      <div className="eyebrow" style={{ fontSize: 12 }}>Ground logistics · one match</div>
      <h3 style={{ fontSize: 26, textTransform: "uppercase", marginTop: 4 }}>Round trips vs drop & respawn</h3>
      <p className="sub" style={{ fontSize: 14 }}>
        {fmtMin(inp.sessionMin)} match • {fmtMin(d.rtMin)} round trips vs {fmtMin(d.rsMin)} drop-and-respawn • {cargoText(inp)} per truck
      </p>

      <p className={`strategy-headline ${tone}`}>{headline}</p>

      <div className="toolbar" style={{ justifyContent: "space-between", marginBottom: 8 }}>
        <Segmented
          label="Metric"
          value={metric}
          onChange={setMetric}
          options={[
            { value: "cash", label: "Net cash" },
            { value: "xp", label: "XP" },
          ]}
        />
        <Segmented
          label="Seasons"
          value={show}
          onChange={setShow}
          options={[
            { value: "both", label: "S2 + S3" },
            { value: "s3", label: "S3 only" },
          ]}
        />
      </div>

      <div className="strategy-grid">
        <div className="chart-box" style={{ height: 360 }}>
          <ResponsiveContainer>
            <LineChart margin={{ top: 10, right: 16, bottom: 26, left: 6 }}>
              <CartesianGrid {...GRID} vertical />
              <XAxis
                dataKey="t"
                type="number"
                domain={[0, xMax]}
                allowDuplicatedCategory={false}
                ticks={tickList(inp.sessionMin, d.rtMin)}
                {...AXIS}
                label={{ value: "Time into match (minutes)", position: "insideBottom", offset: -14, fill: "var(--muted)", fontSize: 12 }}
              />
              <YAxis
                {...AXIS}
                tickFormatter={(v: unknown) => (metric === "cash" ? (Number(v) < 0 ? "−$" : "$") + kfmt(Math.abs(Number(v))) : kfmt(v))}
                width={74}
                label={{
                  value: metric === "cash" ? "Net cash after truck + cargo" : "Total XP",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--muted)",
                  fontSize: 12,
                  dy: 70,
                }}
              />
              {metric === "cash" && <ReferenceLine y={0} stroke="var(--border-strong)" />}
              <Tooltip
                {...TOOLTIP}
                labelFormatter={(l: unknown) => `${String(l)} min in`}
                formatter={(v: unknown, name: unknown) => [fmt(Number(v), metric), String(name)]}
              />
              {d.lines.map((l) => (
                <Line
                  key={l.key}
                  data={l.data}
                  dataKey="v"
                  name={l.label}
                  type="linear"
                  stroke={l.color}
                  strokeWidth={l.dashed ? 2.5 : 3.5}
                  strokeDasharray={l.dashed ? "7 5" : undefined}
                  dot={{ r: l.dashed ? 2.5 : 3.5, fill: l.color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <ul className="end-values" aria-label="Totals at end of match">
          {ends.map((e) => (
            <li key={e.key}>
              <span className="swatch" style={{ borderTopColor: e.color, borderTopStyle: e.dashed ? "dashed" : "solid" }} />
              <span className="ev-label">{e.label}</span>
              <span className="ev-value" style={{ color: e.color }}>
                {fmt(e.v, metric)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tradeoff table */}
      <div className="table-wrap" style={{ marginTop: 14 }}>
        <table>
          <thead>
            <tr>
              <th>Strategy</th>
              <th className="n">Runs</th>
              <th className="n">XP</th>
              <th className="n">Gross cash</th>
              <th className="n">Trucks bought</th>
              <th className="n">Truck + cargo cost</th>
              <th className="n">Net cash</th>
              <th className="n">XP / hour</th>
              <th className="n">Net $ / hour</th>
            </tr>
          </thead>
          <tbody>
            {(["s3", "s2"] as Season[]).flatMap((season) =>
              (["rt", "rs"] as const).map((k) => {
                const t = d.tot[season][k];
                const trucks = k === "rt" ? 1 : t.runs;
                return (
                  <tr key={season + k}>
                    <td className={season === "s3" ? "s3c" : "s2c"}>
                      {RATES[season].label} — {k === "rt" ? "round trips" : "drop & respawn"}
                    </td>
                    <td className="n">{t.runs}</td>
                    <td className="n">{Math.round(t.xp).toLocaleString("en-US")}</td>
                    <td className="n">{fmtCash(t.gross)}</td>
                    <td className="n">{trucks}</td>
                    <td className="n no">−{fmtCash(t.spend)}</td>
                    <td className={`n ${t.net >= 0 ? "yes" : "no"}`} style={{ fontWeight: 700 }}>
                      {fmtCash(t.net)}
                    </td>
                    <td className="n">{Math.round((t.xp / t.endMin) * 60).toLocaleString("en-US")}</td>
                    <td className="n">{fmtCash((t.net / t.endMin) * 60)}</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>

      <div className="footnotes">
        <p>
          <b>
            MODELED STREAK BONUSES · Crates +{fmtCash(S.crate.cash)} / +{S.crate.xp} XP (max {S.crate.cap}) · Pallets +{fmtCash(S.pallet.cash)} / +{S.pallet.xp} XP (max {S.pallet.cap}) · Passengers +{fmtCash(S.player.cash)} / +{S.player.xp} XP (max {S.player.cap}) · Returns +{fmtCash(S.returnTrip.cash)} / +{S.returnTrip.xp} XP (max {S.returnTrip.cap})
            {mx.pallet != null || mx.ret != null
              ? ` · With ${inp.pallets} pallet${inp.pallets === 1 ? "" : "s"} per truck: ${[mx.pallet != null ? `pallets max on run ${mx.pallet}` : "", mx.ret != null ? `return trips max on run ${mx.ret}` : ""].filter(Boolean).join(", ")}`
              : ""}
          </b>
        </p>
        <p>
          Estimated Season 3 gross: round trips {fmtCash(s3.rt.gross)} | respawn {fmtCash(s3.rs.gross)}
          {inp.fobDeposit && inp.pallets > 0 ? `, including a ${fmtCash(inp.fobAmount)} FOB deposit award per pallet` : ""}. Net includes a {fmtCash(inp.vehicleCost)} truck — bought once for round trips,{" "}
          {trucksRespawn}× ({fmtCash(inp.vehicleCost * trucksRespawn)}) when you abandon it every run — plus cargo each run.
        </p>
        <p>
          Respawning skips the {fmt(RATES.s3.returnTrip.cash, "cash")} / {RATES.s3.returnTrip.xp} XP return trip and its streak
          {inp.deathResetsStreaks ? ", and (assumed) resets your delivery streak every run" : ""}. Streak sizes: crate +{fmtCash(S.crate.cash)}/level, return +{fmtCash(S.returnTrip.cash)}/level.
        </p>
        <p className="muted">
          Perfect runs (no losses). Season 3 estimates use the Season 2 baseline and your cash adjustments. Truck and cargo prices are your inputs. Change them under “Assumptions & costs”.
        </p>
      </div>
    </div>
  );
}
