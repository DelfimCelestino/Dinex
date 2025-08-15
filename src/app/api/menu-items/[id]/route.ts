import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar item específico do menu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menuItem = await prisma.menuItem.findUnique({
      where: {
        id: params.id,
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

    if (!menuItem) {
      return NextResponse.json(
        { error: "Item do menu não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(menuItem);
  } catch (error) {
    console.error("Erro ao buscar item do menu:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item do menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, price, image, categoryId } = body as {
      name: string;
      description?: string;
      price: number;
      image?: string;
      categoryId: string;
    };

    // Validação
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: "Nome, preço e categoria são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar se o preço é um número positivo
    if (typeof price !== "number" || price <= 0) {
      return NextResponse.json(
        { error: "Preço deve ser um número positivo" },
        { status: 400 }
      );
    }

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

    // Verificar se a categoria existe
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Converter nome para uppercase
    const normalizedName = name.toUpperCase().trim();

    // Verificar se já existe outro item com o mesmo nome na mesma categoria
    const duplicateItem = await prisma.menuItem.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
        categoryId,
        id: {
          not: params.id,
        },
      },
    });

    if (duplicateItem) {
      return NextResponse.json(
        { error: "Já existe um item com este nome nesta categoria" },
        { status: 409 }
      );
    }

    // Se há uma nova imagem e o item tem uma imagem antiga, deletar a antiga
    let oldImagePath = null;
    let finalImage = image;
    
    // Se o usuário está enviando uma nova imagem (diferente da atual)
    if (image && existingItem.image && image !== existingItem.image) {
      oldImagePath = existingItem.image;
    }
    
    // Se o usuário está removendo a imagem (image é null/undefined e havia uma imagem)
    if (!image && existingItem.image) {
      oldImagePath = existingItem.image;
      finalImage = undefined; // Permitir remover a imagem
    }
    
    // Se não há nova imagem e não havia imagem antiga, manter como null
    if (!image && !existingItem.image) {
      finalImage = undefined;
    }

    // Atualizar item do menu
    const updatedMenuItem = await prisma.menuItem.update({
      where: {
        id: params.id,
      },
      data: {
        name: normalizedName,
        description: description || "Sem descrição",
        price,
        image: finalImage || undefined,
        categoryId,
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

    // Deletar imagem antiga se necessário
    if (oldImagePath) {
      try {
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        const fullPath = path.default.join(process.cwd(), 'public', oldImagePath);
        await fs.unlink(fullPath);
      } catch (error) {
        console.error("Erro ao deletar imagem antiga:", error);
      }
    }

    return NextResponse.json(updatedMenuItem);
  } catch (error) {
    console.error("Erro ao atualizar item do menu:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar item do menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Soft delete - apenas desativar
    await prisma.menuItem.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false
      }
    });

    // Deletar imagem se existir
    if (existingItem.image) {
      try {
        const fs = await import('fs').then(m => m.promises);
        const path = await import('path');
        const fullPath = path.default.join(process.cwd(), 'public', existingItem.image);
        await fs.unlink(fullPath);
      } catch (error) {
        console.error("Erro ao deletar imagem:", error);
      }
    }

    return NextResponse.json(
      { message: "Item do menu desativado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar item do menu:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
