import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os métodos de pagamento ativos
export async function GET() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(paymentMethods);
  } catch (error) {
    console.error("Error ao listar métodos de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo método de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    if (!name || !icon) {
      return NextResponse.json(
        { error: "Nome e ícone são obrigatórios" },
        { status: 400 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: name.trim(),
        icon: icon.trim(),
        isActive: true,
      },
    });

    return NextResponse.json(paymentMethod, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar método de pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
