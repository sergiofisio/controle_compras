export function sessionCookieOptions(maxAge: number) {
  const domain = process.env.SESSION_COOKIE_DOMAIN;
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
    ...(domain ? { domain } : {}),
  };
}
