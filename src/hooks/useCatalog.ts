"use client";

import { useEffect, useState } from "react";
import { getJson } from "@/lib/http";

export type Category = { id: string; name: string; isGlobal?: boolean };
export type BrandItem = { id: string; name: string; categoryId: string | null; isGlobal?: boolean };

export function useCatalog(familyId: string, categoryId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);

  useEffect(() => {
    if (!familyId) return;
    getJson<{ categories: Category[] }>(`/api/categories?familyId=${familyId}`).then((d) => setCategories(d.categories || []));
  }, [familyId]);

  useEffect(() => {
    if (!familyId) return;
    const query = categoryId ? `&categoryId=${categoryId}` : "";
    getJson<{ brands: BrandItem[] }>(`/api/brands?familyId=${familyId}${query}`).then((d) => setBrands(d.brands || []));
  }, [familyId, categoryId]);

  return { categories, brands, setCategories, setBrands };
}
