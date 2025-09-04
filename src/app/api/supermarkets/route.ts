import { NextResponse } from "next/server";
import { supermarketService } from "@/backend/services/supermarketService";
import { ZodError } from "zod";

export async function GET() {
  try {
    const supermarkets = await supermarketService.list();
    return NextResponse.json(supermarkets);
  } catch (error: any) {
    console.log({ error });
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSupermarket = await supermarketService.add(body);
    return NextResponse.json(newSupermarket, { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error.message.includes("já existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Não foi possível criar o supermercado." },
      { status: 500 }
    );
  }
}
