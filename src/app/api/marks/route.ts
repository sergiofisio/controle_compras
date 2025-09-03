import { markService } from "@/backend/services/markService";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  try {
    const marks = await markService.list();
    return NextResponse.json(marks);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMark = await markService.add(body);
    return NextResponse.json(newMark, { status: 201 });
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
      { message: "Não foi possível criar a marca." },
      { status: 500 }
    );
  }
}
