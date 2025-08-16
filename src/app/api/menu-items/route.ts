import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os itens do menu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const whereClause: any = {
      isActive: true, // Apenas itens ativos
    };

    // Filtrar por categoria se especificado
    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }

    // Busca por nome ou descrição se especificado
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Erro ao buscar itens do menu:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo item do menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image, categoryId, hasStock, stockQuantity, minStockAlert } = body;

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

    // Verificar se já existe um item com o mesmo nome na mesma categoria (ativo ou inativo)
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        name: {
          equals: normalizedName,
          mode: "insensitive",
        },
        categoryId,
      },
    });

    if (existingItem) {
      // Se existe mas está inativo, reativar
      if (!existingItem.isActive) {
        const updatedItem = await prisma.menuItem.update({
          where: { id: existingItem.id },
          data: { 
            isActive: true,
            description: description ?? "Sem descrição",
            price,
            image,
            hasStock: hasStock || false,
            stockQuantity: hasStock ? stockQuantity : null,
            minStockAlert: hasStock ? minStockAlert : null,
            updatedAt: new Date()
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
        return NextResponse.json(updatedItem, { status: 200 });
      }
      
      return NextResponse.json(
        { error: "Já existe um item ativo com este nome nesta categoria" },
        { status: 409 }
      );
    }

    // Criar novo item do menu
    const menuItem = await prisma.menuItem.create({
      data: {
        name: normalizedName,
        description: description ?? "Sem descrição",
        price,
        image,
        categoryId,
        hasStock: hasStock || false,
        stockQuantity: hasStock ? stockQuantity : null,
        minStockAlert: hasStock ? minStockAlert : null,
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

    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar item do menu:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
