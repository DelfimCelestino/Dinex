import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as mesas ativas
export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      where: { isActive: true },
      include: {
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { area: { name: 'asc' } },
        { number: 'asc' },
      ],
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Erro ao listar mesas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova mesa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, name, capacity, areaId } = body;

    if (!number || !name || !areaId) {
      return NextResponse.json(
        { error: "Número, nome e área são obrigatórios" },
        { status: 400 }
      );
    }

    const table = await prisma.table.create({
      data: {
        number: number.trim(),
        name: name.trim(),
        capacity: capacity || 4,
        areaId: areaId,
        isActive: true,
      },
      include: {
        area: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar mesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
