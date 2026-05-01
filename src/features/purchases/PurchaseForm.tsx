"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useCatalog";
import { useStores } from "@/hooks/useStores";
import { sendJson } from "@/lib/http";
import { calculateLine, DiscountType, formatCurrency, parseCurrencyInput, STORE_TYPE_OPTIONS, UNIT_OPTIONS } from "@/lib/purchase";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppField } from "@/components/ui/AppField";
import { useI18n } from "@/i18n";

type Category = { id: string; name: string; isGlobal?: boolean };
type BrandItem = { id: string; name: string; categoryId: string | null; isGlobal?: boolean };
type ProductSuggestion = { name: string; categoryId: string | null; brandId: string | null; unit: string };
type ShoppingListItemLite = { id: string; name: string; quantity: number; unit?: string; checked: boolean };
type ShoppingListLite = { id: string; name: string; items: ShoppingListItemLite[] };

type CartItem = {
  id: string;
  productName: string;
  categoryId: string | null;
  categoryName: string | null;
  brandId: string | null;
  brandName: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountPercent: number;
  promoQty: number;
  promoPrice: number;
  lineTotal: number;
  finalUnitPrice: number;
};

export function PurchaseForm({ familyId, onSaved }: { familyId: string; onSaved: () => void }) {
  const { t } = useI18n();
  const { stores, setStores } = useStores(familyId);
  const [selectedStoreName, setSelectedStoreName] = useState("");
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreType, setNewStoreType] = useState("supermercado");

  const [productName, setProductName] = useState("");
  const [productSuggestions, setProductSuggestions] = useState<ProductSuggestion[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [unit, setUnit] = useState("unidade");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCategoryId, setNewBrandCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [unitPriceInput, setUnitPriceInput] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("none");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountPercentInput, setDiscountPercentInput] = useState("");
  const [promoQty, setPromoQty] = useState(2);
  const [promoPrice, setPromoPrice] = useState(0);
  const [promoPriceInput, setPromoPriceInput] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [draftLoadedForFamily, setDraftLoadedForFamily] = useState("");
  const [shoppingLists, setShoppingLists] = useState<ShoppingListLite[]>([]);
  const [activeListId, setActiveListId] = useState("");
  const [checkingItemId, setCheckingItemId] = useState<string | null>(null);
  const { categories, brands, setCategories, setBrands } = useCatalog(familyId, categoryId);
  const activeStoreName = selectedStoreName || stores[0]?.name || "";
  const activeList = shoppingLists.find((list) => list.id === activeListId) || shoppingLists[0] || null;

  useEffect(() => {
    if (!familyId) return;
    fetch(`/api/purchases/draft?familyId=${familyId}`)
      .then((r) => r.json())
      .then((data) => {
        const draft = data.draft;
        if (draft) {
          setSelectedStoreName(draft.storeName ?? "");
          setCart((draft.cartItems ?? []) as CartItem[]);
        } else {
          setCart([]);
        }
      })
      .finally(() => setDraftLoadedForFamily(familyId));
  }, [familyId]);

  useEffect(() => {
    if (!familyId || draftLoadedForFamily !== familyId) return;
    const timer = setTimeout(() => {
      fetch("/api/purchases/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId, storeName: activeStoreName || null, cartItems: cart }),
      }).catch(() => undefined);
    }, 600);

    return () => clearTimeout(timer);
  }, [familyId, activeStoreName, cart, draftLoadedForFamily]);

  useEffect(() => {
    if (!familyId) return;
    const timer = setTimeout(() => {
      const query = encodeURIComponent(productName.trim());
      fetch(`/api/products/history?familyId=${familyId}&q=${query}`)
        .then((r) => r.json())
        .then((data) => setProductSuggestions(data.products || []))
        .catch(() => setProductSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [familyId, productName]);

  useEffect(() => {
    if (!familyId) return;
    fetch(`/api/lists?familyId=${familyId}`)
      .then((r) => r.json())
      .then((data) => {
        const fetchedLists = (data.lists || []) as ShoppingListLite[];
        setShoppingLists(fetchedLists);
        if (fetchedLists[0] && !activeListId) setActiveListId(fetchedLists[0].id);
      })
      .catch(() => setShoppingLists([]));
  }, [familyId, activeListId]);

  async function createStore() {
    if (!newStoreName.trim()) return;
    const { ok, data } = await sendJson<{ store?: { id: string; name: string; type: string } }>("/api/stores", "POST", { name: newStoreName.trim(), type: newStoreType, familyId });
    if (ok && data.store) {
      setStores((prev) => {
        const already = prev.some((s) => s.name === data.store?.name);
        return already ? prev : [...prev, data.store!];
      });
      setSelectedStoreName(data.store.name);
      setNewStoreName("");
    }
  }

  async function createCategory() {
    if (!familyId || !newCategoryName.trim()) return;
    const { ok, data } = await sendJson<{ category?: Category }>("/api/categories", "POST", { familyId, name: newCategoryName.trim() });
    if (ok && data.category) {
      setCategories((prev) => (prev.some((c) => c.id === data.category?.id) ? prev : [...prev, data.category!]));
      setCategoryId(data.category.id);
      setNewCategoryName("");
      setShowCategoryModal(false);
    }
  }

  async function deleteCategory(category: Category) {
    if (!familyId || category.isGlobal) return;
    const res = await fetch(`/api/categories/${category.id}?familyId=${familyId}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({ error: t("purchase.error.deleteSectionFailed") }));
    if (!res.ok) {
      toast.error(body.error || t("purchase.error.deleteSectionFailed"));
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    if (categoryId === category.id) setCategoryId("");
    toast.success(t("purchase.success.sectionDeleted"));
  }

  async function createBrand() {
    if (!familyId || !newBrandName.trim()) return;
    const { ok, data } = await sendJson<{ brand?: BrandItem }>("/api/brands", "POST", {
      familyId,
      name: newBrandName.trim(),
      categoryId: newBrandCategoryId || categoryId || null,
    });
    if (ok && data.brand) {
      setBrands((prev) => (prev.some((b) => b.id === data.brand?.id) ? prev : [...prev, data.brand!]));
      setBrandId(data.brand.id);
      setNewBrandName("");
      setShowBrandModal(false);
    }
  }

  async function deleteBrand(brand: BrandItem) {
    if (!familyId || brand.isGlobal) return;
    const res = await fetch(`/api/brands/${brand.id}?familyId=${familyId}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({ error: t("purchase.error.deleteBrandFailed") }));
    if (!res.ok) {
      toast.error(body.error || t("purchase.error.deleteBrandFailed"));
      return;
    }
    setBrands((prev) => prev.filter((b) => b.id !== brand.id));
    if (brandId === brand.id) setBrandId("");
    toast.success(t("purchase.success.brandDeleted"));
  }

  async function togglePickedItem(itemId: string, checked: boolean) {
    setCheckingItemId(itemId);
    try {
      const res = await fetch("/api/lists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, checked }),
      });
      const body = await res.json().catch(() => ({ error: t("purchase.error.updateItemFailed") }));
      if (!res.ok) {
        toast.error(body.error || t("purchase.error.updateItemFailed"));
        return;
      }

      setShoppingLists((current) =>
        current.map((list) => ({
          ...list,
          items: list.items.map((item) => (item.id === itemId ? { ...item, checked } : item)),
        })),
      );
    } finally {
      setCheckingItemId(null);
    }
  }

  function addToCart() {
    if (!productName.trim() || !activeStoreName || quantity <= 0 || unitPrice <= 0) return;

    const calc = calculateLine({ quantity, unitPrice, discountType, discountPercent, promoQty, promoPrice });

    const item: CartItem = {
      id: crypto.randomUUID(),
      productName: productName.trim(),
      categoryId: categoryId || null,
      categoryName: categories.find((c) => c.id === categoryId)?.name || null,
      brandId: brandId || null,
      brandName: brands.find((b) => b.id === brandId)?.name || null,
      unit,
      quantity,
      unitPrice,
      discountType,
      discountPercent,
      promoQty,
      promoPrice,
      lineTotal: calc.lineTotal,
      finalUnitPrice: calc.finalUnitPrice,
    };

    setCart((prev) => [...prev, item]);
    setProductName("");
    setCategoryId("");
    setBrandId("");
    setUnit("unidade");
    setQuantity(1);
    setUnitPrice(0);
    setUnitPriceInput("");
    setDiscountType("none");
    setDiscountPercent(0);
    setDiscountPercentInput("");
    setPromoQty(2);
    setPromoPrice(0);
    setPromoPriceInput("");
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + item.lineTotal, 0), [cart]);

  async function submitPurchase(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId || !activeStoreName || cart.length === 0) return;

    await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        familyId,
        storeName: activeStoreName,
        items: cart.map((item) => ({
          productName: item.productName,
          categoryId: item.categoryId,
          brandId: item.brandId,
          unit: item.unit,
          price: item.unitPrice,
          quantity: item.quantity,
          discountType: item.discountType,
          discountPercent: item.discountType === "percent" ? item.discountPercent : null,
          promoQty: item.discountType === "bulk" ? item.promoQty : null,
          promoPrice: item.discountType === "bulk" ? item.promoPrice : null,
        })),
      }),
    });

    await fetch(`/api/purchases/draft?familyId=${familyId}`, { method: "DELETE" });
    setCart([]);
    onSaved();
  }

  return (
    <form className="space-y-4" onSubmit={submitPurchase}>
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
        <AppField label={t("purchase.storeLabel")}>
          <AppSelect value={activeStoreName} onChange={(e) => setSelectedStoreName(e.target.value)}>
            <option value="">{t("common.select")}</option>
            {stores.map((store) => (
              <option key={store.id} value={store.name}>
                {store.name} ({store.type})
              </option>
            ))}
          </AppSelect>
        </AppField>

        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <AppField label={t("purchase.newStoreLabel")}>
            <AppInput placeholder={t("purchase.newStorePlaceholder")} value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)} />
          </AppField>
          <div className="flex items-end gap-2">
            <AppSelect className="w-auto" value={newStoreType} onChange={(e) => setNewStoreType(e.target.value)}>
              {STORE_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </AppSelect>
            <AppButton type="button" variant="secondary" onClick={createStore}>
              {t("common.save")}
            </AppButton>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-8">
        <AppInput
          className="md:col-span-2"
          placeholder={t("purchase.productPlaceholder")}
          list="purchase-product-suggestions"
          value={productName}
          onChange={(e) => {
            const value = e.target.value;
            setProductName(value);
            const match = productSuggestions.find((p) => p.name.toLowerCase() === value.trim().toLowerCase());
            if (match) {
              if (match.categoryId) setCategoryId(match.categoryId);
              if (match.brandId) setBrandId(match.brandId);
              if (match.unit) setUnit(match.unit);
            }
          }}
        />
        <datalist id="purchase-product-suggestions">
          {productSuggestions.map((suggestion) => (
            <option key={`purchase-${suggestion.name}`} value={suggestion.name} />
          ))}
        </datalist>
        <div className="md:col-span-2">
          <div className="flex gap-2">
            <AppSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">{t("dashboard.section")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AppSelect>
            <AppButton type="button" variant="ghost" className="px-2 text-xs" onClick={() => setShowCategoryModal(true)}>{t("purchase.addSection")}</AppButton>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="flex gap-2">
            <AppSelect value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              <option value="">{t("dashboard.brand")}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </AppSelect>
            <AppButton type="button" variant="ghost" className="px-2 text-xs" onClick={() => setShowBrandModal(true)}>{t("purchase.addBrand")}</AppButton>
          </div>
        </div>
        <AppInput type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} />
        <AppSelect value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </AppSelect>
        <AppInput
          inputMode="numeric"
          placeholder={t("purchase.unitPricePlaceholder")}
          value={unitPriceInput}
          onChange={(e) => {
            const parsed = parseCurrencyInput(e.target.value);
            setUnitPrice(parsed.value);
            setUnitPriceInput(parsed.display);
          }}
        />
        <AppSelect value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)}>
          <option value="none">{t("purchase.discount.none")}</option>
          <option value="percent">{t("purchase.discount.percent")}</option>
          <option value="bulk">{t("purchase.discount.bulk")}</option>
        </AppSelect>
        <AppButton type="button" variant="success" onClick={addToCart}>
          {t("purchase.addToCart")}
        </AppButton>

        {discountType === "percent" && (
          <AppInput
            className="md:col-span-2"
            inputMode="decimal"
            placeholder={t("purchase.percentPlaceholder")}
            value={discountPercentInput}
            onChange={(e) => {
              const raw = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
              setDiscountPercentInput(raw);
              setDiscountPercent(Number(raw) || 0);
            }}
          />
        )}

        {discountType === "bulk" && (
          <>
            <AppInput type="number" min={1} placeholder={t("purchase.promoQtyPlaceholder")} value={promoQty} onChange={(e) => setPromoQty(Number(e.target.value) || 1)} />
            <AppInput
              inputMode="numeric"
              placeholder={t("purchase.promoPackPlaceholder")}
              value={promoPriceInput}
              onChange={(e) => {
                const parsed = parseCurrencyInput(e.target.value);
                setPromoPrice(parsed.value);
                setPromoPriceInput(parsed.display);
              }}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">{t("purchase.cartTitle")}</h3>
        {cart.length === 0 ? (
          <p className="text-sm text-slate-500">{t("purchase.cartEmpty")}</p>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div key={item.id} className="grid items-center gap-2 rounded-lg border border-slate-200 p-2 text-sm md:grid-cols-[1.5fr_auto_auto_auto]">
                <div>
                  <p className="font-medium text-slate-800">{item.productName}</p>
                  <p className="text-xs text-slate-500">
                    {item.quantity} {item.unit} x {formatCurrency(item.unitPrice)}
                    {item.categoryName && ` | ${item.categoryName}`}
                    {item.brandName && ` | ${item.brandName}`}
                    {item.discountType === "percent" && ` ${t("purchase.lineDiscount").replace("{pct}", String(item.discountPercent))}`}
                    {item.discountType === "bulk" && ` ${t("purchase.lineBulk").replace("{qty}", String(item.promoQty)).replace("{price}", formatCurrency(item.promoPrice))}`}
                  </p>
                </div>
                <span className="text-slate-600">{formatCurrency(item.finalUnitPrice)}{t("purchase.perUnit")}</span>
                <span className="font-semibold text-slate-800">{formatCurrency(item.lineTotal)}</span>
                <AppButton type="button" variant="ghost" className="rounded-lg px-2 py-1 text-xs" onClick={() => removeItem(item.id)}>
                  {t("common.remove")}
                </AppButton>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
          <p className="text-sm text-slate-600">{t("purchase.cartTotalLabel")}</p>
          <p className="text-xl font-bold text-slate-900">{formatCurrency(cartTotal)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700">{t("purchase.listSectionTitle")}</h3>
          <AppSelect className="max-w-xs" value={activeListId || activeList?.id || ""} onChange={(e) => setActiveListId(e.target.value)}>
            {shoppingLists.length === 0 ? <option value="">{t("dashboard.noLists")}</option> : null}
            {shoppingLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </AppSelect>
        </div>

        {!activeList ? (
          <p className="text-sm text-slate-500">{t("purchase.noListsHint")}</p>
        ) : activeList.items.length === 0 ? (
          <p className="text-sm text-slate-500">{t("purchase.listEmpty")}</p>
        ) : (
          <ul className="space-y-2">
            {activeList.items.map((item) => (
              <li key={item.id} className={`flex items-center justify-between gap-2 rounded-lg border p-2 text-sm ${item.checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={item.checked} onChange={(e) => void togglePickedItem(item.id, e.target.checked)} />
                  <span className={item.checked ? "line-through text-slate-500" : "text-slate-800"}>
                    {item.name} - {item.quantity} {item.unit ?? t("purchase.unitFallback")}
                  </span>
                </label>
                {checkingItemId === item.id ? <span className="text-xs text-blue-700">{t("purchase.savingCheckbox")}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AppButton type="submit" disabled={!activeStoreName || cart.length === 0} className="w-full">
        {t("purchase.finalize")}
      </AppButton>

      {showCategoryModal && (
        <SimpleModal title={t("dashboard.modal.newSection")} onClose={() => setShowCategoryModal(false)}>
          <AppInput placeholder={t("dashboard.modal.sectionName")} value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
          <div className="mt-3 space-y-2">
            {categories
              .filter((c) => !c.isGlobal)
              .map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm">
                  <span>{category.name}</span>
                  <AppButton type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteCategory(category)}>
                    {t("dashboard.exclude")}
                  </AppButton>
                </div>
              ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <AppButton type="button" onClick={createCategory}>
              {t("common.save")}
            </AppButton>
          </div>
        </SimpleModal>
      )}

      {showBrandModal && (
        <SimpleModal title={t("dashboard.modal.newBrand")} onClose={() => setShowBrandModal(false)}>
          <AppInput placeholder={t("dashboard.modal.brandName")} value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
          <AppSelect className="mt-2" value={newBrandCategoryId} onChange={(e) => setNewBrandCategoryId(e.target.value)}>
            <option value="">{t("dashboard.modal.noSpecificSection")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </AppSelect>
          <div className="mt-3 space-y-2">
            {brands
              .filter((b) => !b.isGlobal)
              .map((brand) => (
                <div key={brand.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm">
                  <span>{brand.name}</span>
                  <AppButton type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteBrand(brand)}>
                    {t("dashboard.exclude")}
                  </AppButton>
                </div>
              ))}
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <AppButton type="button" onClick={createBrand}>
              {t("common.save")}
            </AppButton>
          </div>
        </SimpleModal>
      )}
    </form>
  );
}
