// Season 02 patch notes, regrouped and tagged.
// Source: "WARDOGS | Season 02 Patch Notes", BULKHEAD, 14 Oct 2026
// https://store.steampowered.com/news/app/1867240/view/670630562731396445
//
// Tags are OUR reading of each change from a player's point of view:
//   buff   – good for the player / the thing got stronger or cheaper
//   nerf   – worse for the player / weaker, pricier or pays less
//   new    – brand-new thing
//   change – sideways move (reshuffle, rework) that isn't clearly up or down
//   fix    – bug, exploit or reliability fix

export type Tag = "buff" | "nerf" | "new" | "change" | "fix";

export interface Note {
  t: string; // what changed
  from?: number | string;
  to?: number | string;
  unit?: "$" | "XP" | "%" | "s" | "lvl" | "";
  tag: Tag;
  why?: string; // plain-English "what this means"
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  notes: Note[];
}

export const SOURCE_URL = "https://store.steampowered.com/news/app/1867240/view/670630562731396445";

export const CATEGORIES: Category[] = [
  {
    id: "launch",
    name: "Launch & Maintenance",
    icon: "🕒",
    blurb: "When the season goes live and what gets wiped.",
    notes: [
      { t: "Maintenance window 15 Oct, 08:00–09:30 UTC (1:00–2:30 AM Pacific)", tag: "change", why: "About 90 minutes of downtime before Season 2 goes live." },
      { t: "Full progression reset for Season 2 (announced in the Season 2 preview)", tag: "change", why: "Everyone starts again at level 1. The faster XP curve (see Progression) softens it." },
    ],
  },
  {
    id: "content",
    name: "New Weapons, Vehicles & Gear",
    icon: "🎒",
    blurb: "Everything brand-new this season.",
    notes: [
      { t: "TCX-SPR assault rifle (7.62x39mm)", to: 3200, unit: "$", tag: "new", why: "Unlocks at Assault 20 — takes the M4's old slot." },
      { t: "PP-19 Bizon SMG (9x19mm)", to: 1000, unit: "$", tag: "new", why: "Medic, unlocked by default. Cheap starter SMG with a 53-round mag." },
      { t: "Evo-3 Ultra LMG (.308)", to: 7250, unit: "$", tag: "new", why: "Support 30." },
      { t: "M14 marksman rifle (.308)", to: 7400, unit: "$", tag: "new", why: "Recon 25, with its own set of muzzles, bipod and 10/20/30 mags." },
      { t: "Molotov cocktail", to: 340, unit: "$", tag: "new", why: "Fire splash + burn over time. Burns foliage. Weaker in rain. Assault 13." },
      { t: "Wolf-110 light transport", to: 2200, unit: "$", tag: "new", why: "Fast, light wheeled transport. Driver 8." },
      { t: "Wolf-110 [M2 Browning]", to: 7800, unit: "$", tag: "new", why: "Armed version with a ring-mounted .50. Driver 16." },
      { t: "T-72B3 main battle tank", to: 16000, unit: "$", tag: "new", why: "Slower than the L2A6 but cheaper and a bit more fuel-efficient. Driver 20." },
      { t: "Flakpanzer Gepard anti-air", to: 14000, unit: "$", tag: "new", why: "Dedicated helicopter killer. Driver 25." },
      { t: "MG Nest buildable (manned M2)", to: 650, unit: "", tag: "new", why: "Large hammer only. Costs 650 build supplies." },
      { t: "Large Shelter buildable", to: 250, unit: "", tag: "new", why: "Covers assets and keeps rain off. Medium hammer+." },
      { t: "Wooden Step buildable", to: 15, unit: "", tag: "new", why: "It's a step. Small hammer+." },
      { t: "New attachments: optics, muzzles, mags, bipods", tag: "new" },
      { t: "8 new Gold Market camos (Black & Gold Little Bird is S2-exclusive)", tag: "new", why: "Black & Gold AK camo removed from the Gold Market." },
      { t: "Wager Vendor (opens later in Season 2)", tag: "new", why: "Bet your own cash on your own performance. Not there on day one, and it may come and go." },
    ],
  },
  {
    id: "weather",
    name: "Rain & Weather",
    icon: "🌧️",
    blurb: "New rain preset that changes how fights sound and look.",
    notes: [
      { t: "New rain weather preset", tag: "new", why: "Wet surfaces, rain sounds change under cover / indoors / in vehicles." },
      { t: "Thunder masks footsteps (same strike for everyone)", tag: "change", why: "Use thunder to move without being heard." },
      { t: "Rain reduces spotting range", tag: "change" },
      { t: "Rain weakens Molotov fire", tag: "nerf" },
      { t: "Destroyed roofs let rain through", tag: "change" },
    ],
  },
  {
    id: "damage",
    name: "Damage & Armor",
    icon: "🎯",
    blurb: "Big calibres hit softer; armor blocks a little less.",
    notes: [
      { t: ".308 Winchester base damage", from: 0, to: -25, unit: "%", tag: "nerf", why: "Hits every gun and vehicle weapon using .308 (FAL, M14, Evo-3…)." },
      { t: "7.62x54mmR base damage", from: 0, to: -20, unit: "%", tag: "nerf" },
      { t: "7.62x39mm base damage", from: 0, to: -19, unit: "%", tag: "nerf", why: "Includes the new TCX-SPR and the AH-6M / Lakota / Humvee miniguns." },
      { t: ".50 Cal base damage", from: 0, to: -16, unit: "%", tag: "nerf" },
      { t: "Sniper rifles: higher hit-location damage", tag: "buff", why: "Compensates the base cut so snipers keep their big single shots." },
      { t: "DMRs: weaker headshots and upper-body hits", tag: "nerf", why: "Now sit between assault rifles and snipers." },
      { t: "Assault rifles: slightly less body damage, more consistent torso hits", tag: "nerf" },
      { t: "LMG body damage now matches assault rifles", tag: "nerf", why: "LMGs win with sustained fire, not per-shot damage." },
      { t: "Scout Rifle one-shots heads with no helmet", tag: "buff", why: "Level 1 helmet takes two headshots." },
      { t: "Level 3 armor & helmet damage reduction", from: 55, to: 50, unit: "%", tag: "nerf" },
      { t: "Level 4 armor & helmet damage reduction", from: 65, to: 60, unit: "%", tag: "nerf" },
      { t: "Level 4 helmet: muffled audio, narrow FOV, fogs while sprinting", tag: "nerf" },
      { t: "Level 3 helmets cut suppression by 68%, Level 4 by 80%", tag: "buff" },
      { t: "12g slugs & compound bow scale with armor tier", tag: "change" },
      { t: "Heavy/Artillery turrets use rifle hit-location values vs infantry", tag: "nerf", why: "They were using helicopter-cannon values before." },
      { t: "Suppression rebuilt: stronger near-misses, less screen shake", tag: "change", why: "Fast-firing SMGs/pistols no longer suppress disproportionately." },
    ],
  },
  {
    id: "weapons",
    name: "Weapon Balance",
    icon: "🔫",
    blurb: "Recoil and handling passes on specific guns.",
    notes: [
      { t: "MP5: more horizontal recoil", tag: "nerf", why: "Was too easy to control." },
      { t: "Super-45: more damage fall-off past 50 m", tag: "nerf", why: "Firmly close-quarters now." },
      { t: "DMRs: new recoil pass", tag: "nerf" },
      { t: "MGL-40 muzzle velocity", from: 0, to: -25, unit: "%", tag: "nerf", why: "Plus stronger splash fall-off, more sway, slower ADS, reload penalty on the Little Bird bench." },
      { t: "Mosin: new PU 91/30 3.5x scope, other optics removed", tag: "change" },
      { t: "Compound bow: flatter arrows, better vs low armor", tag: "buff" },
      { t: "Medical Bag durability", from: 100, to: 150, unit: "", tag: "buff" },
      { t: "Parachutes open slower, not at all below ~10 m", tag: "nerf", why: "Opening below ~50 m while falling fast still means fall damage." },
      { t: "Infrared Range Finder returns on batteries (~80 s use)", tag: "change", why: "Price $1,200 → $3,200." },
    ],
  },
  {
    id: "building",
    name: "Building & FOBs",
    icon: "🧱",
    blurb: "Structures cost more supplies and drill rigs run shorter.",
    notes: [
      { t: "L81 Mortar build cost", from: 150, to: 600, unit: "", tag: "nerf", why: "4× the supplies — mortar spam gets expensive." },
      { t: "Stingray build cost", from: 150, to: 650, unit: "", tag: "nerf" },
      { t: "Door build cost", from: 22, to: 80, unit: "", tag: "nerf" },
      { t: "Gate build cost", from: 85, to: 200, unit: "", tag: "nerf" },
      { t: "Bremmer wall build cost", from: 15, to: 32, unit: "", tag: "nerf" },
      { t: "Air raid shelter / bunker / crow's nest", from: 100, to: 200, unit: "", tag: "nerf" },
      { t: "Hot Zone Magnet build cost", from: 2250, to: 2750, unit: "", tag: "nerf" },
      { t: "Talon 9K-SAM build cost", from: 1000, to: 650, unit: "", tag: "buff" },
      { t: "Vanguard CIWS build cost", from: 1500, to: 1200, unit: "", tag: "buff" },
      { t: "Medium hammer builds less per swing; crit spots give less", tag: "nerf", why: "Large hammer unchanged." },
      { t: "Drill rig max uptime", from: 375, to: 300, unit: "s", tag: "nerf", why: "Min fuel 1,500 → 2,000, max fuel 7,500 → 10,000, longer respawn cooldown." },
      { t: "Talon reload", from: 2, to: 5, unit: "s", tag: "nerf", why: "Restock cost 50 → 200 munitions." },
      { t: "Mortar restock from munitions", from: 75, to: 150, unit: "", tag: "nerf", why: "Fewer shots per pallet, plus a slower firing animation." },
      { t: "Barbed wire & sandbags can go on Bremmer walls", tag: "buff" },
      { t: "Barbed wire kills no longer pay cash or XP", tag: "nerf" },
      { t: "Doors/gates can't be hammer-breached; Halligan breaches both", tag: "change" },
      { t: "Unfinished buildables collapse when they lose support", tag: "fix" },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚙",
    blurb: "Handling changes, private inventories and bug fixes.",
    notes: [
      { t: "Purchased vehicle inventories are private to driver + squad", tag: "buff", why: "Optional setting to open it up. Free team spawn vehicles stay public." },
      { t: "Tracked vehicles feel heavier, less bouncy", tag: "change" },
      { t: "Humvee handling rework: climbs better, slower to top speed", tag: "change" },
      { t: "Dune Buggy brakes weaker (more drift)", tag: "change" },
      { t: "No explosives/placeables from enclosed seats", tag: "nerf" },
      { t: "CIWS takes 2.25× longer to kill the Spawn Vehicle", tag: "buff" },
      { t: "Helicopter glass now damages the heli when you shoot out", tag: "nerf" },
      { t: "Many vehicle fixes (tank launches, sinking, gunner desync, late-join flares)", tag: "fix" },
    ],
  },
  {
    id: "progression",
    name: "Progression & Unlocks",
    icon: "📈",
    blurb: "Levelling is much faster, especially 10–20. Unlock tracks reshuffled.",
    notes: [
      { t: "Role level 10 total XP", from: 35000, to: 25000, unit: "XP", tag: "buff" },
      { t: "Role level 15 total XP", from: 110000, to: 54750, unit: "XP", tag: "buff" },
      { t: "Role level 20 total XP", from: 250000, to: 111500, unit: "XP", tag: "buff", why: "Less than half the playtime of Season 1." },
      { t: "Role level 30 total XP", from: 500000, to: 318200, unit: "XP", tag: "buff" },
      { t: "Role level 50 total XP", from: 1500000, to: 1150000, unit: "XP", tag: "buff" },
      { t: "C4 moves to Assault (lvl 4); Assault becomes the base-breaking role", tag: "change" },
      { t: "Medical Bag unlock", from: 24, to: 14, unit: "lvl", tag: "buff", why: "Unlock cost $75k → $50k." },
      { t: "MP5 unlock", from: 15, to: 4, unit: "lvl", tag: "buff", why: "$75k → $25k." },
      { t: "Defibrillator unlock", from: 11, to: 22, unit: "lvl", tag: "nerf", why: "$50k → $110k." },
      { t: "PKM unlock", from: 30, to: 15, unit: "lvl", tag: "buff", why: "$150k → $100k." },
      { t: "M249 unlock", from: 15, to: 20, unit: "lvl", tag: "nerf", why: "$100k → $150k." },
      { t: "M4 unlock", from: 20, to: 28, unit: "lvl", tag: "nerf", why: "$100k → $150k. TCX-SPR takes level 20." },
      { t: "AK74 now unlocked by default; T-21 moves to Assault 3", tag: "change" },
      { t: "Little Bird AH-6M [Miniguns] unlock", from: 4, to: 8, unit: "lvl", tag: "nerf", why: "$50k → $125k — it was too strong that early." },
      { t: "Havoc unlock cost", from: 500000, to: 650000, unit: "$", tag: "nerf" },
      { t: "SPH-2 moves to Driver 31 (was WARDOG 90)", tag: "buff", why: "Unlock $500k → $350k." },
      { t: "Large Crate unlock (Driver)", from: 16, to: 17, unit: "lvl", tag: "nerf" },
      { t: "Humvee unlock", from: 15, to: 14, unit: "lvl", tag: "change", why: "But unlock cost $25k → $75k." },
      { t: "Supply pallets now locked: Mechanical 5, Ammo 9, Fuel 16 (WARDOG)", tag: "nerf", why: "Were unlocked by default." },
      { t: "Level 3 Helmet & Armor (WARDOG)", from: 60, to: 70, unit: "lvl", tag: "nerf" },
      { t: "Most attachments moved to earlier levels", tag: "buff" },
    ],
  },
  {
    id: "rewards",
    name: "Cash & XP Rewards",
    icon: "💰",
    blurb: "New combat rewards; vehicle and buildable bounties now match their value.",
    notes: [
      { t: "Assault-archetype weapon kill", from: 1500, to: 2000, unit: "$", tag: "buff" },
      { t: "FOB hack: teammates in radius now get $1,000 / 250 XP", tag: "new", why: "Hacker still gets $2,500 / 250 XP." },
      { t: "Door breached with Halligan: $100 once per door", tag: "new", why: "Halligan uses 5 → 7." },
      { t: "Closing a friendly FOB door: $75", tag: "new" },
      { t: "Destroying a FOB: up to +$7,500 / +250 XP based on its supplies", tag: "new" },
      { t: "Capture hostile drill tower", from: 750, to: 1500, unit: "$", tag: "buff", why: "XP 250 → 300." },
      { t: "Kill an L2A6", from: 14000, to: 11000, unit: "$", tag: "nerf" },
      { t: "Kill a Havoc", from: 18000, to: 14000, unit: "$", tag: "nerf" },
      { t: "Kill a default Kodiak", from: 1250, to: 500, unit: "$", tag: "nerf", why: "Armed variants pay far more: Kodiak [M249] $3,400." },
      { t: "Kill a Little Bird AH-6R [Rockets]", to: 9400, unit: "$", tag: "new", why: "Every variant now has its own bounty. Armed = 1.5× XP." },
      { t: "Kill an MH-6", from: 3125, to: 1250, unit: "$", tag: "nerf" },
      { t: "Destroy L81 Mortar / Stingray", from: 300, to: 650, unit: "$", tag: "buff", why: "Buildable bounties now equal their build cost; XP ≈ 25% of cash." },
      { t: "Destroy Vanguard CIWS", from: 3000, to: 1200, unit: "$", tag: "nerf" },
      { t: "Destroy small armored crate", from: 500, to: 1000, unit: "$", tag: "buff" },
      { t: "Destroy small crate", from: 500, to: 300, unit: "$", tag: "nerf" },
      { t: "Destroying buildables → Assault XP; artillery → Driver XP", tag: "change", why: "Repair XP now goes to Driver or Pilot depending on the vehicle." },
    ],
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: "📦",
    blurb: "Lower base pay, but new delivery streaks reward staying in the vehicle. Try the calculator →",
    notes: [
      { t: "NEW crate streak: +$50 / +25 XP per crate in a row, up to 10", tag: "new", why: "Small and large crates stack separately." },
      { t: "NEW pallet streak: +$125 / +50 XP per pallet in a row, up to 10", tag: "new" },
      { t: "NEW passenger streak: +$25 / +5 XP per player in a row, up to 25", tag: "new" },
      { t: "NEW return-trip streak: +$50 / +25 XP per trip in a row, up to 10", tag: "new", why: "This is what makes driving back worth it." },
      { t: "Deploy small crate (cash)", from: 500, to: 250, unit: "$", tag: "nerf" },
      { t: "Deploy large crate (cash)", from: 1000, to: 500, unit: "$", tag: "nerf" },
      { t: "Deploy small crate (XP)", from: 250, to: 200, unit: "XP", tag: "nerf", why: "From a helicopter: 200 → 150." },
      { t: "Deploy large crate (XP)", from: 500, to: 400, unit: "XP", tag: "nerf", why: "From a helicopter: 400 → 300." },
      { t: "Deploy supply pallet (cash)", from: 2500, to: 1250, unit: "$", tag: "nerf" },
      { t: "Deploy supply pallet (XP)", from: 500, to: 400, unit: "XP", tag: "nerf", why: "From a ground vehicle: 750 → 500." },
      { t: "Player delivered", from: 150, to: 100, unit: "$", tag: "nerf", why: "XP 50 → 25." },
      { t: "Player delivered (ground vehicle)", from: 500, to: 350, unit: "$", tag: "nerf" },
      { t: "Return trip (ground vehicle)", from: 250, to: 150, unit: "$", tag: "nerf", why: "XP 100 → 50, but now has its own streak." },
    ],
  },
  {
    id: "spotting",
    name: "Spotting",
    icon: "🔭",
    blurb: "About 30% less pay, scaled to what you spot.",
    notes: [
      { t: "Spotting rewards ~30% lower overall", from: 0, to: -30, unit: "%", tag: "nerf", why: "Was the lowest-risk, highest-paying way to earn." },
      { t: "Spotting scales with the value of the vehicle/buildable/crate", tag: "change", why: "High-value targets pay more than cheap ones." },
      { t: "Spotted target killed by another enemy faction", from: 50, to: 25, unit: "%", tag: "nerf" },
    ],
  },
  {
    id: "prices",
    name: "Vendor Prices",
    icon: "🏷️",
    blurb: "Heavy vehicles and top armor cost a lot more; several guns got cheaper.",
    notes: [
      { t: "Havoc", from: 18000, to: 28000, unit: "$", tag: "nerf" },
      { t: "L2A6 tank", from: 14000, to: 22000, unit: "$", tag: "nerf" },
      { t: "Little Bird AH-6R [Rockets]", from: 12500, to: 18800, unit: "$", tag: "nerf" },
      { t: "Little Bird AH-6M [Miniguns]", from: 7000, to: 12000, unit: "$", tag: "nerf" },
      { t: "Z20 Lakota [Miniguns]", from: 8000, to: 15000, unit: "$", tag: "nerf" },
      { t: "Humvee [Minigun]", from: 4500, to: 10000, unit: "$", tag: "nerf" },
      { t: "Humvee [M249]", from: 3750, to: 8500, unit: "$", tag: "nerf" },
      { t: "Kodiak [M249]", from: 3750, to: 6750, unit: "$", tag: "nerf" },
      { t: "AMR 50", from: 8800, to: 14800, unit: "$", tag: "nerf" },
      { t: "Super-45", from: 2600, to: 5600, unit: "$", tag: "nerf" },
      { t: "Level 4 Armor", from: 4000, to: 5000, unit: "$", tag: "nerf" },
      { t: "Level 4 Helmet", from: 3000, to: 4500, unit: "$", tag: "nerf" },
      { t: "Level 3 Armor", from: 2000, to: 2500, unit: "$", tag: "nerf" },
      { t: "Range Finder", from: 400, to: 1450, unit: "$", tag: "nerf" },
      { t: "Basic Parachute", from: 100, to: 500, unit: "$", tag: "nerf" },
      { t: "AK74", from: 1600, to: 800, unit: "$", tag: "buff" },
      { t: "Ruck Backpack", from: 2400, to: 1600, unit: "$", tag: "buff" },
      { t: "Gunner Backpack + Sling", from: 3500, to: 2400, unit: "$", tag: "buff" },
      { t: "Arsenal Backpack + 2 Slings", from: 5000, to: 4000, unit: "$", tag: "buff" },
      { t: "Sport Parachute", from: 1000, to: 700, unit: "$", tag: "buff" },
      { t: "FAL", from: 6500, to: 6000, unit: "$", tag: "buff" },
      { t: "PKM", from: 4500, to: 4100, unit: "$", tag: "buff" },
      { t: "Most muzzles, grips and foregrips up to ⅓ cheaper", tag: "buff" },
    ],
  },
  {
    id: "teams",
    name: "Factions & Team Switching",
    icon: "🏳️",
    blurb: "Lonestar gets paid more; late team-switching gets harder.",
    notes: [
      { t: "Lonestar: cash & XP win bonus (Season 2 only)", tag: "buff" },
      { t: "Lonestar: teamplay cash & XP multipliers (Season 2 only)", tag: "buff" },
      { t: "Losing team 40+ points behind 2nd gets 20% off at the vendor", tag: "new", why: "Applies to every faction." },
      { t: "All three Bakurani spawns moved with new routes", tag: "change" },
      { t: "Team lead >10 pts: can't switch again for 15 min", tag: "new", why: "Map hidden and no spawn vehicle until you reach the zone." },
      { t: "Team-kill vote: Forgive or Punish", tag: "new", why: "Respawning and leaving safe zone without voting = forgive." },
      { t: "Squad intent shown in squad list; prompts queue", tag: "new" },
    ],
  },
  {
    id: "servers",
    name: "Servers, Controls & QoL",
    icon: "🛠️",
    blurb: "Ping limits, controller rebinds and quality-of-life.",
    notes: [
      { t: "Region-based ping limits on official servers", tag: "new", why: "Sustained high ping = kick until the next map. Ping filters in browser." },
      { t: "Seeding empty servers earns rewards + vendor discount", tag: "new" },
      { t: "Pre-match entertainment (guns, targets, football, hidden radio)", tag: "new" },
      { t: "Rebuy Last Loadout now fills the vendor so you can tweak", tag: "buff" },
      { t: "Aim Assist strength slider (0 = off)", tag: "new" },
      { t: "Controller sensitivity, aim acceleration & many rebinds", tag: "change", why: "e.g. Deploy Crate on D-Pad Up (hold)." },
      { t: "Assistance request ping timer", from: 20, to: 60, unit: "s", tag: "change" },
      { t: "30mm ammo now 2×2 in inventory, backpack stacks capped at 50", tag: "nerf" },
    ],
  },
  {
    id: "exploits",
    name: "Exploit Fixes",
    icon: "🛡️",
    blurb: "Closing the cash and XP farms.",
    notes: [
      { t: "Spotting unfinished buildables pays by build progress", tag: "fix" },
      { t: "Selling from a supply crate has diminishing returns per buyer", tag: "fix" },
      { t: "Selling to enemies (e.g. team switchers) pays nothing", tag: "fix" },
      { t: "Destroying an empty enemy crate pays half", tag: "fix" },
      { t: "Crate deploy/destroy rewards scale with supplies inside", tag: "fix", why: "Matters for logistics: deliver full crates." },
      { t: "FOB Supplied Assist split between assisting players", tag: "fix" },
    ],
  },
];

// Charts on the overview page
export const XP_CURVE = [10, 15, 20, 25, 30, 35, 40, 45, 50].map((lvl) => ({
  level: lvl,
  s1: { 10: 35000, 15: 110000, 20: 250000, 25: 365000, 30: 500000, 35: 750000, 40: 975000, 45: 1225000, 50: 1500000 }[lvl]!,
  s2: { 10: 25000, 15: 54750, 20: 111500, 25: 206600, 30: 318200, 35: 525000, 40: 712500, 45: 920850, 50: 1150000 }[lvl]!,
}));

export const CALIBRE_CUTS = [
  { name: ".308 Win", cut: 25 },
  { name: "7.62x54R", cut: 20 },
  { name: "7.62x39", cut: 19 },
  { name: ".50 Cal", cut: 16 },
];

export const TAG_META: Record<Tag, { label: string; className: string }> = {
  buff: { label: "Buff", className: "tag-buff" },
  nerf: { label: "Nerf", className: "tag-nerf" },
  new: { label: "New", className: "tag-new" },
  change: { label: "Change", className: "tag-change" },
  fix: { label: "Fix", className: "tag-fix" },
};
