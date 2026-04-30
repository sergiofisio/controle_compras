import { NextResponse } from "next/server";

export async function GET(req: import("next/server").NextRequest) {
  const country = String(req.nextUrl.searchParams.get("country") || "").toUpperCase();
  const zipcode = String(req.nextUrl.searchParams.get("zipcode") || "").trim();
  if (!country || !zipcode) {
    return NextResponse.json({ error: "country e zipcode sao obrigatorios" }, { status: 400 });
  }

  if (country !== "BR") {
    return NextResponse.json({ address: null, message: "Autopreenchimento disponivel apenas para CEP do Brasil no momento" });
  }

  const cleanZip = zipcode.replace(/\D/g, "");
  if (cleanZip.length !== 8) {
    return NextResponse.json({ error: "CEP invalido" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 502 });
    }
    const data = (await response.json()) as {
      erro?: boolean;
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      complemento?: string;
    };
    if (data.erro) {
      return NextResponse.json({ error: "CEP nao encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      address: {
        street: data.logradouro || "",
        neighbour: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "",
        complement: data.complemento || "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar servico de CEP" }, { status: 502 });
  }
}
