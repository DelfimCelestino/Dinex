import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Alternar estado de favorito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { isFavorite } = body;

    // Verificar se o item existe
    const existingItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item do menu não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar estado de favorito
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: params.id,
      },
      data: {
        isFavorite: isFavorite,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    console.error("Erro ao atualizar favorito:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
