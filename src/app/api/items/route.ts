import { addItem, listItems } from "@/backend/services/itemService";

import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  try {
    const items = await listItems();
    return NextResponse.json(items);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await addItem(body);
    return NextResponse.json(newItem, { status: 201 });
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

    if (error.message.includes("not found")) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
