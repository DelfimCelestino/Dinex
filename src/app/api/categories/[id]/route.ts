import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Buscar categoria específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
      include: {
        menuItems: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, icon } = body;

    // Validação
    if (!name || !icon) {
      return NextResponse.json(
        { error: "Nome e ícone são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Verificar se já existe outra categoria com o mesmo nome
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        id: {
          not: params.id,
        },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este nome" },
        { status: 409 }
      );
    }

    // Atualizar categoria
    const updatedCategory = await prisma.category.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        icon,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a categoria existe
    const existingCategory = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
      include: {
        menuItems: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    // Soft delete - apenas desativar
    await prisma.category.update({
      where: {
        id: params.id,
      },
      data: {
        isActive: false
      }
    });

    return NextResponse.json(
      { message: "Categoria desativada com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
