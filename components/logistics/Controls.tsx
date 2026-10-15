"use client";

import type { ReactNode } from "react";

/** Number box with − / + buttons. */
export function NumberField({
  label,
  hint,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999999,
  unit,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unit?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  const id = "f-" + label.replace(/\W+/g, "-").toLowerCase();
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>
          {label}
          {unit && <span className="unit-inline"> ({unit})</span>}
        </span>
        {hint && <small>{hint}</small>}
      </label>
      <div className="num-input">
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(clamp(value - step))}>
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? clamp(v) : 0);
          }}
        />
        <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(clamp(value + step))}>
          +
        </button>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  full,
  label,
}: {
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (v: T) => void;
  full?: boolean;
  label?: string;
}) {
  return (
    <div className={`seg ${full ? "full" : ""}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className={o.value === value ? "on" : ""} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Check({ checked, onChange, children, hint }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; hint?: string }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {children}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
