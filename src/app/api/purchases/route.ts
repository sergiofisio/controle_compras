import { NextResponse } from "next/server";
import * as purchaseService from "@/backend/services/purchaseService";
import { getCurrentUser } from "@/lib/session";
import { ZodError } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const purchases = await purchaseService.listPurchases(user.id);
    return NextResponse.json(purchases);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno do servidor.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const body = await request.json();
    const newPurchase = await purchaseService.createNewPurchase(body, user.id);
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível registrar a compra.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
