import { NextResponse, NextRequest } from "next/server";
import {
  findPurchaseById,
  removePurchase,
} from "@/backend/services/purchaseService";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const purchase = await findPurchaseById(id);
    return NextResponse.json(purchase);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await removePurchase(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }
}
