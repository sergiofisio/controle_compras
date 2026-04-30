"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/http";

export type Family = { id: string; name: string; role: string };

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [familyId, setFamilyId] = useState("");

  useEffect(() => {
    getJson<{ families: Family[] }>("/api/families")
      .then((data) => {
        const list = data.families || [];
        setFamilies(list);
        if (list[0]) setFamilyId(list[0].id);
      })
      .catch(() => {
        setFamilies([]);
        setFamilyId("");
      });
  }, []);

  return { families, familyId, setFamilyId, setFamilies };
}
