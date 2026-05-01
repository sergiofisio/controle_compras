import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ensureDb } from "@/server/db/data-source";
import { getSessionFromRequest } from "@/server/auth/session";
import { User } from "@/server/db/entities/User";
import { UserPhone } from "@/server/db/entities/UserPhone";
import { UserAddress } from "@/server/db/entities/UserAddress";
import { sessionCookieOptions } from "@/server/auth/cookies";
import { apiT } from "@/i18n/api-translate";

export const runtime = "nodejs";

export async function GET(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const phoneRepo = db.getRepository(UserPhone);
  const addressRepo = db.getRepository(UserAddress);
  const user = await userRepo.findOne({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: apiT(req, "api.userNotFound") }, { status: 404 });
  const [phones, addresses] = await Promise.all([
    phoneRepo.find({ where: { userId: user.id }, order: { createdAt: "ASC" } }),
    addressRepo.find({ where: { userId: user.id }, order: { createdAt: "ASC" } }),
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phones: phones.map((phone) => ({
        id: phone.id,
        countryCode: phone.countryCode,
        areaCode: phone.areaCode,
        phone: phone.phone,
        type: phone.type,
      })),
      addresses: addresses.map((address) => ({
        id: address.id,
        country: address.country,
        zipcode: address.zipcode,
        street: address.street,
        neighbour: address.neighbour,
        number: address.number,
        complement: address.complement,
        city: address.city,
        state: address.state,
        reference: address.reference,
        type: address.type,
      })),
      avatarUrl: user.avatarUrl,
      avatarUploadEnabled: false,
    },
  });
}

export async function PUT(req: import("next/server").NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: apiT(req, "api.unauthorized") }, { status: 401 });

  const { name, email, phones, addresses, avatarUrl, newPassword } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: apiT(req, "api.profileNameEmailRequired") }, { status: 400 });
  }

  const db = await ensureDb();
  const userRepo = db.getRepository(User);
  const phoneRepo = db.getRepository(UserPhone);
  const addressRepo = db.getRepository(UserAddress);
  const user = await userRepo.findOne({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: apiT(req, "api.userNotFound") }, { status: 404 });

  const normalizedEmail = String(email).trim().toLowerCase();
  const emailChanged = normalizedEmail !== user.email;

  if (emailChanged) {
    const conflict = await userRepo.findOne({ where: { email: normalizedEmail } });
    if (conflict && conflict.id !== user.id) {
      return NextResponse.json({ error: apiT(req, "api.emailInUse") }, { status: 409 });
    }
  }

  user.name = String(name).trim();
  user.email = normalizedEmail;
  user.avatarUrl = avatarUrl ? String(avatarUrl).trim() : null;

  if (newPassword) {
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: apiT(req, "api.passwordMinLength") }, { status: 400 });
    }
    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
  }

  const safePhones = Array.isArray(phones) ? phones : [];
  const safeAddresses = Array.isArray(addresses) ? addresses : [];
  if (safePhones.length > 10) {
    return NextResponse.json({ error: apiT(req, "api.phoneLimit") }, { status: 400 });
  }
  if (safeAddresses.length > 10) {
    return NextResponse.json({ error: apiT(req, "api.addressLimit") }, { status: 400 });
  }

  await db.transaction(async (trx) => {
    await trx.getRepository(User).save(user);
    await trx.getRepository(UserPhone).delete({ userId: user.id });
    await trx.getRepository(UserAddress).delete({ userId: user.id });

    const normalizedPhones = safePhones
      .map((phoneItem) => ({
        countryCode: String(phoneItem?.countryCode || "").replace(/\D/g, "").slice(0, 3),
        areaCode: String(phoneItem?.areaCode || "").replace(/\D/g, "").slice(0, 8),
        phone: String(phoneItem?.phone || "").replace(/[^\d]/g, "").slice(0, 20),
        type: String(phoneItem?.type || "MOBILE").toUpperCase(),
      }))
      .filter((phoneItem) => phoneItem.countryCode && phoneItem.areaCode && phoneItem.phone)
      .map((phoneItem) =>
        trx.getRepository(UserPhone).create({
          userId: user.id,
          countryCode: phoneItem.countryCode,
          areaCode: phoneItem.areaCode,
          phone: phoneItem.phone,
          type: ["MOBILE", "WORK", "HOME", "OTHER"].includes(phoneItem.type) ? (phoneItem.type as "MOBILE" | "WORK" | "HOME" | "OTHER") : "OTHER",
        }),
      );

    const normalizedAddresses = safeAddresses
      .map((addressItem) => ({
        country: String(addressItem?.country || "").trim().toUpperCase().slice(0, 2),
        zipcode: String(addressItem?.zipcode || "").trim() || null,
        street: String(addressItem?.street || "").trim(),
        neighbour: String(addressItem?.neighbour || "").trim() || null,
        number: String(addressItem?.number || "").trim() || null,
        complement: String(addressItem?.complement || "").trim() || null,
        city: String(addressItem?.city || "").trim(),
        state: String(addressItem?.state || "").trim() || null,
        reference: String(addressItem?.reference || "").trim() || null,
        type: String(addressItem?.type || "HOME").toUpperCase(),
      }))
      .filter((addressItem) => addressItem.country && addressItem.street && addressItem.city)
      .map((addressItem) =>
        trx.getRepository(UserAddress).create({
          userId: user.id,
          country: addressItem.country,
          zipcode: addressItem.zipcode,
          street: addressItem.street,
          neighbour: addressItem.neighbour,
          number: addressItem.number,
          complement: addressItem.complement,
          city: addressItem.city,
          state: addressItem.state,
          reference: addressItem.reference,
          type: ["HOME", "WORK", "OTHER"].includes(addressItem.type) ? (addressItem.type as "HOME" | "WORK" | "OTHER") : "OTHER",
        }),
      );

    if (normalizedPhones.length) {
      await trx.getRepository(UserPhone).save(normalizedPhones);
    }
    if (normalizedAddresses.length) {
      await trx.getRepository(UserAddress).save(normalizedAddresses);
    }
  });

  const response = NextResponse.json({
    message: emailChanged ? apiT(req, "api.profileUpdatedRelogin") : apiT(req, "api.profileUpdatedSuccess"),
    mustRelogin: emailChanged,
  });

  if (emailChanged) {
    response.cookies.set("session", "", sessionCookieOptions(0));
  }

  return response;
}
