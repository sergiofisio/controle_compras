import { markService } from "@/backend/services/markService";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  try {
    const marks = await markService.list();
    return NextResponse.json(marks);
  } catch (error) {
    // CORREÇÃO: trocado 'error.messagee' para 'error.message'
    const message =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return NextResponse.json(
      { message: `Erro interno do servidor: ${message}` },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newMark = await markService.add(body);
    return NextResponse.json(newMark, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Dados inválidos.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("já existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Não foi possível criar a marca." },
      { status: 500 }
    );
  }
}
