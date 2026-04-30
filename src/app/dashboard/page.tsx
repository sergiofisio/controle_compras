"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ensureSocket } from "@/features/realtime/socket-client";
import { PurchaseForm } from "@/features/purchases/PurchaseForm";
import { PriceVariationCard } from "@/features/dashboard/PriceVariationCard";
import { AnimatedPage } from "@/components/AnimatedPage";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { ContextHeader } from "@/components/dashboard/ContextHeader";
import { SimpleModal } from "@/components/ui/SimpleModal";
import { sendJson, getJson } from "@/lib/http";
import { useSessionUser } from "@/hooks/useSessionUser";
import { useFamilies } from "@/hooks/useFamilies";
import { useCatalog } from "@/hooks/useCatalog";
import { UNIT_OPTIONS } from "@/lib/purchase";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { useI18n } from "@/i18n";

type ListItem = { id: string; name: string; quantity: number; checked: boolean; unit?: string; categoryId?: string | null; brandId?: string | null };
type ShoppingList = { id: string; name: string; items: ListItem[] };
type DashboardTab = "overview" | "lists" | "purchase";
type Analytics = { totalSpent?: number; purchasesCount?: number; priceVariationPercent?: number } | null;
type BrandSummary = { id: string; name: string; categoryId: string | null };
type ProductSuggestion = { name: string; categoryId: string | null; brandId: string | null; unit: string };

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const user = useSessionUser();
  const { families, familyId, setFamilyId, setFamilies } = useFamilies();

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>(null);

  const [newListName, setNewListName] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [showListManagerModal, setShowListManagerModal] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemSuggestions, setItemSuggestions] = useState<ProductSuggestion[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("unidade");
  const [ocrSuggestion, setOcrSuggestion] = useState<{ productName: string; price: number | null } | null>(null);
  const [allBrands, setAllBrands] = useState<BrandSummary[]>([]);

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const { categories, brands, setCategories, setBrands } = useCatalog(familyId, categoryId);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCategoryId, setNewBrandCategoryId] = useState("");
  const [deletingListId, setDeletingListId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const [inviteCode, setInviteCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [familyMessage, setFamilyMessage] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [creatingList, setCreatingList] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [joiningFamily, setJoiningFamily] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!familyId) return;
    getJson<{ lists: ShoppingList[] }>(`/api/lists?familyId=${familyId}`).then((d) => setLists(d.lists || []));
    getJson<Analytics>(`/api/analytics?familyId=${familyId}`).then(setAnalytics);
    getJson<{ brands: BrandSummary[] }>(`/api/brands?familyId=${familyId}`).then((d) => setAllBrands(d.brands || []));
  }, [familyId]);

  const effectiveSelectedListId = lists.some((list) => list.id === selectedListId) ? selectedListId : lists[0]?.id || "";

  useEffect(() => {
    if (!familyId) return;
    const timer = setTimeout(() => {
      const query = encodeURIComponent(itemName.trim());
      fetch(`/api/products/history?familyId=${familyId}&q=${query}`)
        .then((r) => r.json())
        .then((data) => setItemSuggestions(data.products || []))
        .catch(() => setItemSuggestions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [familyId, itemName]);

  useEffect(() => {
    let mounted = true;
    ensureSocket().then((socket) => {
      if (!mounted) return;
      const onListUpdated = ({ listId, item, itemId, action }: { listId: string; item?: ListItem; itemId?: string; action?: string }) => {
        setLists((current) =>
          current.map((list) => {
            if (list.id !== listId) return list;
            const safeItems = (list.items || []).filter((existingItem): existingItem is ListItem => Boolean(existingItem && existingItem.id));

            if (action === "item_deleted" && itemId) {
              return { ...list, items: safeItems.filter((existingItem) => existingItem.id !== itemId) };
            }

            if (!item) return list;

            const alreadyExists = safeItems.some((existingItem) => existingItem.id === item.id);
            if (alreadyExists) return list;
            return { ...list, items: [...safeItems, item] };
          }),
        );
      };

      lists.forEach((list) => socket.emit("join-list", list.id));
      socket.on("list-updated", onListUpdated);

      return () => {
        lists.forEach((list) => socket.emit("leave-list", list.id));
        socket.off("list-updated", onListUpdated);
      };
    });

    return () => {
      mounted = false;
    };
  }, [lists]);

  const totalItems = useMemo(() => lists.reduce((acc, list) => acc + list.items.length, 0), [lists]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId || !itemName || !effectiveSelectedListId) {
      toast.error("Crie ou selecione uma lista antes de adicionar itens");
      return;
    }
    setAddingItem(true);

    try {
      const { ok, data } = await sendJson<{ item: ListItem; listId: string }>("/api/lists", "POST", {
        familyId,
        listId: effectiveSelectedListId,
        itemName,
        quantity,
        unit,
        categoryId: categoryId || null,
        brandId: brandId || null,
      });

      if (!ok) return;

      setItemName("");
      setCategoryId("");
      setBrandId("");
      setUnit("unidade");

      setLists((current) =>
        current.map((list) =>
          list.id === data.listId ? { ...list, items: [...(list.items || []), data.item] } : list,
        ),
      );
      toast.success("Item adicionado na lista");
    } finally {
      setAddingItem(false);
    }
  }

  async function createList() {
    if (!familyId || !newListName.trim()) return;
    setCreatingList(true);
    try {
      const { ok, data } = await sendJson<{ listId: string; list: { id: string; name: string; familyId: string } }>("/api/lists", "POST", {
        familyId,
        listName: newListName.trim(),
      });
      if (!ok) {
        toast.error("Falha ao criar lista");
        return;
      }

      setLists((current) => {
        const exists = current.some((list) => list.id === data.listId);
        if (exists) return current;
        return [...current, { id: data.list.id, name: data.list.name, items: [] }];
      });
      setSelectedListId(data.listId);
      setNewListName("");
      toast.success("Lista criada com sucesso");
    } finally {
      setCreatingList(false);
    }
  }

  async function handleOcr(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/ocr", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      setOcrSuggestion(data.suggestion);
      setItemName(data.suggestion.productName || "");
    }
  }

  async function createCategory() {
    if (!familyId || !newCategoryName.trim()) return;
    const { ok, data } = await sendJson<{ category: { id: string; name: string } }>("/api/categories", "POST", {
      familyId,
      name: newCategoryName.trim(),
    });
    if (!ok) return;

    setCategories((prev) => (prev.some((c) => c.id === data.category.id) ? prev : [...prev, data.category]));
    setCategoryId(data.category.id);
    setNewCategoryName("");
    setShowCategoryModal(false);
  }

  async function deleteCategory(categoryIdToDelete: string) {
    if (!familyId) return;
    const target = categories.find((c) => c.id === categoryIdToDelete);
    if (!target || target.isGlobal) {
      toast.error("Nao e permitido remover secoes globais");
      return;
    }
    const res = await fetch(`/api/categories/${categoryIdToDelete}?familyId=${familyId}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({ error: "Falha ao excluir secao" }));
    if (!res.ok) {
      toast.error(body.error || "Falha ao excluir secao");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryIdToDelete));
    if (categoryId === categoryIdToDelete) setCategoryId("");
    toast.success("Secao excluida com sucesso");
  }

  async function createBrand() {
    if (!familyId || !newBrandName.trim()) return;
    const { ok, data } = await sendJson<{ brand: { id: string; name: string; categoryId: string | null } }>("/api/brands", "POST", {
      familyId,
      name: newBrandName.trim(),
      categoryId: newBrandCategoryId || categoryId || null,
    });
    if (!ok) return;

    setBrands((prev) => (prev.some((b) => b.id === data.brand.id) ? prev : [...prev, data.brand]));
    setBrandId(data.brand.id);
    setNewBrandName("");
    setShowBrandModal(false);
  }

  async function deleteBrand(brandIdToDelete: string) {
    if (!familyId) return;
    const target = brands.find((b) => b.id === brandIdToDelete);
    if (!target || target.isGlobal) {
      toast.error("Nao e permitido remover marcas globais");
      return;
    }
    const res = await fetch(`/api/brands/${brandIdToDelete}?familyId=${familyId}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({ error: "Falha ao excluir marca" }));
    if (!res.ok) {
      toast.error(body.error || "Falha ao excluir marca");
      return;
    }
    setBrands((prev) => prev.filter((b) => b.id !== brandIdToDelete));
    if (brandId === brandIdToDelete) setBrandId("");
    toast.success("Marca excluida com sucesso");
  }

  async function generateInvite() {
    if (!familyId) return;
    setGeneratingInvite(true);
    setFamilyMessage("");
    try {
      const { ok, data } = await sendJson<{ invite: { inviteCode: string }; error?: string }>("/api/families/invites", "POST", { familyId });
      if (!ok) {
        const msg = (data as { error?: string }).error || "Falha ao gerar convite";
        setFamilyMessage(msg);
        toast.error(msg);
        return;
      }
      setInviteCode(data.invite.inviteCode);
      setFamilyMessage("Codigo de convite gerado.");
      toast.success("Codigo de convite gerado");
    } finally {
      setGeneratingInvite(false);
    }
  }

  async function joinFamily() {
    if (!joinCode.trim()) return;
    setJoiningFamily(true);
    setFamilyMessage("");
    try {
      const { ok, data } = await sendJson<{ familyId?: string; error?: string }>("/api/families/join", "POST", { inviteCode: joinCode.trim().toUpperCase() });
      if (!ok) {
        const msg = data.error || "Falha ao entrar na familia";
        setFamilyMessage(msg);
        toast.error(msg);
        return;
      }

      setFamilyMessage("Voce entrou na familia com sucesso.");
      toast.success("Voce entrou na familia com sucesso");
      setJoinCode("");

      getJson<{ families: typeof families }>("/api/families").then((resp) => {
        setFamilies(resp.families || []);
        if (data.familyId) setFamilyId(data.familyId);
      });
    } finally {
      setJoiningFamily(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await sendJson<{ ok: boolean }>("/api/auth/logout", "POST");
      toast.success("Logout realizado");
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  async function deleteList(listId: string) {
    setDeletingListId(listId);
    try {
      const res = await fetch("/api/lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId }),
      });
      const body = await res.json().catch(() => ({ error: "Falha ao apagar lista" }));
      if (!res.ok) {
        toast.error(body.error || "Falha ao apagar lista");
        return;
      }
      setLists((current) => current.filter((list) => list.id !== listId));
      toast.success("Lista apagada com sucesso");
    } finally {
      setDeletingListId(null);
    }
  }

  async function deleteListItem(listId: string, itemId: string) {
    setDeletingItemId(itemId);
    try {
      const res = await fetch("/api/lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      const body = await res.json().catch(() => ({ error: "Falha ao apagar item" }));
      if (!res.ok) {
        toast.error(body.error || "Falha ao apagar item");
        return;
      }

      setLists((current) =>
        current.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((item) => item.id !== itemId) }
            : list,
        ),
      );
      toast.success("Item removido da lista");
    } finally {
      setDeletingItemId(null);
    }
  }

  const tabMeta: Record<DashboardTab, { title: string; subtitle: string }> = {
    overview: { title: t("dashboard.overview.title"), subtitle: t("dashboard.overview.subtitle") },
    lists: { title: t("dashboard.lists.title"), subtitle: t("dashboard.lists.subtitle") },
    purchase: { title: t("dashboard.purchase.title"), subtitle: t("dashboard.purchase.subtitle") },
  };
  const currentMeta = tabMeta[activeTab];
  useEffect(() => {
    document.title = `${currentMeta.title} | Controle Compras`;
  }, [currentMeta.title]);

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <AnimatedPage className="mx-auto max-w-7xl">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <SidebarNav userName={user?.name ?? ""} activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} isAdmin={Boolean(user?.isAdmin)} isLoggingOut={loggingOut} />

          <section className="space-y-4">
            <ContextHeader title={currentMeta.title} subtitle={currentMeta.subtitle} familyId={familyId} families={families} setFamilyId={setFamilyId} email={user?.email ?? ""} />

            {activeTab === "overview" && (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
                    <p className="text-sm text-slate-500">Total gasto</p>
                    <p className="text-2xl font-bold text-slate-900">R$ {analytics?.totalSpent?.toFixed?.(2) ?? "0,00"}</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
                    <p className="text-sm text-slate-500">Compras</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics?.purchasesCount ?? 0}</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow">
                    <p className="text-sm text-slate-500">Itens na lista</p>
                    <p className="text-2xl font-bold text-slate-900">{totalItems}</p>
                  </motion.div>
                </section>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <PriceVariationCard value={analytics?.priceVariationPercent ?? 0} />
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-900">Compartilhar familia</h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex gap-2">
                      <AppButton type="button" onClick={generateInvite} loading={generatingInvite}>
                        Gerar codigo
                      </AppButton>
                      {inviteCode && <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">{inviteCode}</span>}
                    </div>
                    <div className="flex gap-2">
                      <AppInput placeholder="Digite codigo para entrar em outra familia" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                      <AppButton type="button" variant="secondary" onClick={joinFamily} loading={joiningFamily}>
                        Entrar
                      </AppButton>
                    </div>
                    {familyMessage && <p className="text-sm text-slate-600">{familyMessage}</p>}
                  </div>
                </section>
              </>
            )}

            {activeTab === "lists" && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Adicionar item na lista compartilhada</h2>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <AppSelect className="max-w-sm" value={effectiveSelectedListId} onChange={(e) => setSelectedListId(e.target.value)}>
                      {lists.length === 0 ? <option value="">Sem listas</option> : null}
                      {lists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </AppSelect>
                    <AppButton type="button" variant="secondary" onClick={() => setShowListManagerModal(true)}>
                      Gerenciar listas
                    </AppButton>
                  </div>
                  <form className="grid gap-2 md:grid-cols-6" onSubmit={addItem}>
                    <AppInput
                      placeholder="Produto"
                      list="dashboard-item-suggestions"
                      value={itemName}
                      onChange={(e) => {
                        const value = e.target.value;
                        setItemName(value);
                        const match = itemSuggestions.find((p) => p.name.toLowerCase() === value.trim().toLowerCase());
                        if (match) {
                          if (match.categoryId) setCategoryId(match.categoryId);
                          if (match.brandId) setBrandId(match.brandId);
                          if (match.unit) setUnit(match.unit);
                        }
                      }}
                    />
                    <datalist id="dashboard-item-suggestions">
                      {itemSuggestions.map((suggestion) => (
                        <option key={`dashboard-${suggestion.name}`} value={suggestion.name} />
                      ))}
                    </datalist>
                    <div className="flex gap-2">
                      <AppSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">Secao</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </AppSelect>
                      <AppButton type="button" variant="ghost" className="px-2 text-xs" onClick={() => setShowCategoryModal(true)}>
                        +
                      </AppButton>
                    </div>
                    <div className="flex gap-2">
                      <AppSelect value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                        <option value="">Marca</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </AppSelect>
                      <AppButton type="button" variant="ghost" className="px-2 text-xs" onClick={() => setShowBrandModal(true)}>
                        +
                      </AppButton>
                    </div>
                    <AppInput type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                    <AppSelect value={unit} onChange={(e) => setUnit(e.target.value)}>
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </AppSelect>
                    <AppButton type="submit" loading={addingItem} loadingText="Adicionando...">Adicionar</AppButton>
                  </form>

                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                    <label className="text-sm font-medium text-slate-600">Foto do produto (OCR local)</label>
                    <input
                      className="mt-2 block w-full text-sm"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleOcr(file);
                      }}
                    />
                    {ocrSuggestion && (
                      <p className="mt-2 text-sm text-slate-600">
                        Sugestao OCR: {ocrSuggestion.productName} - {ocrSuggestion.price ? `R$ ${ocrSuggestion.price.toFixed(2)}` : "preco nao detectado"}
                      </p>
                    )}
                  </div>
                </section>

                {showListManagerModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-lg">
                      <h4 className="text-lg font-semibold text-slate-900">Gerenciar listas</h4>
                      <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                        <AppInput placeholder="Nome da nova lista" value={newListName} onChange={(e) => setNewListName(e.target.value)} />
                        <AppButton type="button" onClick={createList} loading={creatingList} loadingText="Criando...">
                          Criar lista
                        </AppButton>
                      </div>

                      <div className="mt-4 space-y-2">
                        {lists.map((list) => (
                          <div key={list.id} className="rounded-xl border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-semibold text-slate-900">{list.name}</p>
                              <div className="flex items-center gap-2">
                                <AppButton type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={() => setSelectedListId(list.id)}>
                                  Usar
                                </AppButton>
                                <AppButton type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteList(list.id)} loading={deletingListId === list.id} loadingText="Apagando...">
                                  Apagar
                                </AppButton>
                              </div>
                            </div>
                            <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-600">
                              {list.items.length} item(ns)
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <AppButton type="button" variant="ghost" onClick={() => setShowListManagerModal(false)}>
                          Fechar
                        </AppButton>
                      </div>
                    </div>
                  </div>
                )}

                <section className="grid gap-4 md:grid-cols-2">
                  {lists.map((list, index) => (
                    <motion.div key={list.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{list.name}</h3>
                        <AppButton
                          type="button"
                          variant="danger"
                          className="px-2 py-1 text-xs"
                          onClick={() => deleteList(list.id)}
                          loading={deletingListId === list.id}
                          loadingText="Apagando..."
                        >
                          Apagar lista
                        </AppButton>
                      </div>
                      <div className="mt-3 space-y-3">
                        {Object.entries(
                          list.items.reduce<Record<string, ListItem[]>>((acc, item) => {
                            const categoryName = categories.find((c) => c.id === item.categoryId)?.name || "Sem secao";
                            acc[categoryName] = [...(acc[categoryName] || []), item];
                            return acc;
                          }, {}),
                        ).map(([sectionName, sectionItems]) => (
                          <div key={`${list.id}-${sectionName}`} className="rounded-xl border border-slate-200 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{sectionName}</p>
                            <ul className="mt-2 space-y-2 text-sm">
                              {sectionItems.map((item, itemIndex) => {
                                const brandName = allBrands.find((b) => b.id === item.brandId)?.name || "Sem marca";
                                return (
                                  <li key={`${list.id}-${sectionName}-${item.id}-${itemIndex}`} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="font-medium text-slate-900">{item.name}</p>
                                      <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                          {item.quantity} {item.unit ?? "unidade"}
                                        </span>
                                        <AppButton
                                          type="button"
                                          variant="danger"
                                          className="px-2 py-1 text-xs"
                                          onClick={() => deleteListItem(list.id, item.id)}
                                          loading={deletingItemId === item.id}
                                          loadingText="..."
                                        >
                                          Remover
                                        </AppButton>
                                      </div>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Marca: {brandName}</p>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </section>

                {showCategoryModal && (
                  <SimpleModal title="Nova secao" onClose={() => setShowCategoryModal(false)}>
                    <AppInput placeholder="Nome da secao" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                    <div className="mt-3 space-y-2">
                      {categories
                        .filter((c) => !c.isGlobal)
                        .map((category) => (
                          <div key={category.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm">
                            <span>{category.name}</span>
                            <AppButton type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteCategory(category.id)}>
                              Excluir
                            </AppButton>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <AppButton type="button" onClick={createCategory}>
                        Salvar
                      </AppButton>
                    </div>
                  </SimpleModal>
                )}

                {showBrandModal && (
                  <SimpleModal title="Nova marca" onClose={() => setShowBrandModal(false)}>
                    <AppInput placeholder="Nome da marca" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} />
                    <AppSelect className="mt-2" value={newBrandCategoryId} onChange={(e) => setNewBrandCategoryId(e.target.value)}>
                      <option value="">Sem secao especifica</option>
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
                            <AppButton type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => deleteBrand(brand.id)}>
                              Excluir
                            </AppButton>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <AppButton type="button" onClick={createBrand}>
                        Salvar
                      </AppButton>
                    </div>
                  </SimpleModal>
                )}
              </>
            )}

            {activeTab === "purchase" && (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Registrar compra</h2>
                <PurchaseForm
                  familyId={familyId}
                  onSaved={() => {
                    if (!familyId) return;
                    getJson<Analytics>(`/api/analytics?familyId=${familyId}`).then(setAnalytics);
                  }}
                />
              </section>
            )}
          </section>
        </div>
      </AnimatedPage>
    </main>
  );
}
