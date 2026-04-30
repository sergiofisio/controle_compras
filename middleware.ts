import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/admin"];

function isAdminHost(host: string) {
  return host.toLowerCase().startsWith("admin.");
}

function getAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  return new Set(
    raw
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}

function applyCorsHeaders(response: NextResponse, origin: string) {
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Vary", "Origin");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}

function toBase64(input: string) {
  return input.replace(/-/g, "+").replace(/_/g, "/");
}

function base64UrlToUint8Array(input: string) {
  const normalized = toBase64(input);
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function isValidSessionToken(token?: string) {
  if (!token) return false;
  const secret = process.env.JWT_SECRET || "dev-secret";
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
  const data = new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`);
  const signature = base64UrlToUint8Array(signatureEncoded);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const validSignature = await crypto.subtle.verify("HMAC", key, signature, data);
  if (!validSignature) return false;

  try {
    const payloadText = new TextDecoder().decode(base64UrlToUint8Array(payloadEncoded));
    const payload = JSON.parse(payloadText) as { exp?: number };
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");
  const isApiRoute = pathname.startsWith("/api");
  const allowedOrigins = getAllowedOrigins();
  const isAllowedOrigin = Boolean(origin && allowedOrigins.has(origin));

  if (isApiRoute && req.method === "OPTIONS") {
    if (origin && !isAllowedOrigin) {
      return NextResponse.json({ error: "CORS origin nao permitida" }, { status: 403 });
    }
    const preflight = new NextResponse(null, { status: 204 });
    return origin && isAllowedOrigin ? applyCorsHeaders(preflight, origin) : preflight;
  }

  if (isApiRoute && origin && !isAllowedOrigin) {
    return NextResponse.json({ error: "CORS origin nao permitida" }, { status: 403 });
  }

  if (isAdminHost(host) && pathname === "/") {
    return NextResponse.rewrite(new URL("/admin", req.url));
  }

  if (!isAdminHost(host) && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute) {
    const token = req.cookies.get("session")?.value;
    const tokenValid = await isValidSessionToken(token);
    if (!tokenValid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();
  if (isApiRoute && origin && isAllowedOrigin) {
    return applyCorsHeaders(response, origin);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
