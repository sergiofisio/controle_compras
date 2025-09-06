import { registerUserSchema } from "@/backend/lib/schemas";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    let { name, email, password } = registerUserSchema.parse(body);

    const existingUser = await prisma?.user.findUnique({
      where: { email },
    });

    if (existingUser)
      return NextResponse.json(
        { message: "Email ja cadastrado" },
        { status: 409 }
      );

    password = await hash(password, 12);

    await prisma?.user.create({
      data: {
        name,
        email,
        password,
      },
    });

    return NextResponse.json(
      { message: "Usuário Cadastrado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.error(error); // Log do erro no servidor
    return NextResponse.json(
      { message: "Ocorreu um erro interno no servidor." },
      { status: 500 }
    );
  }
}
