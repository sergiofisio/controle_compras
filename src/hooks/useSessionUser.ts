"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/http";

export type SessionUser = { userId: string; name: string; email: string; isAdmin?: boolean } | null;

export function useSessionUser() {
  const [user, setUser] = useState<SessionUser>(null);

  useEffect(() => {
    getJson<{ user: SessionUser }>("/api/auth/me").then((data) => setUser(data.user ?? null)).catch(() => setUser(null));
  }, []);

  return user;
}
