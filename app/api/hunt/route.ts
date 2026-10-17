import type { NextRequest } from "next/server";
import * as hunt from "@/lib/hunt-server";
import { StoreOffline } from "@/lib/store";

// Every hunt response carries bug #10's code word (found via the Network tab).
function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "X-Bug": hunt.codeFor(10) } });
}

const ip = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

const OFFLINE = { error: "The Bug Hunt is temporarily offline. Please try again later." };

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    if (await hunt.rateLimited(ip(req))) return json({ error: "Too many requests. Please wait a moment." }, 429);
    switch (body.action) {
      case "start":
        return json(await hunt.start(body.mode));
      case "catch":
        return json(await hunt.catchBug(body.sessionId, body.bugId, body.code));
      case "hint":
        return json(await hunt.hint(body.sessionId, body.bugId));
      case "finish":
        return json(await hunt.finish(body.sessionId, body.name, body.message));
      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    if (e instanceof hunt.HuntError) return json({ error: e.message }, 400);
    if (e instanceof StoreOffline) return json(OFFLINE, 503);
    throw e;
  }
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") === "full" ? "full" : "quick";
  try {
    return json(await hunt.board(mode));
  } catch (e) {
    if (e instanceof StoreOffline) return json(OFFLINE, 503);
    throw e;
  }
}

// Admin: DELETE /api/hunt?mode=quick&id=<entryId> with header `x-admin-secret`.
export async function DELETE(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-admin-secret") !== secret) return json({ error: "Forbidden" }, 403);
  const mode = req.nextUrl.searchParams.get("mode") === "full" ? "full" : "quick";
  const id = req.nextUrl.searchParams.get("id") ?? "";
  return json({ removed: await hunt.removeEntry(mode, id) });
}
