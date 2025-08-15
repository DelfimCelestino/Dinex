import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todas as categorias
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
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

    // Converter nome para uppercase
    const normalizedName = name.toUpperCase().trim();

    // Verificar se já existe uma categoria com o mesmo nome (ativa ou inativa)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive", // Case insensitive
        },
      },
    });

    if (existingCategory) {
      // Se existe mas está inativa, reativar
      if (!existingCategory.isActive) {
        const updatedCategory = await prisma.category.update({
          where: { id: existingCategory.id },
          data: { 
            isActive: true,
            icon,
            updatedAt: new Date()
          },
        });
        return NextResponse.json(updatedCategory, { status: 200 });
      }
      
      return NextResponse.json(
        { error: "Já existe uma categoria ativa com este nome" },
        { status: 409 }
      );
    }

    // Criar nova categoria
    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        icon,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
