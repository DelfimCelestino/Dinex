import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.companySettings.findFirst();


    if (!settings) {
      // Retornar objeto com isConfigured: false quando não há configurações
      return NextResponse.json({
        id: "",
        name: "",
        location: "",
        phone: "",
        localNumber: "",
        nuit: "",
        isConfigured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Erro ao carregar configurações da empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, location, phone, localNumber, nuit } = body;


    // Validação básica
    if (!name || !location || !phone || !localNumber || !nuit) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se já existe configuração
    const existingSettings = await prisma.companySettings.findFirst();

    let updatedSettings;
    if (existingSettings) {
      // Atualizar configuração existente
      updatedSettings = await prisma.companySettings.update({
        where: { id: existingSettings.id },
        data: {
          name: name.toUpperCase(),
          location: location.toUpperCase(),
          phone,
          localNumber,
          nuit,
          isConfigured: true,
          updatedAt: new Date(),
        },
      });
    } else {
      // Criar nova configuração
      updatedSettings = await prisma.companySettings.create({
        data: {
          name: name.toUpperCase(),
          location: location.toUpperCase(),
          phone,
          localNumber,
          nuit,
          isConfigured: true,
        },
      });
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Erro ao atualizar configurações da empresa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
