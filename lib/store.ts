// Tiny Redis client: Upstash REST API when env vars are set, in-memory fallback for local dev.
// Only the commands the app uses are supported.

type Arg = string | number;

// UPSTASH_* when set by hand; KV_REST_API_* when added through Vercel's Upstash integration.
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

/** Thrown when a deployed site has no Upstash keys; callers show "temporarily offline". */
export class StoreOffline extends Error {}

export async function redis<T = unknown>(...cmd: Arg[]): Promise<T> {
  if (!url || !token) {
    // On Vercel each function instance has its own memory, so the fallback would silently lose data.
    if (process.env.VERCEL) throw new StoreOffline("Upstash Redis is not configured");
    return memory(cmd) as T;
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.error) throw new Error(`Redis: ${json.error}`);
  return json.result as T;
}

// ponytail: in-memory store resets on server restart and isn't shared between instances; dev only.
// Kept on globalThis so route handlers and pages (separate bundles in dev) share it.
const g = globalThis as unknown as {
  __kv?: Map<string, { value: string; expires?: number }>;
  __zsets?: Map<string, Map<string, number>>;
};
const kv = (g.__kv ??= new Map());
const zsets = (g.__zsets ??= new Map());

function live(key: string) {
  const e = kv.get(key);
  if (e?.expires && e.expires < Date.now()) kv.delete(key);
  return kv.get(key);
}

function sorted(key: string) {
  return [...(zsets.get(key) ?? new Map<string, number>())].sort((a, b) => a[1] - b[1]);
}

function memory([op, key, ...rest]: Arg[]): unknown {
  const k = String(key);
  switch (String(op).toUpperCase()) {
    case "GET":
      return live(k)?.value ?? null;
    case "SET": {
      const ex = rest[1] === "EX" ? Date.now() + Number(rest[2]) * 1000 : undefined;
      kv.set(k, { value: String(rest[0]), expires: ex });
      return "OK";
    }
    case "DEL":
      return Number(kv.delete(k));
    case "INCR": {
      const e = live(k);
      const n = Number(e?.value ?? 0) + 1;
      kv.set(k, { value: String(n), expires: e?.expires });
      return n;
    }
    case "EXPIRE": {
      const e = live(k);
      if (e) e.expires = Date.now() + Number(rest[0]) * 1000;
      return e ? 1 : 0;
    }
    case "ZADD": {
      if (!zsets.has(k)) zsets.set(k, new Map());
      zsets.get(k)!.set(String(rest[1]), Number(rest[0]));
      return 1;
    }
    case "ZRANK": {
      const i = sorted(k).findIndex(([m]) => m === String(rest[0]));
      return i === -1 ? null : i;
    }
    case "ZRANGE": {
      const [start, stop] = [Number(rest[0]), Number(rest[1])];
      const slice = sorted(k).slice(start, stop === -1 ? undefined : stop + 1);
      return slice.flatMap(([m, s]) => [m, String(s)]); // always WITHSCORES
    }
    case "ZREM":
      return Number(zsets.get(k)?.delete(String(rest[0])) ?? 0);
    default:
      throw new Error(`memory store: unsupported command ${op}`);
  }
}
