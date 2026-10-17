"use client";

import { useSyncExternalStore } from "react";
import { bugsFor, type Mode } from "@/lib/hunt";

// Module-level store shared by the jar, the panel and every <Bug>, persisted to localStorage.

type Hunt = {
  sessionId: string;
  mode: Mode;
  startedAt: number;
  found: number[];
  hints: Record<number, string>;
  penaltyMs: number;
  result?: { rank: number; timeMs: number };
};

export type State = {
  hunt: Hunt | null;
  hidden: boolean;
  open: boolean;
  toast: string;
};

const KEY = "bug-hunt";
const EMPTY: State = { hunt: null, hidden: false, open: false, toast: "" };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    state = { ...EMPTY, hunt: saved.hunt ?? null, hidden: !!saved.hidden };
  } catch {}
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify({ hunt: state.hunt, hidden: state.hidden }));
  } catch {}
  listeners.forEach((l) => l());
}

export function useHunt() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => (load(), state),
    () => EMPTY,
  );
}

async function api(body: Record<string, unknown>) {
  const res = await fetch("/api/hunt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

let toastTimer: ReturnType<typeof setTimeout>;
function toast(msg: string) {
  set({ toast: msg });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => set({ toast: "" }), 3000);
}

export const isComplete = (h: Hunt | null) =>
  !!h && bugsFor(h.mode).every((b) => h.found.includes(b.id));

export const actions = {
  open: () => set({ open: true }),
  close: () => set({ open: false }),
  setHidden: (hidden: boolean) => set({ hidden }),
  reset: () => set({ hunt: null }),

  async start(mode: Mode) {
    try {
      const { sessionId } = await api({ action: "start", mode });
      set({ hunt: { sessionId, mode, startedAt: Date.now(), found: [], hints: {}, penaltyMs: 0 }, open: false });
      toast("Hunt started. Good luck.");
    } catch (e) {
      toast((e as Error).message);
    }
  },

  /** Returns true if the bug was newly caught. */
  async catchBug(bugId: number) {
    const h = state.hunt;
    if (!h || h.result) {
      toast("Start a hunt from the jar to catch this bug.");
      set({ open: true });
      return false;
    }
    if (h.found.includes(bugId)) return false;
    try {
      const { found } = await api({ action: "catch", sessionId: h.sessionId, bugId });
      set({ hunt: { ...h, found } });
      toast(isComplete(state.hunt) ? "All bugs found. Open the jar to sign the wall." : "Caught.");
      return true;
    } catch (e) {
      toast((e as Error).message);
      return false;
    }
  },

  async submitCode(code: string) {
    const h = state.hunt;
    if (!h) return "Start a hunt first.";
    try {
      const { found } = await api({ action: "catch", sessionId: h.sessionId, code });
      set({ hunt: { ...h, found } });
      return "";
    } catch (e) {
      return (e as Error).message;
    }
  },

  async hint(bugId: number) {
    const h = state.hunt;
    if (!h) return;
    try {
      const { hint, penaltyMs } = await api({ action: "hint", sessionId: h.sessionId, bugId });
      set({ hunt: { ...h, hints: { ...h.hints, [bugId]: hint }, penaltyMs } });
    } catch (e) {
      toast((e as Error).message);
    }
  },

  async finish(name: string, message: string) {
    const h = state.hunt;
    if (!h) return "Start a hunt first.";
    try {
      const { rank, timeMs } = await api({ action: "finish", sessionId: h.sessionId, name, message });
      set({ hunt: { ...h, result: { rank, timeMs } } });
      return "";
    } catch (e) {
      return (e as Error).message;
    }
  },
};
