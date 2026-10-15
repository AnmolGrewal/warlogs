"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useState that remembers its value in this browser (localStorage).
 * Loads after the first render so the server and client HTML match.
 */
export function usePersistentState<T>(key: string, initial: T, isValid?: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw);
        if (!isValid || isValid(parsed)) setValue(parsed as T);
      }
    } catch {
      /* storage blocked or bad JSON — keep the default */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export const oneOf =
  <T extends string>(...opts: T[]) =>
  (v: unknown): v is T =>
    typeof v === "string" && (opts as string[]).includes(v);
