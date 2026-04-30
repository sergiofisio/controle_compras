import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { requireAdmin } from "@/server/auth/admin";
import { User } from "@/server/db/entities/User";
import { Family } from "@/server/db/entities/Family";
import { FamilyMember } from "@/server/db/entities/FamilyMember";
import { Store } from "@/server/db/entities/Store";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const admin = await requireAdmin(req);
  if (admin.error) return admin.error;

  const db = await ensureDb();
  const [users, families, memberships, stores] = await Promise.all([
    db.getRepository(User).find({ order: { createdAt: "DESC" } }),
    db.getRepository(Family).find({ order: { createdAt: "DESC" } }),
    db.getRepository(FamilyMember).find(),
    db.getRepository(Store).find({ order: { name: "ASC" } }),
  ]);

  const storesByFamily = families.map((family) => ({
    familyId: family.id,
    familyName: family.name,
    inviteCode: family.inviteCode,
    storesCount: stores.filter((s) => s.familyId === family.id).length,
    stores: stores.filter((s) => s.familyId === family.id).map((s) => ({ id: s.id, name: s.name, type: s.type })),
  }));

  return NextResponse.json({
    users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin, isActive: u.isActive, createdAt: u.createdAt })),
    families: families.map((f) => ({ id: f.id, name: f.name, inviteCode: f.inviteCode })),
    memberships,
    storesByFamily,
    summary: {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      inactiveUsers: users.filter((u) => !u.isActive).length,
      totalAdmins: users.filter((u) => u.isAdmin).length,
      activeAdmins: users.filter((u) => u.isAdmin && u.isActive).length,
    },
  });
}
