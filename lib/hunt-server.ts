// Server-only Bug Hunt logic. Never import this from a client component.
import { redis } from "./store";
import { bugsFor, HINT_PENALTY_MS, type Mode } from "./hunt";

const HINTS: Record<number, string> = {
  1: "A small bug creeps along the edges of the screen. Move close and it freezes.",
  2: "Read the first line of the About page carefully.",
  3: "On the About page, hover over the large avatar. Something is hiding behind it.",
  4: "One project card has an extra detail.",
  5: "Switch to dark mode.",
  6: "Scroll to the very bottom.",
  7: "Developers have a console for this.",
  8: "View the source, Luke.",
  9: "Check the file that tells crawlers where not to go.",
  10: "Check the response headers in the Network tab.",
};

// Technical bugs 8–10 are caught by typing a code word. Override in production via HUNT_CODES.
const CODES: Record<string, string> = {
  8: "SEMICOLON",
  9: "HIDEOUT",
  10: "TYPO404",
  ...parseCodes(process.env.HUNT_CODES),
};

// A malformed HUNT_CODES must never take the site down: fall back to the defaults and log it.
function parseCodes(raw?: string): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return Object.fromEntries(
      Object.entries(parsed).filter(([k, v]) => ["8", "9", "10"].includes(k) && typeof v === "string" && v.trim()),
    ) as Record<string, string>;
  } catch {
    console.error("HUNT_CODES is not valid JSON; using default code words.");
    return {};
  }
}
export const codeFor = (bugId: 8 | 9 | 10) => CODES[bugId];

// Bugs 1–7 are caught by clicking / calling catchBug().
const DIRECT = new Set([1, 2, 3, 4, 5, 6, 7]);

const MIN_MS: Record<Mode, number> = { quick: 15_000, full: 30_000 };
const SESSION_TTL = 60 * 60 * 24;
// ponytail: tiny blocklist; swap for a proper profanity library if abuse shows up.
const BLOCKED = /fuck|shit|cunt|nigg|fag|bitch|asshole|dick/i;

type Session = {
  mode: Mode;
  startedAt: number;
  found: number[];
  hints: number[];
};

export type Entry = { id: string; name: string; message: string; date: number; timeMs: number };

const sessionKey = (id: string) => `hunt:session:${id}`;
const boardKey = (mode: Mode) => `hunt:board:${mode}`;

async function load(id: unknown): Promise<Session> {
  if (typeof id !== "string") throw new HuntError("Missing session");
  const raw = await redis<string | null>("GET", sessionKey(id));
  if (!raw) throw new HuntError("Session expired. Start a new hunt.");
  return JSON.parse(raw);
}

const save = (id: string, s: Session) =>
  redis("SET", sessionKey(id), JSON.stringify(s), "EX", SESSION_TTL);

export class HuntError extends Error {}

export async function start(mode: unknown) {
  if (mode !== "quick" && mode !== "full") throw new HuntError("Invalid mode");
  const id = crypto.randomUUID();
  await save(id, { mode, startedAt: Date.now(), found: [], hints: [] });
  return { sessionId: id };
}

export async function catchBug(id: string, bugId: unknown, code: unknown) {
  const s = await load(id);
  let caught: number | undefined;

  if (typeof code === "string") {
    const guess = code.trim().toUpperCase();
    caught = [8, 9, 10].find((b) => CODES[b].toUpperCase() === guess);
    if (!caught) throw new HuntError("That code doesn't match any bug.");
  } else if (typeof bugId === "number" && DIRECT.has(bugId)) {
    caught = bugId;
  } else {
    throw new HuntError("Unknown bug");
  }

  if (!bugsFor(s.mode).some((b) => b.id === caught)) {
    throw new HuntError("That bug only counts in the Full Hunt.");
  }
  if (!s.found.includes(caught)) s.found.push(caught);
  await save(id, s);
  return { bugId: caught, found: s.found };
}

export async function hint(id: string, bugId: unknown) {
  const s = await load(id);
  if (typeof bugId !== "number" || !HINTS[bugId]) throw new HuntError("Unknown bug");
  if (!s.hints.includes(bugId)) s.hints.push(bugId);
  await save(id, s);
  return { hint: HINTS[bugId], penaltyMs: s.hints.length * HINT_PENALTY_MS };
}

export async function finish(id: string, name: unknown, message: unknown) {
  const s = await load(id);
  const missing = bugsFor(s.mode).filter((b) => !s.found.includes(b.id));
  if (missing.length) throw new HuntError(`Still ${missing.length} bug(s) to find.`);

  const cleanName = typeof name === "string" ? name.trim().slice(0, 20) : "";
  const cleanMsg = typeof message === "string" ? message.trim().slice(0, 80) : "";
  if (!cleanName) throw new HuntError("Please enter a name.");
  if (BLOCKED.test(cleanName) || BLOCKED.test(cleanMsg)) throw new HuntError("Please keep it friendly.");

  const elapsed = Date.now() - s.startedAt;
  if (elapsed < MIN_MS[s.mode]) throw new HuntError("That time is too fast to be real.");
  const timeMs = elapsed + s.hints.length * HINT_PENALTY_MS;

  const entry: Entry = { id, name: cleanName, message: cleanMsg, date: Date.now(), timeMs };
  const member = JSON.stringify(entry);
  await redis("ZADD", boardKey(s.mode), timeMs, member);
  await redis("DEL", sessionKey(id));
  const rank = await redis<number>("ZRANK", boardKey(s.mode), member);
  return { rank: rank + 1, timeMs, mode: s.mode };
}

export async function board(mode: Mode, limit = 50): Promise<Entry[]> {
  const flat = await redis<string[]>("ZRANGE", boardKey(mode), 0, limit - 1, "WITHSCORES");
  const out: Entry[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push(JSON.parse(flat[i]));
  return out;
}

export async function removeEntry(mode: Mode, entryId: string) {
  const entry = (await board(mode, 1000)).find((e) => e.id === entryId);
  if (!entry) return false;
  await redis("ZREM", boardKey(mode), JSON.stringify(entry));
  return true;
}

// 30 write requests per IP per minute.
export async function rateLimited(ip: string) {
  const key = `rl:${ip}:${Math.floor(Date.now() / 60_000)}`;
  const n = await redis<number>("INCR", key);
  if (n === 1) await redis("EXPIRE", key, 60);
  return n > 30;
}
