"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/http";

export type Store = { id: string; name: string; type: string };

export function useStores(familyId: string) {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    if (!familyId) return;
    getJson<{ stores: Store[] }>(`/api/stores?familyId=${familyId}`).then((d) => setStores(d.stores || []));
  }, [familyId]);

  return { stores, setStores };
}
