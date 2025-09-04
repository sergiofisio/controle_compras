import { NextResponse } from "next/server";
import { categoryService } from "@/backend/services/categoryService";
import { ZodError } from "zod";

export async function GET() {
  try {
    const categories = await categoryService.list();
    return NextResponse.json(categories);
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
    const newCategory = await categoryService.add(body);
    return NextResponse.json(newCategory, { status: 201 });
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
      { message: "Não foi possível criar a categoria." },
      { status: 500 }
    );
  }
}
