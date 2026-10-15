// ─────────────────────────────────────────────────────────────
//  WARDOGS logistics math.
//  Every number below comes from the Season 02 patch notes
//  (14 Oct 2026). Season 1 values are the "before" side of each
//  arrow in those notes. Anything the notes don't spell out is an
//  ASSUMPTION and is marked as such — the UI lets people change it.
// ─────────────────────────────────────────────────────────────

export type Season = "s1" | "s2";
export type Mode = "heli" | "driver" | "heliPeople" | "driverPeople";
export type Metric = "xp" | "cash";
export type Strategy = "driveBack" | "respawn";
/** How "+$50 per crate in a row, up to 10" is read.
 *  fromFirst (default): streak level = number in a row. 1st = level 1 (+$50) … 10th+ = level 10 (+$500, max)
 *  afterFirst: 1st = no bonus, 2nd = level 1 … 11th+ = level 10
 *  perRun: level = runs in a row; every item in run k gets level k (max 10). Not how the notes read,
 *          offered as an option. */
export type StreakRule = "afterFirst" | "fromFirst" | "perRun";

export interface Reward {
  cash: number;
  xp: number;
}

export interface StreakDef {
  cash: number; // added per step
  xp: number; // added per step
  cap: number; // max steps
}

export interface SeasonRates {
  label: string;
  smallCrate: { cash: number; xpGround: number; xpAir: number };
  largeCrate: { cash: number; xpGround: number; xpAir: number };
  pallet: { cash: number; xpGround: number; xpAir: number };
  playerAir: Reward; // "Player Delivered"
  playerGround: Reward; // "Player Delivered (ground vehicle)"
  returnTrip: Reward; // "Return Trip (ground vehicle)"
  streaks: {
    crate: StreakDef;
    pallet: StreakDef;
    player: StreakDef;
    returnTrip: StreakDef;
  } | null;
  /** Total role-track XP needed for each level */
  roleXp: Record<number, number>;
}

export const RATES: Record<Season, SeasonRates> = {
  s1: {
    label: "Season 1",
    smallCrate: { cash: 500, xpGround: 250, xpAir: 200 },
    largeCrate: { cash: 1000, xpGround: 500, xpAir: 400 },
    pallet: { cash: 2500, xpGround: 750, xpAir: 500 },
    playerAir: { cash: 150, xp: 50 },
    playerGround: { cash: 500, xp: 50 }, // XP not listed separately → assumed same as air
    returnTrip: { cash: 250, xp: 100 },
    streaks: null, // streaks are new in Season 2
    roleXp: { 10: 35000, 15: 110000, 20: 250000, 25: 365000, 30: 500000, 35: 750000, 40: 975000, 45: 1225000, 50: 1500000 },
  },
  s2: {
    label: "Season 2",
    smallCrate: { cash: 250, xpGround: 200, xpAir: 150 },
    largeCrate: { cash: 500, xpGround: 400, xpAir: 300 },
    pallet: { cash: 1250, xpGround: 500, xpAir: 400 },
    playerAir: { cash: 100, xp: 25 },
    playerGround: { cash: 350, xp: 25 }, // XP not listed separately → assumed same as air
    returnTrip: { cash: 150, xp: 50 },
    streaks: {
      crate: { cash: 100, xp: 50, cap: 10 },
      pallet: { cash: 250, xp: 100, cap: 10 },
      player: { cash: 25, xp: 5, cap: 25 },
      returnTrip: { cash: 50, xp: 25, cap: 10 },
    },
    roleXp: { 10: 25000, 15: 54750, 20: 111500, 25: 206600, 30: 318200, 35: 525000, 40: 712500, 45: 920850, 50: 1150000 },
  },
};

export const LEVELS = [10, 15, 20, 25, 30, 35, 40, 45, 50];

export interface Inputs {
  // timing (minutes)
  toZone: number; // driver: base → zone
  back: number; // driver: zone → base
  roundTrip: number; // heli: full loop
  load: number; // time at base buying/loading per run
  respawn: number; // driver respawn strategy: suicide + respawn + get going again
  // cargo per run
  small: number;
  large: number;
  pallets: number;
  passengers: number;
  // rules / assumptions
  strategy: Strategy; // driver only
  heliReturnTrip: boolean; // does a helicopter get the return-trip reward? (not in notes)
  deathResetsStreaks: boolean; // does respawning break your delivery streak?
  streakRule: StreakRule;
  // money (purchase prices — editable)
  vehicleCost: number; // bought once for round trips; bought again every run if you respawn (you abandon it)
  smallCost: number; // price per small crate, bought every run
  largeCost: number; // price per large crate
  palletCost: number; // price per pallet
  // FOB deposit award. Supply pallets only.
  fobDeposit: boolean;
  fobAmount: number; // cash per supply pallet deposited into a FOB
  // session
  sessionMin: number;
}

const BASE: Inputs = {
  toZone: 4.5, back: 4.5, roundTrip: 4, load: 0, respawn: 1,
  small: 0, large: 0, pallets: 0, passengers: 0,
  strategy: "driveBack", heliReturnTrip: false, deathResetsStreaks: true, streakRule: "fromFirst",
  vehicleCost: 0, smallCost: 200, largeCost: 400, palletCost: 400,
  fobDeposit: true, fobAmount: 1800,
  sessionMin: 90,
};

export const DEFAULTS: Record<Mode, Inputs> = {
  heli: { ...BASE, roundTrip: 4, pallets: 1 },
  driver: { ...BASE, pallets: 2, vehicleCost: 5000 },
  heliPeople: { ...BASE, roundTrip: 4, passengers: 6 },
  driverPeople: { ...BASE, passengers: 6, vehicleCost: 5000 },
};

export const isAir = (m: Mode) => m === "heli" || m === "heliPeople";

export interface Breakdown {
  /** cargo bought this run + vehicle bought this run */
  crates: Reward;
  crateStreak: Reward;
  pallets: Reward;
  palletStreak: Reward;
  players: Reward;
  playerStreak: Reward;
  returnTrip: Reward;
  fob: Reward; // FOB deposit award (pallets only, optional)
  returnStreak: Reward;
  spend: number;
}

export interface RunRow {
  run: number;
  startMin: number;
  endMin: number;
  runMin: number;
  cash: number; // net of spend
  xp: number;
  cumCash: number;
  cumXp: number;
  streak: { small: number; large: number; pallet: number; player: number; returnTrip: number };
  b: Breakdown;
}

const zero = (): Reward => ({ cash: 0, xp: 0 });

/** Bonus steps earned by the k-th item in a streak (k starts at 1). */
function steps(k: number, cap: number, rule: StreakRule): number {
  const raw = rule === "afterFirst" ? k - 1 : k;
  return Math.max(0, Math.min(raw, cap));
}

/** "perRun" rule: every item in this run gets level = runs in a row (incl. this one), capped. */
function perRunBonus(priorRuns: number, count: number, def: StreakDef): Reward {
  const lvl = Math.min(priorRuns + 1, def.cap);
  return { cash: count * lvl * def.cash, xp: count * lvl * def.xp };
}

/** Add the streak bonus for `count` more items on top of an existing streak of `prior`. */
function streakBonus(prior: number, count: number, def: StreakDef, rule: StreakRule): Reward {
  const out = zero();
  for (let i = 1; i <= count; i++) {
    const s = steps(prior + i, def.cap, rule);
    out.cash += s * def.cash;
    out.xp += s * def.xp;
  }
  return out;
}

export function effectiveStrategy(mode: Mode, inp: Inputs): Strategy {
  return isAir(mode) ? "driveBack" : inp.strategy;
}

export function runMinutes(mode: Mode, inp: Inputs, strategy = effectiveStrategy(mode, inp)): number {
  const t = isAir(mode)
    ? inp.load + inp.roundTrip
    : strategy === "respawn"
      ? inp.load + inp.toZone + inp.respawn
      : inp.load + inp.toZone + inp.back;
  return Math.max(0.1, t);
}

/** Does this run pay a return trip? */
export function paysReturnTrip(mode: Mode, inp: Inputs, strategy = effectiveStrategy(mode, inp)): boolean {
  if (isAir(mode)) return inp.heliReturnTrip;
  return strategy === "driveBack";
}

/**
 * Simulate `runs` consecutive runs. Streaks carry over between runs unless
 * you respawn and `deathResetsStreaks` is on.
 */
export function simulate(
  mode: Mode,
  inp: Inputs,
  season: Season,
  runs: number,
  strategy: Strategy = effectiveStrategy(mode, inp),
): RunRow[] {
  const R = RATES[season];
  const air = isAir(mode);
  const rt = runMinutes(mode, inp, strategy);
  const returnPaid = paysReturnTrip(mode, inp, strategy);
  const resetEachRun = !air && strategy === "respawn" && inp.deathResetsStreaks;

  const st = { small: 0, large: 0, pallet: 0, player: 0, returnTrip: 0 };
  const runsInRow = { small: 0, large: 0, pallet: 0, player: 0 }; // used by the "perRun" rule
  const rows: RunRow[] = [];
  let cumCash = 0;
  let cumXp = 0;

  for (let r = 1; r <= runs; r++) {
    if (resetEachRun) {
      st.small = 0; st.large = 0; st.pallet = 0; st.player = 0; st.returnTrip = 0;
      runsInRow.small = 0; runsInRow.large = 0; runsInRow.pallet = 0; runsInRow.player = 0;
    }
    const b: Breakdown = {
      crates: zero(), crateStreak: zero(), pallets: zero(), palletStreak: zero(),
      players: zero(), playerStreak: zero(), returnTrip: zero(), returnStreak: zero(), fob: zero(),
      spend:
        inp.small * inp.smallCost +
        inp.large * inp.largeCost +
        inp.pallets * inp.palletCost +
        // the vehicle: once for round trips, every run when you abandon it and respawn
        (r === 1 || (!air && strategy === "respawn") ? inp.vehicleCost : 0),
    };

    // crates (small and large are separate stacks)
    b.crates.cash = inp.small * R.smallCrate.cash + inp.large * R.largeCrate.cash;
    b.crates.xp =
      inp.small * (air ? R.smallCrate.xpAir : R.smallCrate.xpGround) +
      inp.large * (air ? R.largeCrate.xpAir : R.largeCrate.xpGround);
    b.pallets.cash = inp.pallets * R.pallet.cash;
    b.pallets.xp = inp.pallets * (air ? R.pallet.xpAir : R.pallet.xpGround);
    const pr = air ? R.playerAir : R.playerGround;
    b.players.cash = inp.passengers * pr.cash;
    b.players.xp = inp.passengers * pr.xp;
    if (returnPaid) b.returnTrip = { ...R.returnTrip };

    if (R.streaks) {
      const S = R.streaks;
      const rule = inp.streakRule;
      const bonus = (prior: number, rowRuns: number, count: number, def: StreakDef): Reward =>
        rule === "perRun" ? perRunBonus(rowRuns, count, def) : streakBonus(prior, count, def, rule);
      const sSmall = bonus(st.small, runsInRow.small, inp.small, S.crate);
      const sLarge = bonus(st.large, runsInRow.large, inp.large, S.crate);
      b.crateStreak = { cash: sSmall.cash + sLarge.cash, xp: sSmall.xp + sLarge.xp };
      b.palletStreak = bonus(st.pallet, runsInRow.pallet, inp.pallets, S.pallet);
      b.playerStreak = bonus(st.player, runsInRow.player, inp.passengers, S.player);
      // one return trip per run, so every rule except "afterFirst" counts it the same way
      if (returnPaid) b.returnStreak = streakBonus(st.returnTrip, 1, S.returnTrip, rule === "afterFirst" ? "afterFirst" : "fromFirst");
    }
    if (inp.small) runsInRow.small++;
    if (inp.large) runsInRow.large++;
    if (inp.pallets) runsInRow.pallet++;
    if (inp.passengers) runsInRow.player++;
    st.small += inp.small;
    st.large += inp.large;
    st.pallet += inp.pallets;
    st.player += inp.passengers;
    if (returnPaid) st.returnTrip += 1;

    // FOB deposit award: same in both seasons, supply pallets only (small/large crates don't get it)
    if (inp.fobDeposit) b.fob = { cash: inp.pallets * inp.fobAmount, xp: 0 };

    const parts = [b.crates, b.crateStreak, b.pallets, b.palletStreak, b.players, b.playerStreak, b.returnTrip, b.returnStreak, b.fob];
    const cash = parts.reduce((a, p) => a + p.cash, 0) - b.spend;
    const xp = parts.reduce((a, p) => a + p.xp, 0);
    cumCash += cash;
    cumXp += xp;
    rows.push({
      run: r,
      startMin: (r - 1) * rt,
      endMin: r * rt,
      runMin: rt,
      cash,
      xp,
      cumCash,
      cumXp,
      streak: { ...st },
      b,
    });
  }
  return rows;
}

/** Whole runs that fit in the session (at least 1). */
export function runsInSession(mode: Mode, inp: Inputs, strategy = effectiveStrategy(mode, inp)): number {
  return Math.max(1, Math.floor(inp.sessionMin / runMinutes(mode, inp, strategy)));
}

/** Average earnings per hour over a session of completed runs. */
export function perHour(mode: Mode, inp: Inputs, season: Season, metric: Metric, strategy = effectiveStrategy(mode, inp)): number {
  const n = runsInSession(mode, inp, strategy);
  const rows = simulate(mode, inp, season, n, strategy);
  const last = rows[rows.length - 1];
  const total = metric === "xp" ? last.cumXp : last.cumCash;
  return (total / last.endMin) * 60;
}

export interface Point {
  t: number; // minutes into the match
  v: number; // running total
  run: number; // runs completed
}

/** Running total after each completed run, from t = 0 to the end of the session.
 *  Cash starts at minus the first vehicle (you buy it before the first run). */
export function series(mode: Mode, inp: Inputs, season: Season, metric: Metric, strategy = effectiveStrategy(mode, inp)): Point[] {
  const n = runsInSession(mode, inp, strategy);
  const rows = simulate(mode, inp, season, n, strategy);
  const pts: Point[] = [{ t: 0, v: metric === "cash" ? -inp.vehicleCost : 0, run: 0 }];
  rows.forEach((r) => pts.push({ t: Math.round(r.endMin * 100) / 100, v: metric === "xp" ? r.cumXp : r.cumCash, run: r.run }));
  return pts;
}

/** Gross (before any spend) over the session. */
export function grossTotal(mode: Mode, inp: Inputs, season: Season, strategy = effectiveStrategy(mode, inp)) {
  const n = runsInSession(mode, inp, strategy);
  const rows = simulate(mode, inp, season, n, strategy);
  const spend = rows.reduce((a, r) => a + r.b.spend, 0);
  const last = rows[rows.length - 1];
  return { runs: n, gross: last.cumCash + spend, spend, net: last.cumCash, xp: last.cumXp, endMin: last.endMin };
}

export interface BreakEven {
  /** Drive back is better while the drive home is shorter than this (minutes). null = see `verdict`. */
  maxBackMin: number | null;
  verdict: "crossover" | "alwaysDrive" | "alwaysRespawn";
  driveRate: number;
  respawnRate: number;
}

/** Driver modes: at what return-drive time does respawning win? */
export function breakEven(mode: Mode, inp: Inputs, season: Season, metric: Metric): BreakEven {
  const respawnRate = perHour(mode, inp, season, metric, "respawn");
  const driveAt = (back: number) => perHour(mode, { ...inp, back }, season, metric, "driveBack");
  const driveRate = driveAt(inp.back);
  const lo0 = driveAt(0.1);
  const hi0 = driveAt(60);
  if (lo0 <= respawnRate) return { maxBackMin: null, verdict: "alwaysRespawn", driveRate, respawnRate };
  if (hi0 >= respawnRate) return { maxBackMin: null, verdict: "alwaysDrive", driveRate, respawnRate };
  // scan (rate isn't perfectly smooth because runs are whole numbers)
  let best = 0.1;
  for (let b = 0.1; b <= 60; b += 0.05) {
    if (driveAt(b) >= respawnRate) best = b;
    else break;
  }
  return { maxBackMin: Math.round(best * 10) / 10, verdict: "crossover", driveRate, respawnRate };
}

/** Points for the break-even chart: rate vs. return-drive minutes. */
export function breakEvenCurve(mode: Mode, inp: Inputs, season: Season, metric: Metric, maxBack = 15) {
  const respawnRate = perHour(mode, inp, season, metric, "respawn");
  const out: { back: number; drive: number; respawn: number }[] = [];
  for (let b = 0.5; b <= maxBack + 1e-9; b += 0.5) {
    out.push({ back: b, drive: Math.round(perHour(mode, { ...inp, back: b }, season, metric, "driveBack")), respawn: Math.round(respawnRate) });
  }
  return out;
}

/** Minutes of logistics to reach a role level, starting from 0 XP. */
export function minutesToLevel(mode: Mode, inp: Inputs, season: Season, level: number, strategy = effectiveStrategy(mode, inp)): number | null {
  const need = RATES[season].roleXp[level];
  if (!need) return null;
  const rows = simulate(mode, inp, season, 1, strategy);
  if (rows[0].xp <= 0) return null;
  // simulate in chunks until we pass the threshold
  let n = 50;
  while (n <= 20000) {
    const all = simulate(mode, inp, season, n, strategy);
    const hit = all.find((r) => r.cumXp >= need);
    if (hit) return hit.endMin;
    n *= 4;
  }
  return null;
}

/** First run at which Season 2 pays more than Season 1 for that single run. */
export function firstRunS2Wins(mode: Mode, inp: Inputs, metric: Metric, maxRuns = 60): number | null {
  const a = simulate(mode, inp, "s1", maxRuns);
  const b = simulate(mode, inp, "s2", maxRuns);
  for (let i = 0; i < maxRuns; i++) {
    const v1 = metric === "xp" ? a[i].xp : a[i].cash;
    const v2 = metric === "xp" ? b[i].xp : b[i].cash;
    if (v2 > v1) return i + 1;
  }
  return null;
}

/** First run after which Season 2's running total overtakes Season 1's. */
export function cumulativeCrossover(mode: Mode, inp: Inputs, metric: Metric, maxRuns = 200): { run: number; minute: number } | null {
  const a = simulate(mode, inp, "s1", maxRuns);
  const b = simulate(mode, inp, "s2", maxRuns);
  for (let i = 0; i < maxRuns; i++) {
    const v1 = metric === "xp" ? a[i].cumXp : a[i].cumCash;
    const v2 = metric === "xp" ? b[i].cumXp : b[i].cumCash;
    if (v2 > v1) return { run: i + 1, minute: b[i].endMin };
  }
  return null;
}

export const fmtCash = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
export const fmtXp = (n: number) => Math.round(n).toLocaleString("en-US") + " XP";
export const fmt = (n: number, m: Metric) => (m === "xp" ? fmtXp(n) : fmtCash(n));
export const fmtMin = (min: number) => {
  if (min < 60) {
    const r = Math.round(min * 10) / 10;
    return `${Number.isInteger(r) ? r : r.toFixed(1)} min`;
  }
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
};
