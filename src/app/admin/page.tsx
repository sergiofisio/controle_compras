"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { useI18n } from "@/i18n";

type User = { id: string; name: string; email: string; isAdmin: boolean; isActive: boolean; createdAt: string };
type Family = { id: string; name: string; inviteCode: string };
type Membership = { id: string; userId: string; familyId: string; role: "owner" | "member" };
type AccessLog = { id: string; action: string; email: string | null; createdAt: string; ip: string | null; metadata: Record<string, unknown> | null };
type StoreByFamily = { familyId: string; familyName: string; inviteCode: string; storesCount: number; stores: { id: string; name: string; type: string }[] };
type AdminTab = "overview" | "users" | "stores" | "logs";
type OverviewSummary = { totalUsers: number; activeUsers: number; inactiveUsers: number; totalAdmins: number; activeAdmins: number };
const adminTabTitle: Record<AdminTab, string> = {
  overview: "Admin - Resumo",
  users: "Admin - Usuarios",
  stores: "Admin - Supermercados",
  logs: "Admin - Logs",
};

export default function AdminPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [users, setUsers] = useState<User[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [storesByFamily, setStoresByFamily] = useState<StoreByFamily[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [summary, setSummary] = useState<OverviewSummary | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [moveTargetFamilyId, setMoveTargetFamilyId] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [movingUserId, setMovingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const membershipMap = useMemo(() => {
    const map = new Map<string, Membership[]>();
    memberships.forEach((m) => {
      const list = map.get(m.userId) || [];
      list.push(m);
      map.set(m.userId, list);
    });
    return map;
  }, [memberships]);

  const loadAll = useCallback(async () => {
    const overviewRes = await fetch("/api/admin/overview");
    if (overviewRes.status === 403 || overviewRes.status === 401) {
      router.push("/login");
      return;
    }

    const overview = await overviewRes.json();
    setUsers(overview.users || []);
    setFamilies(overview.families || []);
    setMemberships(overview.memberships || []);
    setStoresByFamily(overview.storesByFamily || []);
    setSummary(overview.summary || null);

    const logsRes = await fetch("/api/admin/logs?limit=200");
    if (logsRes.ok) {
      const logsBody = await logsRes.json();
      setLogs(logsBody.logs || []);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAll();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAll]);

  useEffect(() => {
    document.title = `${adminTabTitle[activeTab]} | Controle Compras`;
  }, [activeTab]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUser(true);
    try {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, familyId: familyId || null }),
    });

    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error || "Falha ao criar usuario");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    toast.success("Usuario criado com sucesso");
    await loadAll();
    } finally {
      setCreatingUser(false);
    }
  }

  async function deleteUser(userId: string) {
    setDeletingUserId(userId);
    try {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error || "Falha ao remover usuario");
      return;
    }
    toast.success("Usuario removido com sucesso");
    await loadAll();
    } finally {
      setDeletingUserId(null);
    }
  }

  async function moveUser(userId: string, sourceFamilyId?: string) {
    if (!moveTargetFamilyId) {
      toast.error("Selecione a familia de destino");
      return;
    }
    setMovingUserId(userId);
    try {
    const res = await fetch(`/api/admin/users/${userId}/move`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetFamilyId: moveTargetFamilyId, sourceFamilyId: sourceFamilyId || null }),
    });

    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error || "Falha ao mover usuario");
      return;
    }

    toast.success("Usuario movido com sucesso");
    await loadAll();
    } finally {
      setMovingUserId(null);
    }
  }

  async function toggleUserStatus(userId: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error || "Falha ao atualizar status do usuario");
      return;
    }
    toast.success(isActive ? "Usuario desativado com sucesso" : "Usuario ativado com sucesso");
    await loadAll();
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <AnimatedPage className="mx-auto max-w-7xl space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("admin.title")}</h1>
              <p className="mt-1 text-sm text-slate-500">{t("admin.subtitle")}</p>
            </div>
            <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              {t("admin.back")}
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AppButton variant={activeTab === "overview" ? "primary" : "ghost"} onClick={() => setActiveTab("overview")}>{t("admin.tab.overview")}</AppButton>
            <AppButton variant={activeTab === "users" ? "primary" : "ghost"} onClick={() => setActiveTab("users")}>{t("admin.tab.users")}</AppButton>
            <AppButton variant={activeTab === "stores" ? "primary" : "ghost"} onClick={() => setActiveTab("stores")}>{t("admin.tab.stores")}</AppButton>
            <AppButton variant={activeTab === "logs" ? "primary" : "ghost"} onClick={() => setActiveTab("logs")}>{t("admin.tab.logs")}</AppButton>
          </div>
        </section>

        {activeTab === "overview" && (
          <section className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Usuarios</p><p className="text-2xl font-bold text-slate-900">{summary?.totalUsers ?? users.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Usuarios ativos</p><p className="text-2xl font-bold text-slate-900">{summary?.activeUsers ?? users.filter((u) => u.isActive).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Usuarios inativos</p><p className="text-2xl font-bold text-slate-900">{summary?.inactiveUsers ?? users.filter((u) => !u.isActive).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Total de admins</p><p className="text-2xl font-bold text-slate-900">{summary?.totalAdmins ?? users.filter((u) => u.isAdmin).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Admins ativos</p><p className="text-2xl font-bold text-slate-900">{summary?.activeAdmins ?? users.filter((u) => u.isAdmin && u.isActive).length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Familias</p><p className="text-2xl font-bold text-slate-900">{families.length}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Supermercados</p><p className="text-2xl font-bold text-slate-900">{storesByFamily.reduce((acc, cur) => acc + cur.storesCount, 0)}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-sm text-slate-500">Eventos em log</p><p className="text-2xl font-bold text-slate-900">{logs.length}</p></div>
          </section>
        )}

        {activeTab === "users" && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Adicionar usuario</h2>
              <form className="grid gap-2 md:grid-cols-5" onSubmit={createUser}>
                <AppInput placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
                <AppInput placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <AppInput placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <AppSelect value={familyId} onChange={(e) => setFamilyId(e.target.value)}>
                  <option value="">Sem familia</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>{family.name} ({family.inviteCode})</option>
                  ))}
                </AppSelect>
                <AppButton type="submit" loading={creatingUser} loadingText="Criando...">Criar</AppButton>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Usuarios cadastrados</h2>
                <AppSelect className="max-w-xs" value={moveTargetFamilyId} onChange={(e) => setMoveTargetFamilyId(e.target.value)}>
                  <option value="">Selecione familia de destino</option>
                  {families.map((family) => (
                    <option key={family.id} value={family.id}>
                      {family.name}
                    </option>
                  ))}
                </AppSelect>
              </div>

              <div className="space-y-2">
                {users.map((user) => {
                  const userMemberships = membershipMap.get(user.id) || [];
                  const firstMembership = userMemberships[0];
                  return (
                    <div key={user.id} className="rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold text-slate-900">
                        {user.name} {user.isAdmin ? "(admin)" : ""}
                      </p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className={`mt-1 text-xs font-semibold ${user.isActive ? "text-emerald-700" : "text-amber-700"}`}>
                        Status: {user.isActive ? "Ativo" : "Inativo"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Familias: {userMemberships.map((m) => families.find((f) => f.id === m.familyId)?.name || m.familyId).join(", ") || "sem familia"}</p>
                      <div className="mt-2 flex gap-2">
                        <AppButton variant="ghost" onClick={() => moveUser(user.id, firstMembership?.familyId)} loading={movingUserId === user.id} loadingText="Movendo...">
                          Mover
                        </AppButton>
                        <AppButton variant={user.isActive ? "secondary" : "success"} onClick={() => toggleUserStatus(user.id, user.isActive)}>
                          {user.isActive ? "Desativar" : "Ativar"}
                        </AppButton>
                        <AppButton variant="danger" onClick={() => deleteUser(user.id)} loading={deletingUserId === user.id} loadingText="Removendo...">
                          Deletar conta
                        </AppButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {activeTab === "stores" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Supermercados/lojas utilizados por familia</h2>
            <div className="space-y-3">
              {storesByFamily.map((item) => (
                <div key={item.familyId} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">{item.familyName}</p>
                  <p className="text-xs text-slate-500">Codigo: {item.inviteCode}</p>
                  <p className="mt-1 text-sm text-slate-600">Total de lojas: {item.storesCount}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.stores.map((s) => (
                      <span key={s.id} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700">
                        {s.name} ({s.type})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "logs" && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Historico de uso (logs)</h2>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-800">{log.action}</p>
                  <p className="text-slate-600">
                    {log.email || "-"} | {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-slate-500">IP: {log.ip || "-"}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </AnimatedPage>
    </main>
  );
}
