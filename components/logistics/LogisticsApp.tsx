"use client";

import { useEffect, useState } from "react";
import { DEFAULTS, type Inputs, type Metric, type Mode } from "@/lib/logistics";
import ModePanel from "./ModePanel";
import StackingTable from "./StackingTable";

type TabId = Mode | "table";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "heli", label: "Helicopter", icon: "🚁" },
  { id: "driver", label: "Driver", icon: "🚚" },
  { id: "driverPeople", label: "Driver · People", icon: "🚌" },
  { id: "heliPeople", label: "Helicopter · People", icon: "🪂" },
  { id: "table", label: "Stacking table", icon: "📋" },
];

const STORAGE_KEY = "warlogs-logistics-v5";
const OLD_STORAGE_KEYS = ["warlogs-logistics-v4", "warlogs-logistics-v3"]; // migrated once: keeps your inputs, resets the streak rule

export default function LogisticsApp() {
  const [tab, setTab] = useState<TabId>("driver");
  const [metric, setMetric] = useState<Metric>("xp");
  const [inputs, setInputs] = useState<Record<Mode, Inputs>>(DEFAULTS);

  // Load saved settings + tab from the URL hash (after first render, so server and client match)
  useEffect(() => {
    try {
      let raw = window.localStorage.getItem(STORAGE_KEY);
      let migrating = false;
      if (!raw) {
        for (const k of OLD_STORAGE_KEYS) {
          raw = window.localStorage.getItem(k);
          if (raw) break;
        }
        migrating = !!raw;
      }
      if (raw) {
        const saved = JSON.parse(raw) as { inputs?: Partial<Record<Mode, Partial<Inputs>>>; metric?: Metric };
        if (migrating && saved.inputs) {
          (Object.keys(saved.inputs) as Mode[]).forEach((m) => {
            if (saved.inputs?.[m]) delete saved.inputs[m]!.streakRule;
          });
        }
        if (saved.inputs) {
          setInputs((prev) => {
            const next = { ...prev };
            (Object.keys(prev) as Mode[]).forEach((m) => {
              next[m] = { ...prev[m], ...(saved.inputs?.[m] ?? {}) };
            });
            return next;
          });
        }
        if (saved.metric === "xp" || saved.metric === "cash") setMetric(saved.metric);
      }
    } catch {
      /* storage blocked — fine, use defaults */
    }
    const h = window.location.hash.replace("#", "") as TabId;
    if (TABS.some((t) => t.id === h)) setTab(h);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, metric }));
    } catch {
      /* ignore */
    }
  }, [inputs, metric]);

  const pick = (id: TabId) => {
    setTab(id);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* ignore */
    }
  };

  const update = (mode: Mode) => (patch: Partial<Inputs>) => setInputs((prev) => ({ ...prev, [mode]: { ...prev[mode], ...patch } }));
  const reset = (mode: Mode) => () => setInputs((prev) => ({ ...prev, [mode]: DEFAULTS[mode] }));

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Logistics roles">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => pick(t.id)}>
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "table" ? (
        <StackingTable inputs={inputs} metric={metric} setMetric={setMetric} />
      ) : (
        <ModePanel key={tab} mode={tab} inp={inputs[tab]} set={update(tab)} reset={reset(tab)} metric={metric} setMetric={setMetric} />
      )}
    </>
  );
}
