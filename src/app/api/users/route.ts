// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Função para gerar código de autenticação único de 6 dígitos
async function generateUniqueAuthCode(): Promise<string> {
  let authCode: string;
  let isUnique = false;

  while (!isUnique) {
    authCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const existingUser = await prisma.user.findUnique({
      where: { authCode },
    });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return authCode!;
}

// Função para gerar senha padrão
function generateDefaultPassword(): string {
  return "12345678"; // Senha padrão fixa
}

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ROOT' // Não retornar usuários ROOT
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        authCode: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, role } = await request.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o telefone já existe
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Telefone já cadastrado" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe (se fornecido)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        );
      }
    }

    // Gerar código de autenticação único
    const authCode = await generateUniqueAuthCode();

    // Gerar senha padrão
    const defaultPassword = generateDefaultPassword();

    // Hash da senha
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim().toUpperCase(),
        phone: phone.trim(),
        email: email?.trim() || null,
        authCode,
        password: hashedPassword,
        role: role || 'OPERATOR',
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        authCode: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      defaultPassword, // Retornar senha padrão para exibição
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}