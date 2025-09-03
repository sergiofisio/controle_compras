import { NextResponse } from "next/server";
import {
  findPurchaseById,
  removePurchase,
} from "@/backend/services/purchaseService";

type RouteParams = { params: { id: string } };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const purchase = await findPurchaseById(params.id);
    return NextResponse.json(purchase);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await removePurchase(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 404 });
  }
}
