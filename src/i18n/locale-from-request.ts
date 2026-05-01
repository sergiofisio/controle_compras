import type { NextRequest } from "next/server";
import type { Lang } from "./types";

export function langFromRequest(req: Pick<NextRequest, "cookies">): Lang {
  const v = req.cookies.get("app_lang")?.value;
  if (v === "pt" || v === "en" || v === "es" || v === "fr") return v;
  return "pt";
}
