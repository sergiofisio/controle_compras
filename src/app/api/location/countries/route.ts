import { NextResponse } from "next/server";

type CountryItem = { code: string; name: string };

export async function GET() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name", {
      headers: { Accept: "application/json" },
      cache: "force-cache",
    });
    if (!response.ok) {
      return NextResponse.json({ countries: [] as CountryItem[] });
    }

    const payload = (await response.json()) as Array<{ cca2?: string; name?: { common?: string } }>;
    const countries = payload
      .map((country) => ({
        code: String(country.cca2 || "").toUpperCase(),
        name: String(country.name?.common || "").trim(),
      }))
      .filter((country) => country.code.length === 2 && country.name.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

    return NextResponse.json({ countries });
  } catch {
    return NextResponse.json({ countries: [] as CountryItem[] });
  }
}
