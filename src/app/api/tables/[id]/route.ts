import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, capacity } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome da mesa é obrigatório" },
        { status: 400 }
      );
    }

    if (!capacity || capacity < 1 || capacity > 20) {
      return NextResponse.json(
        { error: "Capacidade deve ser entre 1 e 20" },
        { status: 400 }
      );
    }

    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        name: name.trim().toUpperCase(),
        capacity: parseInt(capacity),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Desativar a mesa (soft delete)
    const deletedTable = await prisma.table.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Mesa removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover mesa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
