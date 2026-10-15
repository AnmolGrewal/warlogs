"use client";

import { oneOf, usePersistentState } from "@/lib/usePersistentState";
import {
  RATES,
  breakEven,
  effectiveStrategy,
  fmt,
  fmtCash,
  perHour,
  type Inputs,
  type Metric,
  type Mode,
  type StreakRule,
} from "@/lib/logistics";
import { Segmented } from "./Controls";

const S1 = RATES.s1;
const S2 = RATES.s2;
const ST = S2.streaks!;

type Answer = "yes" | "no" | "maybe";
const A = ({ v, children }: { v: Answer; children?: React.ReactNode }) => (
  <span className={v}>{children ?? (v === "yes" ? "Yes" : v === "no" ? "No" : "Unclear")}</span>
);

const MODE_LABEL: Record<Mode, string> = {
  heli: "🚁 Helicopter crates",
  driver: "🚚 Driver crates",
  driverPeople: "🚌 Driver · people",
  heliPeople: "🪂 Helicopter · people",
};

export default function StackingTable({ inputs, metric, setMetric }: { inputs: Record<Mode, Inputs>; metric: Metric; setMetric: (m: Metric) => void }) {
  const [rule, setRule] = usePersistentState<StreakRule>("warlogs-ladder-rule", "fromFirst", oneOf<StreakRule>("fromFirst", "afterFirst", "perRun"));
  const ladder = Array.from({ length: rule === "afterFirst" ? 26 : 25 }, (_, i) => i + 1);
  const S2C = RATES.s2.streaks!;
  const stepsFor = (k: number, cap: number) => Math.max(0, Math.min(rule === "afterFirst" ? k - 1 : k, cap));

  return (
    <div className="grid" style={{ marginTop: 18, gap: 16 }}>
      {/* 1. Does it stack? */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Does it stack? Helicopter vs driving</h3>
            <p className="sub">What the Season 02 notes actually say for each bonus, and what the calculator assumes.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bonus</th>
                <th>Helicopter</th>
                <th>Ground vehicle</th>
                <th>Stacks separately?</th>
                <th>What the notes say</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Crate delivery (base)</td>
                <td><A v="yes">Yes</A> <span className="muted">(less XP)</span></td>
                <td><A v="yes" /></td>
                <td>—</td>
                <td className="wrap muted">Air-vehicle crate XP is listed separately: small 150, large 300 (ground 200 / 400). Cash is the same.</td>
              </tr>
              <tr>
                <td>Crate streak</td>
                <td><A v="yes" /></td>
                <td><A v="yes" /></td>
                <td><A v="yes">Small and large separate</A></td>
                <td className="wrap muted">{`+${fmtCash(S2C.crate.cash)} / +${S2C.crate.xp} XP per crate in a row, up to 10.`} No vehicle restriction, so helicopters get it too.</td>
              </tr>
              <tr>
                <td>Pallet delivery + streak</td>
                <td><A v="yes" /></td>
                <td><A v="yes">Yes</A> <span className="muted">(more XP)</span></td>
                <td><A v="yes">Own counter</A></td>
                <td className="wrap muted">{`Pallet XP 400, or 500 from a ground vehicle. Streak +${fmtCash(S2C.pallet.cash)} / +${S2C.pallet.xp} XP per pallet, up to 10.`}</td>
              </tr>
              <tr>
                <td>Passenger delivery</td>
                <td><A v="yes">Yes</A> <span className="muted">($100)</span></td>
                <td><A v="yes">Yes</A> <span className="muted">($350)</span></td>
                <td>—</td>
                <td className="wrap muted">Player Delivered $100 / 25 XP; ground vehicle $350 (XP for ground isn’t restated — assumed 25).</td>
              </tr>
              <tr>
                <td>Passenger streak</td>
                <td><A v="yes" /></td>
                <td><A v="yes" /></td>
                <td><A v="yes">Own counter</A></td>
                <td className="wrap muted">+$25 / +5 XP per player in a row, up to 25. A full Lakota maxes it in ~2 trips.</td>
              </tr>
              <tr>
                <td>Return trip (base)</td>
                <td><A v="no">Not listed</A></td>
                <td><A v="yes">Yes</A> <span className="muted">($150 / 50 XP)</span></td>
                <td>—</td>
                <td className="wrap muted">Only “Return Trip (ground vehicle)” appears, in both seasons. Calculator assumes helicopters don’t get it (toggle in Assumptions).</td>
              </tr>
              <tr>
                <td>Return-trip streak</td>
                <td><A v="maybe">Only if the above applies</A></td>
                <td><A v="yes" /></td>
                <td><A v="yes">Own counter</A></td>
                <td className="wrap muted">{`+${fmtCash(S2C.returnTrip.cash)} / +${S2C.returnTrip.xp} XP per trip in a row, up to 10.`} Drivers run this <b>and</b> the delivery streaks at the same time.</td>
              </tr>
              <tr>
                <td>FOB deposit award (optional)</td>
                <td><A v="yes">Pallets only</A></td>
                <td><A v="yes">Pallets only</A></td>
                <td>—</td>
                <td className="wrap muted">
                  Default +$1,800 per supply pallet, on by default, in both seasons. Small and large crates
                  don’t get it. Notes only say FOB Supplied Assist is now split between assisting players.
                </td>
              </tr>
              <tr>
                <td>Respawn at base instead of driving back</td>
                <td>—</td>
                <td><A v="no">Loses return trip</A></td>
                <td>—</td>
                <td className="wrap muted">You skip the return reward and its streak. The notes don’t say whether dying breaks delivery streaks; we assume it does.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="callout" style={{ marginTop: 12 }}>
          <strong>Tip:</strong> because small and large crates stack separately, carrying <b>2 of the same size</b> ramps that streak twice as fast as 1 small + 1 large.
        </div>
      </div>

      {/* 2. Reward table */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Reward values: Season 1 → Season 2</h3>
            <p className="sub">Base pay per item, plus the most a Season 2 streak can add on top.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th className="n">S1 cash</th>
                <th className="n">S2 cash</th>
                <th className="n">S1 XP</th>
                <th className="n">S2 XP</th>
                <th className="n">S2 max streak bonus</th>
                <th className="n">S2 best case</th>
              </tr>
            </thead>
            <tbody>
              {[
                { a: "Small crate (ground)", c1: S1.smallCrate.cash, c2: S2.smallCrate.cash, x1: S1.smallCrate.xpGround, x2: S2.smallCrate.xpGround, s: ST.crate },
                { a: "Small crate (air)", c1: S1.smallCrate.cash, c2: S2.smallCrate.cash, x1: S1.smallCrate.xpAir, x2: S2.smallCrate.xpAir, s: ST.crate },
                { a: "Large crate (ground)", c1: S1.largeCrate.cash, c2: S2.largeCrate.cash, x1: S1.largeCrate.xpGround, x2: S2.largeCrate.xpGround, s: ST.crate },
                { a: "Large crate (air)", c1: S1.largeCrate.cash, c2: S2.largeCrate.cash, x1: S1.largeCrate.xpAir, x2: S2.largeCrate.xpAir, s: ST.crate },
                { a: "Supply pallet (ground)", c1: S1.pallet.cash, c2: S2.pallet.cash, x1: S1.pallet.xpGround, x2: S2.pallet.xpGround, s: ST.pallet },
                { a: "Supply pallet (air)", c1: S1.pallet.cash, c2: S2.pallet.cash, x1: S1.pallet.xpAir, x2: S2.pallet.xpAir, s: ST.pallet },
                { a: "Passenger (air)", c1: S1.playerAir.cash, c2: S2.playerAir.cash, x1: S1.playerAir.xp, x2: S2.playerAir.xp, s: ST.player },
                { a: "Passenger (ground)", c1: S1.playerGround.cash, c2: S2.playerGround.cash, x1: S1.playerGround.xp, x2: S2.playerGround.xp, s: ST.player },
                { a: "Return trip (ground)", c1: S1.returnTrip.cash, c2: S2.returnTrip.cash, x1: S1.returnTrip.xp, x2: S2.returnTrip.xp, s: ST.returnTrip },
              ].map((r) => (
                <tr key={r.a}>
                  <td>{r.a}</td>
                  <td className="n s1c">{fmtCash(r.c1)}</td>
                  <td className="n">{fmtCash(r.c2)}</td>
                  <td className="n s1c">{r.x1}</td>
                  <td className="n">{r.x2}</td>
                  <td className="n s2c">
                    +{fmtCash(r.s.cash * r.s.cap)} / +{r.s.xp * r.s.cap} XP
                  </td>
                  <td className={`n ${r.x2 + r.s.xp * r.s.cap > r.x1 ? "yes" : "no"}`}>
                    {fmtCash(r.c2 + r.s.cash * r.s.cap)} / {r.x2 + r.s.xp * r.s.cap} XP
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Streak ladder */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>Streak ladder</h3>
            <p className="sub">Bonus added to the Nth item in a row. Each counter (small, large, pallet, passengers, return) climbs on its own.</p>
          </div>
          <Segmented
            label="Streak rule"
            value={rule}
            onChange={setRule}
            options={[
              { value: "fromFirst", label: "Per item" },
              { value: "afterFirst", label: "From 2nd" },
            ]}
          />
        </div>
        <div className="table-wrap" style={{ maxHeight: 420 }}>
          <table>
            <thead>
              <tr>
                <th className="n">In a row</th>
                <th className="n">Crate bonus</th>
                <th className="n">Pallet bonus</th>
                <th className="n">Passenger bonus</th>
                <th className="n">Return-trip bonus</th>
              </tr>
            </thead>
            <tbody>
              {ladder.map((k) => {
                // once a counter has hit its cap, later rows just say "max"
                const cell = (cap: number, def: { cash: number; xp: number }) => {
                  const st = stepsFor(k, cap);
                  const capped = stepsFor(k - 1, cap) === cap;
                  if (capped) return <td className="n muted">max</td>;
                  return (
                    <td className={`n ${st === cap ? "s2c" : ""}`}>
                      +{fmtCash(st * def.cash)} · {st * def.xp} XP
                    </td>
                  );
                };
                return (
                  <tr key={k}>
                    <td className="n">#{k}</td>
                    {cell(ST.crate.cap, ST.crate)}
                    {cell(ST.pallet.cap, ST.pallet)}
                    {cell(ST.player.cap, ST.player)}
                    {cell(ST.returnTrip.cap, ST.returnTrip)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="sub" style={{ marginTop: 8 }}>Highlighted = top level. Crates, pallets and return trips max out at level 10; passengers at 25.</p>
      </div>

      {/* 4. All roles compared */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3>All four roles, side by side</h3>
            <p className="sub">Uses the settings you entered on each tab.</p>
          </div>
          <Segmented
            label="Metric"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "xp", label: "XP" },
              { value: "cash", label: "Cash" },
            ]}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th className="n">Run time</th>
                <th>Cargo / trip</th>
                <th className="n">S1 / hour</th>
                <th className="n">S2 / hour</th>
                <th className="n">Change</th>
                <th>Drive back vs respawn (S2)</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(MODE_LABEL) as Mode[]).map((m) => {
                const inp = inputs[m];
                const air = m === "heli" || m === "heliPeople";
                const h1 = perHour(m, inp, "s1", metric);
                const h2 = perHour(m, inp, "s2", metric);
                const pct = h1 ? ((h2 - h1) / Math.abs(h1)) * 100 : 0;
                const be = air ? null : breakEven(m, inp, "s2", metric);
                const strat = effectiveStrategy(m, inp);
                const rt = air ? inp.load + inp.roundTrip : inp.load + inp.toZone + (strat === "respawn" ? inp.respawn : inp.back);
                const cargo = [
                  inp.small ? `${inp.small} small` : "",
                  inp.large ? `${inp.large} large` : "",
                  inp.pallets ? `${inp.pallets} pallet` : "",
                  inp.passengers ? `${inp.passengers} players` : "",
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <tr key={m}>
                    <td>{MODE_LABEL[m]}</td>
                    <td className="n">{rt} min</td>
                    <td className="muted">{cargo || "—"}</td>
                    <td className="n s1c">{fmt(h1, metric)}</td>
                    <td className="n s2c">{fmt(h2, metric)}</td>
                    <td className={`n ${pct >= 0 ? "yes" : "no"}`}>
                      {pct >= 0 ? "+" : ""}
                      {Math.round(pct)}%
                    </td>
                    <td className="muted">
                      {air
                        ? "Always flies back"
                        : be?.verdict === "crossover"
                          ? `Drive back if home trip < ${be.maxBackMin} min`
                          : be?.verdict === "alwaysDrive"
                            ? "Always drive back"
                            : "Always respawn"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
