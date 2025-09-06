import { add, listCategories } from "@/backend/services/categoryService";
import { getCurrentUser } from "@/lib/session";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }
    const categories = await listCategories(user.id);
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
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const newCategory = await add(body, user.id);
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
