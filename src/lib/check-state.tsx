"use client";

// State for one pay stub check: the extracted stub, the worker's answers, the rules result and a small
// thumbnail of the photo. Lives in memory and is mirrored to sessionStorage (key `hayday-check`, D-008) so a
// reload keeps it. It is read straight from sessionStorage on every snapshot, so `clearStoredCheck()` in
// `stored-check.ts` (handoff 05) and `reset()` here stay in step. Nothing here ever leaves the browser.

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { CheckResult, PayStub, WorkerAnswers } from "@/lib/types";

export type CheckData = {
  stub?: PayStub;
  answers?: WorkerAnswers;
  result?: CheckResult;
  imagePreview?: string; // small JPEG data URL, for the thumbnail only
};

export const CHECK_STORAGE_KEY = "hayday-check";

const EMPTY: CheckData = {};
const listeners = new Set<() => void>();

let lastRaw: string | null = null;
let lastData: CheckData = EMPTY;

function readRaw(): string | null {
  try {
    return window.sessionStorage.getItem(CHECK_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): CheckData {
  const raw = readRaw();
  if (raw === lastRaw) return lastData;
  lastRaw = raw;
  lastData = EMPTY;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") lastData = parsed as CheckData;
    } catch {
      // corrupt entry: start empty
    }
  }
  return lastData;
}

function getServerSnapshot(): CheckData {
  return EMPTY;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function write(next: CheckData) {
  try {
    if (Object.keys(next).length === 0) {
      window.sessionStorage.removeItem(CHECK_STORAGE_KEY);
    } else {
      try {
        window.sessionStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Quota: keep everything except the thumbnail.
        const { imagePreview: _drop, ...rest } = next;
        void _drop;
        window.sessionStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(rest));
      }
    }
  } catch {
    // sessionStorage can be blocked (private mode); the state then only lives until the next write
    lastRaw = null;
    lastData = next;
  }
  listeners.forEach((l) => l());
}

/** Replace everything (a new check). Clears any earlier answers and result. */
function start(next: CheckData) {
  write(next);
}

/** Merge into the current check. */
function update(patch: Partial<CheckData>) {
  write({ ...getSnapshot(), ...patch });
}

/** Forget the current check. */
function reset() {
  write(EMPTY);
}

const noopSubscribe = () => () => {};

type CheckContextValue = CheckData & {
  /** False on the server and during hydration; wait for it before reading values into a form. */
  ready: boolean;
  start: (next: CheckData) => void;
  update: (patch: Partial<CheckData>) => void;
  reset: () => void;
};

const CheckContext = createContext<CheckContextValue>({
  ...EMPTY,
  ready: false,
  start,
  update,
  reset,
});

export function CheckProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const value = useMemo(() => ({ ...data, ready, start, update, reset }), [data, ready]);
  return <CheckContext.Provider value={value}>{children}</CheckContext.Provider>;
}

export function useCheck() {
  return useContext(CheckContext);
}
