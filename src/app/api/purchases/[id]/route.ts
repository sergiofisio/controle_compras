import { NextResponse, NextRequest } from "next/server";
import * as purchaseService from "@/backend/services/purchaseService";
import { getCurrentUser } from "@/lib/session";

type RouteContext = { params: { id: string } };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    const purchase = await purchaseService.findPurchaseById(params.id, user.id);
    return NextResponse.json(purchase);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user?.id)
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

    await purchaseService.removePurchase(params.id, user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ocorreu um erro.";
    return NextResponse.json({ message }, { status: 404 });
  }
}
