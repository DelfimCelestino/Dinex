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
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome da área é obrigatório" },
        { status: 400 }
      );
    }

    const updatedArea = await prisma.area.update({
      where: { id },
      data: {
        name: name.trim().toUpperCase(),
        description: description?.trim() || "",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedArea);
  } catch (error) {
    console.error("Erro ao atualizar área:", error);
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

    // Primeiro, desativar todas as mesas da área
    await prisma.table.updateMany({
      where: { areaId: id },
      data: { isActive: false },
    });

    // Depois, desativar a área
    const deletedArea = await prisma.area.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Área removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover área:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
