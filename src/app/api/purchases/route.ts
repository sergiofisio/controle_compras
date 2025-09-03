import { NextResponse } from "next/server";
import {
  createNewPurchase,
  listPurchases,
} from "@/backend/services/purchaseService";

export async function GET() {
  try {
    const purchases = await listPurchases();
    return NextResponse.json(purchases);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPurchase = await createNewPurchase(body);
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 400 });
  }
}
