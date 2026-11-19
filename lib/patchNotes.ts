// Season 03 launch patch notes, summarized and tagged.
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

export const SOURCE_URL = "https://store.steampowered.com/news/app/1867240/view/688648135317127221";

export const CARGO_DROP_HEIGHTS = [
  { name: "Standard crate", s2: 60, s3: 35 },
  { name: "Armored crate", s2: 80, s3: 35 },
  { name: "Pallet", s2: 90, s3: 40 },
];

export const CATEGORIES: Category[] = [
  {
    id: "launch",
    name: "Map & Modes",
    icon: "🗺️",
    blurb: "Sabatulo, Limited Mode and the longer seasonal schedule.",
    notes: [
      { t: "Sabatulo", tag: "new", why: "The first city map features high-rises, a hospital, a pool, a power station and a river embankment." },
      { t: "Limited Mode", tag: "new", why: "Restricts the vendor to early- and mid-season gear. Cash and progression carry across modes." },
      { t: "Limited Mode vendor restrictions", tag: "change", why: "The restricted stock excludes HP/AP ammo, level 3–4 armor, attack vehicles, CIWS, Stingray, MG Nest, Drill Rig and anti-tank mines." },
      { t: "Season length", to: "About three months", tag: "change", why: "Season 3 launched on November 12. The announced end date is January 28, 2027." },
      { t: "Planned Early Access price increase", to: 5, unit: "$", tag: "change", why: "The planned increase at season end applies to new purchases." },
    ],
  },
  {
    id: "progression",
    name: "Progression & Economy",
    icon: "📈",
    blurb: "Shared unlocks, slower leveling and catch-up support.",
    notes: [
      { t: "More XP required per level", tag: "nerf", why: "Progression at launch is closer to Season 1 pace. The notes give no exact level thresholds." },
      { t: "Multi-track unlocks", tag: "new", why: "Armor, packs, tactical vests and parachutes can unlock through any role. Assault gets armor earlier, Medic gets vests earlier and Support gets backpacks earlier." },
      { t: "Ammo unlocks redistributed", tag: "change", why: "Ammo comes later on the WARDOG track and is spread across roles based on weapon unlocks. Recon gets AP first." },
      { t: "Weekly catch-up XP and vendor discounts", tag: "new", why: "For lower-level players, the bonus and discount grow across the season independently for each role." },
      { t: "C4 · Assault unlock", from: 4, to: 5, unit: "lvl", tag: "nerf" },
      { t: "Molotov · Assault unlock", from: 13, to: 8, unit: "lvl", tag: "buff" },
      { t: "Molotov unlock cost", from: 25000, to: 12500, unit: "$", tag: "buff" },
      { t: "Tanks · Driver unlock range", from: "Lvl 20–35", to: "Lvl 35–50", tag: "nerf", why: "These are launch thresholds." },
      { t: "Tanks · WARDOG unlock", to: 200, unit: "lvl", tag: "change", why: "Tanks return to the WARDOG track. The previous threshold was level 145." },
      { t: "Large Hammer · Support unlock", from: 8, to: 14, unit: "lvl", tag: "nerf" },
      { t: "Verba · Support unlock", from: 14, to: 8, unit: "lvl", tag: "buff" },
      { t: "AMR 50 · Recon unlock", from: 35, to: 41, unit: "lvl", tag: "nerf" },
      { t: "Losing faction discount", tag: "change", why: "The gap to first place now determines the discount for the trailing faction." },
      { t: "Wager Vendor removed", tag: "change", why: "The vendor has returned to development." },
    ],
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: "📦",
    blurb: "Cargo drop rules and delivery rewards.",
    notes: [
      { t: "Reduced pallet rewards outside friendly FOBs", tag: "nerf", why: "The patch notes give no exact reduction." },
      { t: "Crate reward scales with contents value", tag: "nerf", why: "Lower-value contents earn a smaller payout. The patch notes give no formula." },
      { t: "Fuel that activates a drill earns a kickback", tag: "new", why: "Depositing fuel into a FOB can trigger this reward. The patch notes give no amount." },
      { t: "Supply crates blocked in safe zones", tag: "nerf", why: "Crate deployment now follows the existing pallet restriction." },
      ...CARGO_DROP_HEIGHTS.map(({ name, s2, s3 }): Note => ({
        t: `${name} drop height`,
        from: `~${s2} m`,
        to: `~${s3} m`,
        tag: "nerf",
      })),
      { t: "Cargo drop limits shown in tooltips", tag: "new", why: "Both speed and height affect cargo breakage. The notes cite roughly 80 km/h near the listed heights." },
      { t: "Halligan Bar can open enemy supply crates", tag: "buff", why: "Forcing a crate open drops one random item." },
    ],
  },
  {
    id: "weapons",
    name: "Weapons & Equipment",
    icon: "🎯",
    blurb: "Damage, handling and gear balance.",
    notes: [
      { t: "Infrared Range Finder removed from the vendor", tag: "nerf", why: "The item is being redesigned." },
      { t: "Assault rifle and LMG upper torso damage", from: 0, to: 13, unit: "%", tag: "buff" },
      { t: "Assault rifle and LMG mid and lower torso damage", from: 0, to: 3, unit: "%", tag: "buff", why: "LMG torso damage matches rifles. Armor reduction percentages stay the same." },
      { t: "TCX-SPR recoil reduced", tag: "buff", why: "Less upward climb and horizontal drift during automatic fire." },
      { t: "DMR damage increased", tag: "buff", why: "All DMRs need two body hits or one head hit against unarmored targets. The SVD, BMR-308 and M14 also need fewer hits through armor, and the SKS improves against level 2 and 4 armor." },
      { t: "Compound Bow arrow speed", from: 0, to: 50, unit: "%", tag: "buff" },
      { t: "Molotov fire sets players ablaze", tag: "buff", why: "Affected players take damage and drop the item they are holding." },
      { t: "Molotov damage against armored vehicles and heavy armor reduced", tag: "nerf" },
      { t: "Basic Parachute redesigned", tag: "change", why: "It opens more slowly, is intended for emergency exits from helicopters and cannot open within about 20 m of the ground." },
      { t: "Basic Parachute price", from: 500, to: 1250, unit: "$", tag: "nerf" },
      { t: "Sport Parachute handling", tag: "buff", why: "Faster turns, glide and dives, with a longer and stronger flare for low-altitude jumps." },
      { t: "Sport Parachute price", from: 700, to: 2250, unit: "$", tag: "nerf" },
      { t: "AMP-9 20-round magazine weight", from: "1 kg", to: "0.3 kg", tag: "fix" },
      { t: "IED item weight", from: "1.5 kg", to: "2.7 kg", tag: "fix" },
      { t: "IED trigger item weight", from: "1.5 kg", to: "0.2 kg", tag: "fix" },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    icon: "🚁",
    blurb: "Handling, vehicle combat and garage prices.",
    notes: [
      { t: "Wheeled vehicles roll downhill off throttle", tag: "change" },
      { t: "Ural and Humvee rear traction improved", tag: "buff" },
      { t: "Reduced grip above normal top speed", tag: "change", why: "Applies to Ural, Kodiak, Humvee, Dune Buggy and Wolf-110. The Ural also caps backward rolling speed at its forward top speed." },
      { t: "Bobcat reverse speed", from: "16 km/h", to: "~25 km/h", tag: "buff" },
      { t: "Kodiak reverse speed", from: "33 km/h", to: "~57 km/h", tag: "buff" },
      { t: "Humvee reverse speed", from: "35 km/h", to: "~57 km/h", tag: "buff" },
      { t: "Dune Buggy reverse speed", from: "43 km/h", to: "~50 km/h", tag: "buff" },
      { t: "Ural reverse speed", from: "15 km/h", to: "27 km/h", tag: "buff" },
      { t: "Wolf-110 reverse speed", from: "27 km/h", to: "~40 km/h", tag: "buff" },
      { t: "Vehicle minigun damage to infantry increased", to: "+50% to +78%", tag: "buff", why: "The multiplier increase depends on hit location." },
      { t: "AH-6R switches to 70 mm rockets", tag: "change", why: "The rockets have more flight wobble and the same damage on impact." },
      { t: "Littlebird cockpit protection increased", tag: "buff", why: "The MH-6, AH-6R and AH-6M better protect the pilot and co-pilot from ballistic damage." },
      { t: "First-person vehicle windows cleared up", tag: "fix" },
      { t: "20×102 mm rounds hit each vehicle section once", tag: "fix", why: "Damage is retuned, with only slightly less damage to the Littlebird variants." },
      { t: "Vanguard CIWS maximum elevation", from: "65°", to: "60°", tag: "nerf" },
      { t: "Tanks more resistant to grenades", tag: "buff" },
      { t: "Vehicles can destroy more obstacles", tag: "buff", why: "All except the Bobcat can flatten box hedges. Tanks and artillery can destroy stone walls." },
      { t: "Wolf-110 (M2 Browning) price", from: 7800, to: 6800, unit: "$", tag: "buff" },
      { t: "Kodiak (M249) price", from: 6750, to: 6250, unit: "$", tag: "buff" },
      { t: "AH-6M Littlebird (Miniguns) price", from: 12000, to: 10480, unit: "$", tag: "buff" },
      { t: "Havoc price", from: 28000, to: 26000, unit: "$", tag: "buff" },
    ],
  },
  {
    id: "rewards",
    name: "Match Rewards",
    icon: "💵",
    blurb: "Changes to the cash and XP awarded for match actions.",
    notes: [
      { t: "Mortar, Talon, MG Nest and Stingray destruction rewards", from: 650, to: 1300, unit: "$", tag: "buff" },
      { t: "CIWS destruction reward", from: 1200, to: 2400, unit: "$", tag: "buff" },
      { t: "Air vehicle kill streak rewards restored", tag: "buff", why: "Applies to enemy player kills while using an air vehicle." },
      { t: "Vehicle-on-vehicle kills earn full control-zone rewards nearby", tag: "buff", why: "Applies within 1,000 m of a control zone." },
      { t: "Spotted target killed · armed Littlebirds", from: 1000, to: 850, unit: "$", tag: "nerf" },
      { t: "Spotted target killed · armed Lakota", from: 1400, to: 1200, unit: "$", tag: "nerf" },
      { t: "Spotted target killed · L2A6", from: 3300, to: 3000, unit: "$", tag: "nerf" },
      { t: "Spotted target killed · T-72B3", from: 2400, to: 2000, unit: "$", tag: "nerf" },
      { t: "Spotted target killed · Hot Zone Magnet cash", from: 1650, to: 1500, unit: "$", tag: "nerf" },
      { t: "Spotted target killed · infantry XP", from: 150, to: 125, unit: "XP", tag: "nerf" },
      { t: "Spotted target killed · FOB XP", from: 250, to: 200, unit: "XP", tag: "nerf" },
      { t: "Spotted target killed · Hot Zone Magnet XP", from: 225, to: 200, unit: "XP", tag: "nerf" },
      { t: "Spotted target killed · spawn vehicle XP", from: 500, to: 400, unit: "XP", tag: "nerf" },
      { t: "Parachuting into an enemy FOB earns a reward", tag: "new" },
      { t: "Community server play earns a small cash bonus", tag: "new" },
    ],
  },
  {
    id: "content",
    name: "Cosmetics & Steam",
    icon: "🎁",
    blurb: "Seasonal cosmetics, achievements, replays and Twitch Drops.",
    notes: [
      { t: "Movember Tactical ’Stache DLC", tag: "new", why: "Includes a growing November mustache and a permanent scoreboard badge. BULKHEAD says all DLC profits go to Movember." },
      { t: "Five Gold Market camos", tag: "new", why: "Defibrillator Black & Gold, MAAWS Two-Tone Desert, Compound Bow Digital Wood, plus Chocolate Chip for the M1911 and FAL." },
      { t: "Black & Gold Littlebird camo carries over for two weeks", tag: "change" },
      { t: "Three Steam achievements", tag: "new", why: "He’s Behind You, Car Jacker and Slot Machine." },
      { t: "Steam recording timeline markers", tag: "new", why: "Markers identify kills, revives and giving up." },
      { t: "Season 3 Twitch Drops", tag: "new", why: "Nine reward tiers run from 15 minutes to 15 hours watched. See the official notes for each bundle and how to claim it." },
    ],
  },
  {
    id: "interface",
    name: "Interface, Audio & Controller",
    icon: "🎮",
    blurb: "Changes to menus, feedback and controls.",
    notes: [
      { t: "New main menu background and Collection player category", tag: "new", why: "Emotes, bobbleheads and badges share a category with updated icons and collapsible filters." },
      { t: "Deployment Select redesigned", tag: "change", why: "Official and Community servers are separated for each mode, and Limited servers have a filter." },
      { t: "Community server favorites", tag: "new", why: "Star servers from the browser or pause menu, then filter or sort by favorites." },
      { t: "Helicopter passengers see height above ground", tag: "new" },
      { t: "Squad invites and join requests queue", to: 5, tag: "buff", why: "Up to five of each can wait without replacing earlier requests." },
      { t: "Menu and loadout fixes", tag: "fix", why: "Covers stuck chat and buttons, tooltip and popup text, spawn vehicle deployment, rebuy handling and refund totals." },
      { t: "New hit, spotting and weapon inspection sounds", tag: "new", why: "Includes Hollow Point armor hitmarkers, spotting callouts, empty weapon inspections and voice lines for fire and barbed wire." },
      { t: "Armor breaks, weapon inspection and rain audio updated", tag: "change", why: "Armor and helmet breaks play consistently, broken inspection sounds were fixed, and rain ambience varies by space." },
      { t: "Controller seat shortcut and reload discard", tag: "new", why: "Hold A for the driver’s seat, use B for handbrake or pilot fire, and hold X to discard a magazine while reloading." },
      { t: "Controller interaction and downed bindings updated", tag: "change", why: "World interactions use a tap. When downed, A calls for help, B opens the damage log, X gives up and Y bribes." },
      { t: "Controller navigation and input fixes", tag: "fix", why: "Includes cursor drift, map and menu activation, downed zoom, D-pad navigation, vendor and equipment controls, and unintended gunner focus." },
    ],
  },
  {
    id: "servers",
    name: "Servers & Performance",
    icon: "🖥️",
    blurb: "Seeding, connection limits and rendering changes.",
    notes: [
      { t: "Free unarmed vehicles during seeding", tag: "new", why: "The server clears vehicles when the match begins." },
      { t: "Team switch penalty narrowed", tag: "change", why: "The map visibility penalty applies only if you previously connected during the current match." },
      { t: "Custom Community server rules dialog", tag: "new" },
      { t: "Official server ping limit", to: "250 ms", tag: "buff", why: "Applies across regions. Community hosts set their own limits." },
      { t: "Ground clutter, shadows and rain rendering optimized", tag: "buff", why: "Includes fixes for flickering vehicle window rain and rain stopping after vendor use." },
      { t: "Loading waits for match data", tag: "fix", why: "Prevents a flash of incorrect information on join." },
      { t: "Server crash and benchmark fixes", tag: "fix", why: "Includes crashes from invalid lock-on targets and vehicle damage, plus the benchmark running twice on launch." },
      { t: "Third-party graphics modifications restricted", tag: "change", why: "Launch checks enforce allowed graphics settings. The lowest shadow preset is reserved for detected minimum-spec hardware." },
      { t: "Global illumination moved to the Overkill preset", tag: "change", why: "Enabled by default on Overkill and disabled on the other presets." },
      { t: "Server security and stability work", tag: "fix", why: "The studio announced infrastructure changes in response to disruptions affecting Asian servers." },
    ],
  },
  {
    id: "fixes",
    name: "Gameplay & Map Fixes",
    icon: "🛠️",
    blurb: "Fixes to loot, construction, vehicles and maps.",
    notes: [
      { t: "Terrain, lighting and visibility fixes", tag: "fix", why: "Covers gaps, distant objects, glass, crate colors, low-detail ceilings and players appearing hidden above cover." },
      { t: "Limited Mode restrictions clear after map rotation", tag: "fix" },
      { t: "Community server unbans and reserved-slot removals persist", tag: "fix" },
      { t: "Death bags and downed player loot fixed", tag: "fix", why: "Death bags show their owner. Downed players who leave drop their bag, and teammates can loot correctly." },
      { t: "Buildable support, placement and repair fixed", tag: "fix", why: "Includes floating parts, MG Nest repairs, item snap points and build tool prompts." },
      { t: "Projectile collision and weapon animation fixes", tag: "fix", why: "Covers railings, hedges, vehicle windows, prone TCX-SPR recoil and AK74 drum magazine inspection." },
      { t: "Vehicle weapon attribution and reload fixes", tag: "fix", why: "Includes mounted reload menus, crash kill credit, vehicle weapon hit attribution and ammo purchases from gunner seats." },
      { t: "Vehicle spawning, locking and passenger fixes", tag: "fix", why: "Includes flat-ground spawns, Shooting Range lock state, Wolf-110 poses and passenger fire modes near vendors." },
      { t: "Tank damage, clipping and animation fixes", tag: "fix", why: "Grenade launcher damage now aligns with grenades. The T-72B3 driver is better protected from unintended exterior hits." },
      { t: "Vehicle inventory fills existing stacks first", tag: "fix" },
      { t: "Littlebird attack variants can be repaired", tag: "fix" },
      { t: "Shared building, terrain and spawn fixes", tag: "fix", why: "Includes floating doors and players falling through the map at match start. Lonestar posters were removed from spawns." },
      { t: "Bakurani factory roof rain fixed", tag: "fix" },
      { t: "Zestafona warehouse and tractor collision fixed", tag: "fix", why: "Mortars can no longer fire through the green brick warehouse roof." },
      { t: "Ozeti vehicle spawns and stadium collision fixed", tag: "fix" },
    ],
  },
];
export const TAG_META: Record<Tag, { label: string; className: string }> = {
  buff: { label: "Buff", className: "tag-buff" },
  nerf: { label: "Nerf", className: "tag-nerf" },
  new: { label: "New", className: "tag-new" },
  change: { label: "Change", className: "tag-change" },
  fix: { label: "Fix", className: "tag-fix" },
};
