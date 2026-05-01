import type { NextRequest } from "next/server";
import { translate } from "./dictionaries";
import { langFromRequest } from "./locale-from-request";

export function apiT(req: NextRequest, key: string): string {
  return translate(langFromRequest(req), key);
}
