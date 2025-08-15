import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as áreas ativas
export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      where: { isActive: true },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { number: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(areas);
  } catch (error) {
    console.error("Erro ao listar áreas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova área
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome da área é obrigatório" },
        { status: 400 }
      );
    }

    const area = await prisma.area.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: true,
      },
      include: {
        tables: {
          where: { isActive: true },
          orderBy: { number: 'asc' },
        },
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar área:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
