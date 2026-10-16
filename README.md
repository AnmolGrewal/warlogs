# WarLogs — WARDOGS Logistics

A small Next.js site with two pages:

- **Patch Notes** (`/`) — the Season 02 notes sorted into categories, every change tagged **Buff / Nerf / New / Change / Fix**, with search, filters and charts.
- **Logistics** (`/logistics`) — a calculator with tabs for **Helicopter**, **Driver**, **Driver · People**, **Helicopter · People** and a **Stacking table**. It compares Season 1 vs Season 2 pay, shows when the new delivery streaks pay off, and works out the break-even between driving back and respawning at base.

Your settings on the Logistics page are saved in your browser automatically.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer and pnpm.

```bash
# 1. install pnpm once (skip if you have it)
npm install -g pnpm

# 2. in this folder, install packages
pnpm install

# 3. start the dev server
pnpm run dev
```

Open http://localhost:3000. Edits to files reload the page automatically.

## Put it on Vercel

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "WarLogs"
   git branch -M main
   git remote add origin https://github.com/AnmolGrewal/warlogs.git
   git push -u origin main
   ```
2. Go to https://vercel.com/new, pick the repo, and click **Deploy**. Vercel detects Next.js and pnpm on its own — no settings to change.

Every push to `main` redeploys.

---

## Where things live

| File | What it is |
| --- | --- |
| `lib/patchNotes.ts` | All patch-note entries, categories and Buff/Nerf tags. Edit this to change the notes page. |
| `lib/logistics.ts` | All reward numbers (`RATES`), default run settings (`DEFAULTS`) and the maths. |
| `app/page.tsx` | Patch notes page |
| `app/logistics/page.tsx` | Logistics page |
| `components/` | The UI pieces (charts, tabs, tables, inputs) |
| `app/globals.css` | Colours and layout. Change `--accent` at the top to re-theme. |

## How the logistics maths works

Numbers come straight from the Season 02 patch notes:

| Action | Season 1 | Season 2 |
| --- | --- | --- |
| Small crate | $500 / 250 XP (air 200) | $250 / 200 XP (air 150) |
| Large crate | $1,000 / 500 XP (air 400) | $500 / 400 XP (air 300) |
| Pallet | $2,500 / 500 XP (ground 750) | $1,250 / 400 XP (ground 500) |
| Player delivered | $150 / 50 XP (ground $500) | $100 / 25 XP (ground $350) |
| Return trip (ground) | $250 / 100 XP | $150 / 50 XP |

Season 2 streaks: crates **+$100 / +50 XP** per crate in a row (cap 10), pallets **+$150 / +25 XP** (cap 10, after the stealth hotfix; was +$250 / +100 XP), players **+$25 / +5 XP** (cap 25), return trips **+$50 / +25 XP** (cap 10). Small and large crates keep separate streak counters.

**Assumptions** (all changeable in the page under *Assumptions & costs*):

- Streak level = items in a row: the 1st crate/pallet is level 1, the 10th is level 10 (max; passengers max at 25). With 2 pallets per run that means level 10 on run 5. Switchable to "per run" (level goes up once per run, max on run 10) or the stricter "from the 2nd".
- Helicopters don't get the return-trip reward — the notes only list it for ground vehicles.
- Respawning at base breaks your delivery streaks.
- Ground-vehicle passenger XP is the same as the regular one (the notes only restate the cash).
- Crates are full (rewards scale with supplies inside).
- Perfect runs, no losses. Truck and crate prices aren't in the notes: defaults are a $5,000 truck, $200 small / $400 large crate, $400 pallet. Default cargo: driver 2 pallets, helicopter 1 pallet, no crates. Round trips buy the truck once; drop-and-respawn buys a new one every run.
- Default timings: helicopter 4 min round trip, driving 4.5 min each way (9 min round trip), 1 min respawn, 90-minute match.
- Streaks carry over between runs as long as you keep going.
- FOB deposit award: +$1,800 cash per supply pallet deposited into a FOB, on by default, both seasons. Small and large crates don't get it. Switch it off or change the amount at the top of each tab.

Every setting (inputs on each tab, the XP/Cash toggle, chart toggles) is saved in your browser's localStorage. "Reset" restores the defaults for that tab.

Source: [WARDOGS | Season 02 Patch Notes](https://store.steampowered.com/news/app/1867240/view/670630562731396445), 14 Oct 2026. Fan-made, not affiliated with BULKHEAD or Team17.
