"use client";

import { useMemo } from "react";
import { oneOf, usePersistentState } from "@/lib/usePersistentState";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  breakEven,
  breakEvenCurve,
  effectiveStrategy,
  fmt,
  fmtCash,
  fmtMin,
  levelText,
  streakMaxRuns,
  isAir,
  paysReturnTrip,
  perHour,
  runMinutes,
  runsInSession,
  simulate,
  series,
  type Inputs,
  type Metric,
  type Mode,
  type Season,
} from "@/lib/logistics";
import { AXIS, GRID, TOOLTIP, kfmt } from "@/components/charts/chartTheme";
import { Check, NumberField, Segmented } from "./Controls";
import StrategyChart from "./StrategyChart";

const TITLES: Record<Mode, { title: string; what: string }> = {
  heli: { title: "Helicopter supply runs", what: "Fly crates to the zone and fly back. Crates dropped from the air pay a bit less XP than from the ground." },
  driver: { title: "Driver supply runs", what: "Drive crates to the zone, drop them, then either drive back (return trip + streak) or respawn at base." },
  driverPeople: { title: "Driving players to the zone", what: "Taxi teammates to the zone in a ground vehicle. Ground passenger drops pay the most per player." },
  heliPeople: { title: "Flying players to the zone", what: "Fly teammates to the zone. The passenger streak caps at 25 players in a row." },
};

export default function ModePanel({
  mode,
  inp,
  set,
  reset,
  metric,
  setMetric,
}: {
  mode: Mode;
  inp: Inputs;
  set: (p: Partial<Inputs>) => void;
  reset: () => void;
  metric: Metric;
  setMetric: (m: Metric) => void;
}) {
  const air = isAir(mode);
  const people = mode === "heliPeople" || mode === "driverPeople";
  const strategy = effectiveStrategy(mode, inp);
  const [beSeason, setBeSeason] = usePersistentState<Season>("warlogs-breakeven-season-v2", "s3", oneOf<Season>("s2", "s3"));
  const unit = metric === "xp" ? "XP" : "$";

  const calc = useMemo(() => {
    const rt = runMinutes(mode, inp);
    const n = runsInSession(mode, inp);
    const previousSeries = series(mode, inp, "s2", metric);
    const currentSeries = series(mode, inp, "s3", metric);
    const cumData = previousSeries.map((p, i) => ({ min: p.t, s2: Math.round(p.v), s3: Math.round(currentSeries[i].v) }));
    const nBars = Math.min(20, Math.max(10, n));
    const previousRuns = simulate(mode, inp, "s2", nBars);
    const currentRuns = simulate(mode, inp, "s3", nBars);
    const perRun = previousRuns.map((r, i) => ({
      run: r.run,
      s2: Math.round(metric === "xp" ? r.xp : r.cash),
      s3: Math.round(metric === "xp" ? currentRuns[i].xp : currentRuns[i].cash),
    }));
    const tableRows = simulate(mode, inp, "s3", Math.max(n, 12));
    const tableS2 = simulate(mode, inp, "s2", Math.max(n, 12));
    const both = {
      s3: { xp: perHour(mode, inp, "s3", "xp"), cash: perHour(mode, inp, "s3", "cash") },
      s2: { xp: perHour(mode, inp, "s2", "xp"), cash: perHour(mode, inp, "s2", "cash") },
    };
    const maxRuns = streakMaxRuns(mode, inp);
    const runS3 = simulate(mode, inp, "s3", n);
    const runS2 = simulate(mode, inp, "s2", n);
    return { rt, n, cumData, perRun, tableRows, tableS2, both, maxRuns, runS3, runS2 };
  }, [mode, inp, metric]);

  const be = useMemo(() => (air ? null : breakEven(mode, inp, beSeason, metric)), [air, mode, inp, beSeason, metric]);
  const beCurve = useMemo(
    () => (air ? [] : breakEvenCurve(mode, inp, beSeason, metric, Math.max(15, Math.ceil(inp.back * 1.5)))),
    [air, mode, inp, beSeason, metric],
  );

  const zeroCargo = inp.small + inp.large + inp.pallets + inp.passengers === 0;

  return (
    <div className="layout">
      {/* ───────── Inputs ───────── */}
      <aside className="sidebar">
        <div className="panel">
          <div className="panel-head" style={{ marginBottom: 8 }}>
            <h3>Show me</h3>
          </div>
          <Segmented
            full
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "xp", label: "XP" },
              { value: "cash", label: "Cash" },
            ]}
          />
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <Check
              checked={inp.fobDeposit}
              onChange={(v) => set({ fobDeposit: v })}
              hint="Per supply pallet deposited into a FOB. Small and large crates don’t get it."
            >
              FOB deposit award (+{fmtCash(inp.fobAmount)} per supply pallet)
            </Check>
            {inp.fobDeposit && (
              <NumberField label="FOB award per pallet" unit="$" step={100} value={inp.fobAmount} onChange={(v) => set({ fobAmount: v })} />
            )}
          </div>
          {(inp.small + inp.large + inp.pallets > 0 || !people) && (
            <details style={{ marginTop: 12 }}>
              <summary>Season 3 cash adjustments</summary>
              <div className="grid" style={{ gap: 8 }}>
                <p className="sub">Enter the share of Season 2 base cash you expect to earn. The patch gave no exact rates, so 100% uses the Season 2 payout.</p>
                <NumberField label="Small crate payout" unit="%" max={100} value={inp.smallCrateCashPercent} onChange={(v) => set({ smallCrateCashPercent: v })} />
                <NumberField label="Large crate payout" unit="%" max={100} value={inp.largeCrateCashPercent} onChange={(v) => set({ largeCrateCashPercent: v })} />
                {(!people || inp.pallets > 0) && (
                  <NumberField label="Pallet payout" hint="for outside FOBs, lower this and turn off the deposit award" unit="%" max={100} value={inp.palletCashPercent} onChange={(v) => set({ palletCashPercent: v })} />
                )}
              </div>
            </details>
          )}
          <p className="sub" style={{ marginTop: 10, marginBottom: 0, fontSize: 12 }}>
            Everything you change here is saved in this browser. “Reset” restores the defaults for this tab.
          </p>
        </div>

        <div className="panel grid" style={{ gap: 12 }}>
          <div className="panel-head" style={{ marginBottom: 0 }}>
            <h3>Your run</h3>
            <button className="chip" onClick={reset} type="button">
              Reset
            </button>
          </div>

          {air ? (
            <NumberField label="Round trip" hint="base → zone → base" unit="min" step={0.5} value={inp.roundTrip} onChange={(v) => set({ roundTrip: v })} />
          ) : (
            <>
              <div className="field">
                <span className="lbl">After dropping off…</span>
                <Segmented
                  full
                  label="Strategy"
                  value={inp.strategy}
                  onChange={(v) => set({ strategy: v })}
                  options={[
                    { value: "driveBack", label: "Drive back" },
                    { value: "respawn", label: "Respawn at base" },
                  ]}
                />
              </div>
              <div className="field-row">
                <NumberField label="To zone" unit="min" step={0.5} value={inp.toZone} onChange={(v) => set({ toZone: v })} />
                {strategy === "driveBack" ? (
                  <NumberField label="Back to base" unit="min" step={0.5} value={inp.back} onChange={(v) => set({ back: v })} />
                ) : (
                  <NumberField label="Respawn time" unit="min" step={0.25} value={inp.respawn} onChange={(v) => set({ respawn: v })} />
                )}
              </div>
              {strategy === "driveBack" && (
                <NumberField
                  label="Respawn time"
                  hint="used for the comparison"
                  unit="min"
                  step={0.25}
                  value={inp.respawn}
                  onChange={(v) => set({ respawn: v })}
                />
              )}
            </>
          )}
          <NumberField label="Time at base per run" hint="buying / loading" unit="min" step={0.5} value={inp.load} onChange={(v) => set({ load: v })} />

          {people && (
            <NumberField label="Passengers per trip" unit="players" value={inp.passengers} max={40} onChange={(v) => set({ passengers: v })} />
          )}
          <div className="field-row">
            <NumberField label="Small crates" hint="/trip" value={inp.small} max={10} onChange={(v) => set({ small: v })} />
            <NumberField label="Large crates" hint="/trip" value={inp.large} max={10} onChange={(v) => set({ large: v })} />
          </div>
          {!people && <NumberField label="Supply pallets" hint="/trip" value={inp.pallets} max={10} onChange={(v) => set({ pallets: v })} />}
          <NumberField label="Session length" unit="min" step={10} min={10} max={600} value={inp.sessionMin} onChange={(v) => set({ sessionMin: v })} />
          <p className="sub" style={{ margin: 0 }}>
            One run = <b className="mono">{fmtMin(calc.rt)}</b> → <b className="mono">{calc.n}</b> runs in {fmtMin(inp.sessionMin)}.
          </p>
        </div>

        <details className="panel" open={false}>
          <summary>Assumptions & costs</summary>
          <div className="grid" style={{ gap: 12 }}>
            <div className="field">
              <span className="lbl">
                Streak counting <small>“in a row, up to 10”</small>
              </span>
              <Segmented
                full
                label="Streak rule"
                value={inp.streakRule}
                onChange={(v) => set({ streakRule: v })}
                options={[
                  { value: "afterFirst", label: "Per item" },
                  { value: "fromFirst", label: "Per item, 1st +1" },
                  { value: "perRun", label: "Per run" },
                ]}
              />
              <small className="muted" style={{ fontSize: 12 }}>
                <b>Per item</b> (default): each pallet or crate is its own level and the first is +0. A truck with 2 pallets goes +0,+1 → +2,+3 → … → +10,+10 on run 6; a helicopter with 1 pallet reaches +10 on run 11. Return trips are one per run, so they max on run 11. <b>Per item, 1st +1</b>: same, but the first one already counts as +1. <b>Per run</b>: one level per run, shared by every item.
              </small>
            </div>
            {air ? (
              <Check checked={inp.heliReturnTrip} onChange={(v) => set({ heliReturnTrip: v })} hint="The notes only list a return-trip reward for ground vehicles. Tick to test it anyway.">
                Helicopters also get the return-trip reward + streak
              </Check>
            ) : (
              <>
                <Check checked={inp.deathResetsStreaks} onChange={(v) => set({ deathResetsStreaks: v })} hint="Very likely — abandoning the vehicle should break the streak.">
                  Respawning resets delivery streaks
                </Check>
              </>
            )}
            <NumberField
              label={air ? "Helicopter cost" : "Truck cost"}
              hint={air ? "bought once" : "once, or every run if you respawn"}
              unit="$"
              step={250}
              value={inp.vehicleCost}
              onChange={(v) => set({ vehicleCost: v })}
            />
            <div className="field-row">
              <NumberField label="Small crate price" unit="$" step={50} value={inp.smallCost} onChange={(v) => set({ smallCost: v })} />
              <NumberField label="Large crate price" unit="$" step={50} value={inp.largeCost} onChange={(v) => set({ largeCost: v })} />
            </div>
            {!people && <NumberField label="Pallet price" unit="$" step={50} value={inp.palletCost} onChange={(v) => set({ palletCost: v })} />}
            <small className="muted" style={{ fontSize: 12 }}>
              Set these to what you pay. Costs only affect cash. Adjust Season 3 crate payouts separately to model cheaper contents.
            </small>
          </div>
        </details>
      </aside>

      {/* ───────── Results ───────── */}
      <div className="main">
        <div>
          <h2 style={{ fontSize: 26, textTransform: "uppercase" }}>{TITLES[mode].title}</h2>
          <p className="sub" style={{ fontSize: 14 }}>
            {TITLES[mode].what}
          </p>
        </div>

        {zeroCargo && (
          <div className="callout bad">
            <strong>Nothing to deliver.</strong> Add crates{people ? " or passengers" : ""} to see results.
          </div>
        )}

        <div className="grid grid-4">
          <div className="stat accent">
            <div className="label">Season 3 estimate per hour</div>
            <div className="value">{fmt(calc.both.s3.xp, "xp")}</div>
            <div className="value-2">{fmtCash(calc.both.s3.cash)} cash</div>
            <div className="hint">average over {fmtMin(inp.sessionMin)}</div>
          </div>
          <div className="stat">
            <div className="label">Season 2 per hour</div>
            <div className="value" style={{ color: "var(--s2)" }}>
              {fmt(calc.both.s2.xp, "xp")}
            </div>
            <div className="value-2">{fmtCash(calc.both.s2.cash)} cash</div>
            <div className="hint">same run with Season 2 rates</div>
          </div>
          <div className="stat">
            <div className="label">Season 3 vs Season 2</div>
            {(["xp", "cash"] as const).map((k) => {
              const a = calc.both.s2[k];
              const delta = calc.both.s3[k] - a;
              const pct = a === 0 ? null : (delta / Math.abs(a)) * 100;
              return (
                <div key={k} className={k === "xp" ? "value" : "value-2"} style={{ color: delta >= 0 ? "var(--buff)" : "var(--nerf)" }}>
                  {pct === null ? fmt(delta, k) : `${pct >= 0 ? "+" : ""}${Math.round(pct)}% ${k === "xp" ? "XP" : "cash"}`}
                </div>
              );
            })}
            <div className="hint">per hour, same run</div>
          </div>
          <div className="stat">
            <div className="label">Streak maxes out</div>
            <div className="value">{calc.maxRuns.all != null ? `Run ${calc.maxRuns.all}` : "Never"}</div>
            <div className="value-2">
              {[
                calc.maxRuns.pallet != null ? `Pallets: run ${calc.maxRuns.pallet}` : null,
                calc.maxRuns.small != null ? `Small: run ${calc.maxRuns.small}` : null,
                calc.maxRuns.large != null ? `Large: run ${calc.maxRuns.large}` : null,
                calc.maxRuns.player != null ? `Players: run ${calc.maxRuns.player}` : null,
                calc.maxRuns.ret != null ? `Return: run ${calc.maxRuns.ret}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "Resets every run"}
            </div>
          </div>
        </div>

        {/* Run by run: XP and cash side by side */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Run by run</h3>
              <p className="sub">
                XP and cash for every run in your {fmtMin(inp.sessionMin)} session. The estimate uses the Season 2 streak rules. Cash is after truck and cargo costs, so run 1 includes buying
                the vehicle.
              </p>
            </div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 520 }}>
            <table className="run-table">
              <thead>
                <tr>
                  <th className="n">Run</th>
                  <th>Streak levels (S3)</th>
                  <th className="n s3c">S3 XP</th>
                  <th className="n s3c">S3 cash</th>
                  <th className="n s2c">S2 XP</th>
                  <th className="n s2c">S2 cash</th>
                  <th className="n">XP vs S2</th>
                  <th className="n">Cash vs S2</th>
                </tr>
              </thead>
              <tbody>
                {calc.runS3.map((r, i) => {
                  const o = calc.runS2[i];
                  const dx = r.xp - o.xp;
                  const dc = r.cash - o.cash;
                  const tags: string[] = [];
                  if (calc.maxRuns.pallet === r.run) tags.push("Pallets maxed");
                  if (calc.maxRuns.all === r.run) tags.push("All streaks maxed");
                  else if (calc.maxRuns.ret === r.run) tags.push("Return maxed");
                  return (
                    <tr key={r.run} className={tags.length ? "is-max" : undefined}>
                      <td className="n">
                        {r.run}
                        <span className="muted" style={{ display: "block", fontSize: 11 }}>
                          {fmtMin(r.endMin)}
                        </span>
                      </td>
                      <td className="wrap">
                        {levelText(r)}
                        {tags.map((t) => (
                          <span key={t} className="max-tag">
                            {t}
                          </span>
                        ))}
                      </td>
                      <td className="n s3c" style={{ fontWeight: 700 }}>
                        {Math.round(r.xp).toLocaleString("en-US")}
                      </td>
                      <td className="n s3c">{fmtCash(r.cash)}</td>
                      <td className="n s2c">{Math.round(o.xp).toLocaleString("en-US")}</td>
                      <td className="n s2c">{fmtCash(o.cash)}</td>
                      <td className={`n ${dx >= 0 ? "yes" : "no"}`}>
                        {dx >= 0 ? "+" : "−"}
                        {Math.abs(Math.round(dx)).toLocaleString("en-US")}
                      </td>
                      <td className={`n ${dc >= 0 ? "yes" : "no"}`}>
                        {dc >= 0 ? "+" : "−"}
                        {fmtCash(Math.abs(dc))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {(() => {
                  const a = calc.runS3[calc.runS3.length - 1];
                  const o = calc.runS2[calc.runS2.length - 1];
                  const dx = a.cumXp - o.cumXp;
                  const dc = a.cumCash - o.cumCash;
                  return (
                    <tr>
                      <td className="n">Total</td>
                      <td>{calc.runS3.length} runs</td>
                      <td className="n s3c">{Math.round(a.cumXp).toLocaleString("en-US")}</td>
                      <td className="n s3c">{fmtCash(a.cumCash)}</td>
                      <td className="n s2c">{Math.round(o.cumXp).toLocaleString("en-US")}</td>
                      <td className="n s2c">{fmtCash(o.cumCash)}</td>
                      <td className={`n ${dx >= 0 ? "yes" : "no"}`}>
                        {dx >= 0 ? "+" : "−"}
                        {Math.abs(Math.round(dx)).toLocaleString("en-US")}
                      </td>
                      <td className={`n ${dc >= 0 ? "yes" : "no"}`}>
                        {dc >= 0 ? "+" : "−"}
                        {fmtCash(Math.abs(dc))}
                      </td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>
        </div>

        {!air && <StrategyChart mode={mode} inp={inp} />}

        {/* Break-even (ground only) */}
        {!air && be && (
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3>Drive back or respawn?</h3>
                <p className="sub">
                  {metric === "xp" ? "XP" : "Cash"} per hour as the drive home gets longer. The flat line is “drop off, then respawn at base” ({fmtMin(inp.respawn)} respawn).
                </p>
              </div>
              <Segmented
                label="Season for break-even"
                value={beSeason}
                onChange={setBeSeason}
                options={[
                  { value: "s2", label: "S2" },
                  { value: "s3", label: "S3 estimate" },
                ]}
              />
            </div>
            <div className="verdict" style={{ marginBottom: 12 }}>
              {be.verdict === "crossover" && be.maxBackMin != null && (
                <>
                  <span className="big" style={{ color: inp.back <= be.maxBackMin ? "var(--buff)" : "var(--nerf)" }}>
                    {inp.back <= be.maxBackMin ? "Drive back" : "Respawn"}
                  </span>
                  <span className="muted">
                    Break-even: driving back wins if the trip home takes less than <b className="mono" style={{ color: "var(--text)" }}>{be.maxBackMin} min</b>.
                    Your drive home is <b className="mono" style={{ color: "var(--text)" }}>{inp.back} min</b> ({fmt(be.driveRate, metric)}/h vs {fmt(be.respawnRate, metric)}/h
                    respawning).
                  </span>
                </>
              )}
              {be.verdict === "alwaysDrive" && (
                <>
                  <span className="big" style={{ color: "var(--buff)" }}>Always drive back</span>
                  <span className="muted">Driving back wins even with an hour-long drive home.</span>
                </>
              )}
              {be.verdict === "alwaysRespawn" && (
                <>
                  <span className="big" style={{ color: "var(--nerf)" }}>Always respawn</span>
                  <span className="muted">Even an instant drive home doesn’t beat respawning with these settings.</span>
                </>
              )}
            </div>
            <div className="chart-box">
              <ResponsiveContainer>
                <LineChart data={beCurve} margin={{ top: 16, right: 18, bottom: 22, left: 4 }}>
                  <CartesianGrid {...GRID} />
                  <XAxis
                    dataKey="back"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    {...AXIS}
                    tickFormatter={(v: unknown) => `${String(v)}m`}
                    label={{ value: "Drive back to base (minutes)", position: "insideBottom", offset: -12, fill: "var(--faint)", fontSize: 12 }}
                  />
                  <YAxis {...AXIS} tickFormatter={kfmt} width={74} label={{ value: `${unit} / hour`, angle: -90, position: "insideLeft", fill: "var(--faint)", fontSize: 12, dy: 30 }} />
                  <Tooltip
                    {...TOOLTIP}
                    labelFormatter={(l: unknown) => `Drive back: ${String(l)} min`}
                    formatter={(v: unknown, name: unknown) => [fmt(Number(v), metric) + "/h", String(name)]}
                  />
                  <Legend wrapperStyle={{ fontSize: 13, paddingTop: 8 }} verticalAlign="top" height={28} />
                  <Line type="monotone" dataKey="drive" name="Drive back" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="respawn" name="Respawn at base" stroke="var(--change)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                  <ReferenceLine x={inp.back} stroke="var(--text)" strokeDasharray="2 4" label={{ value: "You", position: "top", fill: "var(--text)", fontSize: 12 }} />
                  {be.verdict === "crossover" && be.maxBackMin != null && (
                    <ReferenceLine x={be.maxBackMin} stroke="var(--buff)" label={{ value: "Break-even", position: "insideTopRight", fill: "var(--buff)", fontSize: 12 }} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Cumulative S2 vs S3 */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Season 2 vs Season 3 over a session</h3>
              <p className="sub">
                Total {metric === "xp" ? "XP" : "cash"} earned as you keep running
                {air ? "" : strategy === "driveBack" ? " (driving back)" : " (respawning)"}. Each dot = a completed run{metric === "cash" ? "; cash starts at minus the vehicle" : ""}.
              </p>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer>
              <LineChart data={calc.cumData} margin={{ top: 8, right: 18, bottom: 22, left: 4 }}>
                <CartesianGrid {...GRID} />
                <XAxis
                  dataKey="min"
                  type="number"
                  domain={[0, inp.sessionMin]}
                  {...AXIS}
                  tickFormatter={(v: unknown) => `${String(v)}m`}
                  label={{ value: "Minutes played", position: "insideBottom", offset: -12, fill: "var(--faint)", fontSize: 12 }}
                />
                <YAxis {...AXIS} tickFormatter={kfmt} width={74} label={{ value: `Total ${unit}`, angle: -90, position: "insideLeft", fill: "var(--faint)", fontSize: 12, dy: 30 }} />
                <Tooltip {...TOOLTIP} labelFormatter={(l: unknown) => `${String(l)} min`} formatter={(v: unknown, name: unknown) => [fmt(Number(v), metric), String(name)]} />
                <Legend wrapperStyle={{ fontSize: 13 }} verticalAlign="top" height={28} />
                <Line type="linear" dataKey="s2" name="Season 2" stroke="var(--s2)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--s2)", strokeWidth: 0 }} isAnimationActive={false} />
                <Line type="linear" dataKey="s3" name="Season 3 estimate" stroke="var(--s3)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--s3)", strokeWidth: 0 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Per run */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Earnings per run</h3>
              <p className="sub">
                Pay climbs as streaks build
                {calc.maxRuns.all != null ? `, then flattens once every streak is maxed on run ${calc.maxRuns.all}` : ""}.
              </p>
            </div>
          </div>
          <div className="chart-box">
            <ResponsiveContainer>
              <BarChart data={calc.perRun} margin={{ top: 8, right: 18, bottom: 22, left: 4 }} barGap={2}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="run" {...AXIS} label={{ value: "Run number", position: "insideBottom", offset: -12, fill: "var(--faint)", fontSize: 12 }} />
                <YAxis {...AXIS} tickFormatter={kfmt} width={74} label={{ value: `${unit} per run`, angle: -90, position: "insideLeft", fill: "var(--faint)", fontSize: 12, dy: 30 }} />
                <Tooltip {...TOOLTIP} labelFormatter={(l: unknown) => `Run ${String(l)}`} formatter={(v: unknown, name: unknown) => [fmt(Number(v), metric), String(name)]} />
                <Legend wrapperStyle={{ fontSize: 13 }} verticalAlign="top" height={28} />
                <Bar dataKey="s2" name="Season 2" fill="var(--s2)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="s3" name="Season 3 estimate" fill="var(--s3)" radius={[3, 3, 0, 0]} />
                {calc.maxRuns.pallet != null && calc.maxRuns.pallet !== calc.maxRuns.all && (
                  <ReferenceLine x={calc.maxRuns.pallet} stroke="var(--buff)" strokeDasharray="4 4" label={{ value: "Pallets max", position: "top", fill: "var(--buff)", fontSize: 11 }} />
                )}
                {calc.maxRuns.all != null && (
                  <ReferenceLine x={calc.maxRuns.all} stroke="var(--buff)" label={{ value: "All max", position: "top", fill: "var(--buff)", fontSize: 11 }} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Run-by-run breakdown */}
        <details className="panel">
          <summary>Where each run’s pay comes from (Season 3, {metric === "xp" ? "XP" : "cash"})</summary>
          <div className="table-wrap" style={{ maxHeight: 460 }}>
            <table>
              <thead>
                <tr>
                  <th className="n">Run</th>
                  <th className="n">Ends at</th>
                  {!people || inp.small + inp.large > 0 ? (
                    <>
                      <th className="n">Crates</th>
                      <th className="n">Crate streak</th>
                    </>
                  ) : null}
                  {inp.pallets > 0 && (
                    <>
                      <th className="n">Pallets</th>
                      <th className="n">Pallet streak</th>
                    </>
                  )}
                  {inp.passengers > 0 && (
                    <>
                      <th className="n">Passengers</th>
                      <th className="n">Passenger streak</th>
                    </>
                  )}
                  {paysReturnTrip(mode, inp) && (
                    <>
                      <th className="n">Return trip</th>
                      <th className="n">Return streak</th>
                    </>
                  )}
                  {metric === "cash" && inp.fobDeposit && inp.pallets > 0 && <th className="n">FOB award</th>}
                  {metric === "cash" && <th className="n">Spend</th>}
                  <th className="n">S3 run</th>
                  <th className="n">S2 run</th>
                  <th className="n">S3 total</th>
                  <th className="n">S2 total</th>
                </tr>
              </thead>
              <tbody>
                {calc.tableRows.map((r, i) => {
                  const k = metric === "xp" ? "xp" : "cash";
                  const s2 = calc.tableS2[i];
                  const v = (x: { cash: number; xp: number }) => fmt(x[k], metric);
                  return (
                    <tr key={r.run}>
                      <td className="n">{r.run}</td>
                      <td className="n muted">{fmtMin(r.endMin)}</td>
                      {!people || inp.small + inp.large > 0 ? (
                        <>
                          <td className="n">{v(r.b.crates)}</td>
                          <td className="n s3c">+{v(r.b.crateStreak)}</td>
                        </>
                      ) : null}
                      {inp.pallets > 0 && (
                        <>
                          <td className="n">{v(r.b.pallets)}</td>
                          <td className="n s3c">+{v(r.b.palletStreak)}</td>
                        </>
                      )}
                      {inp.passengers > 0 && (
                        <>
                          <td className="n">{v(r.b.players)}</td>
                          <td className="n s3c">+{v(r.b.playerStreak)}</td>
                        </>
                      )}
                      {paysReturnTrip(mode, inp) && (
                        <>
                          <td className="n">{v(r.b.returnTrip)}</td>
                          <td className="n s3c">+{v(r.b.returnStreak)}</td>
                        </>
                      )}
                      {metric === "cash" && inp.fobDeposit && inp.pallets > 0 && <td className="n yes">+{fmt(r.b.fob.cash, "cash")}</td>}
                      {metric === "cash" && <td className="n no">{r.b.spend ? "−" + fmt(r.b.spend, "cash") : "—"}</td>}
                      <td className="n" style={{ fontWeight: 700 }}>
                        {fmt(metric === "xp" ? r.xp : r.cash, metric)}
                      </td>
                      <td className="n s2c">{fmt(metric === "xp" ? s2.xp : s2.cash, metric)}</td>
                      <td className="n s3c">{fmt(metric === "xp" ? r.cumXp : r.cumCash, metric)}</td>
                      <td className="n s2c">{fmt(metric === "xp" ? s2.cumXp : s2.cumCash, metric)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}
