import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/server/auth/session";
import { logAccess } from "@/server/logging/audit";
import { sessionCookieOptions } from "@/server/auth/cookies";

export const runtime = "nodejs";

export async function POST(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", "", sessionCookieOptions(0));
  await logAccess({
    action: "auth.logout",
    userId: session?.userId ?? null,
    email: session?.email ?? null,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
  });
  return response;
}
