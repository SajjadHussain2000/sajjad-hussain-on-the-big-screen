// Client-safe Bug Hunt definitions. Hints and code words live in lib/hunt-server.ts.

export type Mode = "quick" | "full";

export const BUGS = [
  { id: 1, name: "The crawling bug", technical: false },
  { id: 2, name: "The typo", technical: false },
  { id: 3, name: "The shy one", technical: false },
  { id: 4, name: "Ladybug sticker", technical: false },
  { id: 5, name: "Glow bug", technical: false },
  { id: 6, name: "Sleepy bug", technical: false },
  { id: 7, name: "Console bug", technical: true },
  { id: 8, name: "Source bug", technical: true },
  { id: 9, name: "Robot bug", technical: true },
  { id: 10, name: "Header bug", technical: true },
] as const;

export const bugsFor = (mode: Mode) => BUGS.filter((b) => mode === "full" || !b.technical);

export const MODES: Record<Mode, { label: string; blurb: string }> = {
  quick: { label: "Quick Hunt", blurb: "Six visual bugs. No technical knowledge needed." },
  full: { label: "Full Hunt", blurb: "All ten, including four that need DevTools." },
};

export const HINT_PENALTY_MS = 15_000;

export function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
