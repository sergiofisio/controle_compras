"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatedPage } from "@/components/AnimatedPage";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { AppSelect } from "@/components/ui/AppSelect";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useI18n } from "@/i18n";
type PhoneType = "MOBILE" | "WORK" | "HOME" | "OTHER";
type AddressType = "HOME" | "WORK" | "OTHER";
type Phone = { id?: string; countryCode: string; areaCode: string; phone: string; type: PhoneType };
type Address = {
  id?: string;
  country: string;
  zipcode: string;
  street: string;
  neighbour: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  reference: string;
  type: AddressType;
};
type Country = { code: string; name: string };

const EMPTY_PHONE: Phone = { countryCode: "55", areaCode: "", phone: "", type: "MOBILE" };
const EMPTY_ADDRESS: Address = {
  country: "BR",
  zipcode: "",
  street: "",
  neighbour: "",
  number: "",
  complement: "",
  city: "",
  state: "",
  reference: "",
  type: "HOME",
};

type ProfileResponse = {
  user?: {
    id: string;
    name: string;
    email: string;
    phones?: Phone[];
    addresses?: Address[];
    avatarUrl?: string | null;
    avatarUploadEnabled?: boolean;
  };
};

export default function ProfilePage() {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phones, setPhones] = useState<Phone[]>([{ ...EMPTY_PHONE }]);
  const [addresses, setAddresses] = useState<Address[]>([{ ...EMPTY_ADDRESS }]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploadEnabled, setAvatarUploadEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data: ProfileResponse) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setPhones(data.user.phones?.length ? data.user.phones : [{ ...EMPTY_PHONE }]);
          setAddresses(data.user.addresses?.length ? data.user.addresses : [{ ...EMPTY_ADDRESS }]);
          setAvatarUrl(data.user.avatarUrl || "");
          setAvatarUploadEnabled(Boolean(data.user.avatarUploadEnabled));
        }
      });
    fetch("/api/location/countries")
      .then((r) => r.json())
      .then((data: { countries?: Country[] }) => setCountries(data.countries || []))
      .catch(() => setCountries([]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phones,
        addresses,
        avatarUrl: avatarUrl || null,
        newPassword: newPassword || undefined,
      }),
    });

    const body = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(body.error || t("profile.error.updateFailed"));
      return;
    }

    setNewPassword("");
    toast.success(body.message || t("profile.success.updated"));

    if (body.mustRelogin) {
      setTimeout(() => router.push("/login"), 900);
    }
  }

  function updatePhone(index: number, field: keyof Phone, value: string) {
    setPhones((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function updateAddress(index: number, field: keyof Address, value: string) {
    setAddresses((current) => current.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function autofillAddressByZip(index: number) {
    const target = addresses[index];
    if (!target || target.country !== "BR") return;
    const zip = target.zipcode.replace(/\D/g, "");
    if (zip.length !== 8) {
      toast.error(t("profile.error.invalidZip"));
      return;
    }
    const response = await fetch(`/api/location/zipcode?country=BR&zipcode=${zip}`);
    const body = await response.json();
    if (!response.ok) {
      toast.error(body.error || t("profile.error.zipLookupFailed"));
      return;
    }
    if (!body.address) return;
    setAddresses((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              street: body.address.street || item.street,
              neighbour: body.address.neighbour || item.neighbour,
              city: body.address.city || item.city,
              state: body.address.state || item.state,
              complement: body.address.complement || item.complement,
            }
          : item,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-blue-50 p-4 md:p-6">
      <AnimatedPage className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t("profile.title")}</h1>
              <p className="mt-1 text-sm text-slate-500">{t("profile.subtitle")}</p>
            </div>
            <div className="w-full max-w-[180px]">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <form className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={onSubmit}>
          <AppInput placeholder={t("profile.name")} value={name} onChange={(e) => setName(e.target.value)} />
          <AppInput placeholder={t("profile.email")} value={email} onChange={(e) => setEmail(e.target.value)} />
          <p className="-mt-2 text-xs text-slate-500">{t("profile.emailWarn")}</p>
          <AppInput placeholder={t("profile.avatar")} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />

          <section className="space-y-3 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t("profile.phones")}</h3>
              <AppButton type="button" variant="secondary" onClick={() => setPhones((current) => [...current, { ...EMPTY_PHONE }])}>
                {t("profile.addPhone")}
              </AppButton>
            </div>
            {phones.map((phoneItem, index) => (
              <div key={`phone-${index}`} className="grid gap-2 md:grid-cols-5">
                <AppInput placeholder="+55" value={phoneItem.countryCode} onChange={(e) => updatePhone(index, "countryCode", e.target.value.replace(/\D/g, "").slice(0, 3))} />
                <AppInput placeholder={t("profile.phoneDdd")} value={phoneItem.areaCode} onChange={(e) => updatePhone(index, "areaCode", e.target.value.replace(/\D/g, "").slice(0, 8))} />
                <AppInput placeholder={t("profile.phoneNumber")} value={phoneItem.phone} onChange={(e) => updatePhone(index, "phone", e.target.value.replace(/\D/g, "").slice(0, 20))} />
                <AppSelect value={phoneItem.type} onChange={(e) => updatePhone(index, "type", e.target.value)}>
                  <option value="MOBILE">MOBILE</option>
                  <option value="WORK">WORK</option>
                  <option value="HOME">HOME</option>
                  <option value="OTHER">OTHER</option>
                </AppSelect>
                <AppButton type="button" variant="danger" onClick={() => setPhones((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)))}>
                  {t("profile.remove")}
                </AppButton>
              </div>
            ))}
          </section>

          <section className="space-y-3 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">{t("profile.addresses")}</h3>
              <AppButton type="button" variant="secondary" onClick={() => setAddresses((current) => [...current, { ...EMPTY_ADDRESS }])}>
                {t("profile.addAddress")}
              </AppButton>
            </div>
            {addresses.map((addressItem, index) => (
              <div key={`address-${index}`} className="space-y-2 rounded-lg border border-slate-200 p-2">
                <div className="grid gap-2 md:grid-cols-4">
                  <AppSelect value={addressItem.country} onChange={(e) => updateAddress(index, "country", e.target.value)}>
                    <option value="">{t("profile.country")}</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </option>
                    ))}
                  </AppSelect>
                  <AppInput placeholder={t("profile.zipcode")} value={addressItem.zipcode} onChange={(e) => updateAddress(index, "zipcode", e.target.value)} />
                  <AppSelect value={addressItem.type} onChange={(e) => updateAddress(index, "type", e.target.value)}>
                    <option value="HOME">HOME</option>
                    <option value="WORK">WORK</option>
                    <option value="OTHER">OTHER</option>
                  </AppSelect>
                  <AppButton type="button" variant="ghost" onClick={() => void autofillAddressByZip(index)}>
                    {t("profile.fillByZip")}
                  </AppButton>
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  <AppInput placeholder={t("profile.street")} value={addressItem.street} onChange={(e) => updateAddress(index, "street", e.target.value)} />
                  <AppInput placeholder={t("profile.neighbour")} value={addressItem.neighbour} onChange={(e) => updateAddress(index, "neighbour", e.target.value)} />
                  <AppInput placeholder={t("profile.number")} value={addressItem.number} onChange={(e) => updateAddress(index, "number", e.target.value)} />
                  <AppInput placeholder={t("profile.complement")} value={addressItem.complement} onChange={(e) => updateAddress(index, "complement", e.target.value)} />
                  <AppInput placeholder={t("profile.city")} value={addressItem.city} onChange={(e) => updateAddress(index, "city", e.target.value)} />
                  <AppInput placeholder={t("profile.state")} value={addressItem.state} onChange={(e) => updateAddress(index, "state", e.target.value)} />
                  <AppInput placeholder={t("profile.reference")} value={addressItem.reference} onChange={(e) => updateAddress(index, "reference", e.target.value)} />
                </div>
                <AppButton type="button" variant="danger" onClick={() => setAddresses((current) => (current.length <= 1 ? current : current.filter((_, i) => i !== index)))}>
                  {t("profile.remove")}
                </AppButton>
              </div>
            ))}
          </section>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
            <p className="text-sm text-slate-700">{t("profile.uploadTitle")}</p>
            <p className="text-xs text-slate-500">{t("profile.uploadHint")}</p>
            <AppButton type="button" variant="ghost" className="mt-2" disabled={!avatarUploadEnabled}>
              {t("profile.uploadDisabled")}
            </AppButton>
          </div>

          <div>
            <AppInput placeholder={t("profile.newPassword")} type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <AppButton type="button" variant="ghost" className="mt-1 px-0 py-0 text-xs text-blue-700 underline border-0 bg-transparent hover:bg-transparent" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? t("profile.hidePassword") : t("profile.showPassword")}
            </AppButton>
          </div>

          <div className="flex flex-wrap gap-2">
            <AppButton type="submit" disabled={saving}>{saving ? t("profile.saving") : t("profile.save")}</AppButton>
            <Link href="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">{t("profile.back")}</Link>
          </div>
        </form>
      </AnimatedPage>
    </main>
  );
}
