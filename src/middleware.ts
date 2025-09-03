import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const method = request.method;

  const logMessage = `[${new Date().toLocaleTimeString(
    "pt-BR"
  )}] [${method}] -> ${pathname}`;

  console.log(logMessage);

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
