// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  console.log(
    `[${new Date().toLocaleTimeString("pt-BR")}] [${req.method}] -> ${pathname}`
  );

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isApiRoute = pathname.startsWith("/api/");
  const isAuthRoute =
    pathname.startsWith("/api/auth") || pathname.startsWith("/api/register");
  const isPublicPageRoute = pathname === "/login" || pathname === "/register";

  if (isApiRoute && !isAuthRoute && !token) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  if (!isApiRoute && !isPublicPageRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPageRoute && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
