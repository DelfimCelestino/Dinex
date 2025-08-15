import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { action, quantity } = await request.json();

    if (!action || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Ação e quantidade são obrigatórias" },
        { status: 400 }
      );
    }

    // Buscar o item do menu
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: "Item do menu não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o item tem controle de estoque
    if (!menuItem.hasStock || menuItem.stockQuantity === null) {
      return NextResponse.json(
        { error: "Este item não possui controle de estoque" },
        { status: 400 }
      );
    }

    let newStockQuantity = menuItem.stockQuantity;

    if (action === "consume") {
      // Consumir estoque
      if (menuItem.stockQuantity < quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente. Disponível: ${menuItem.stockQuantity}, Solicitado: ${quantity}` },
          { status: 400 }
        );
      }
      newStockQuantity = menuItem.stockQuantity - quantity;
    } else if (action === "restore") {
      // Restaurar estoque
      newStockQuantity = menuItem.stockQuantity + quantity;
    } else {
      return NextResponse.json(
        { error: "Ação inválida. Use 'consume' ou 'restore'" },
        { status: 400 }
      );
    }

    // Atualizar o estoque
    const updatedMenuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        stockQuantity: newStockQuantity,
      },
    });

    return NextResponse.json({
      id: updatedMenuItem.id,
      name: updatedMenuItem.name,
      stockQuantity: updatedMenuItem.stockQuantity,
      hasStock: updatedMenuItem.hasStock,
      minStockAlert: updatedMenuItem.minStockAlert,
    });
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
