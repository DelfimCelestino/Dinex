import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Função para gerar senha padrão
function generateDefaultPassword(): string {
  return "12345678"; // Senha padrão fixa
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, phone, email, role, isActive } = await request.json();

    // Se apenas isActive está sendo enviado (para ativar/desativar)
    if (isActive !== undefined && !name && !phone && !email && role === undefined) {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          isActive,
          updatedAt: new Date(),
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
      });

      return NextResponse.json(updatedUser);
    }

    // Para atualização completa, validar campos obrigatórios
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o telefone já existe em outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Telefone já cadastrado para outro usuário" },
        { status: 400 }
      );
    }

    // Verificar se o email já existe em outro usuário (se fornecido)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          { error: "Email já cadastrado para outro usuário" },
          { status: 400 }
        );
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name.trim().toUpperCase(),
        phone: phone.trim(),
        email: email?.trim() || null,
        role: role || 'OPERATOR',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
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
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
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

    // Verificar se é o usuário root (não pode ser deletado)
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (user?.role === 'ROOT') {
      return NextResponse.json(
        { error: "Não é possível deletar o usuário root" },
        { status: 400 }
      );
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Rota para resetar senha
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { action } = await request.json();

    if (action === 'reset-password') {
      // Gerar nova senha padrão
      const newPassword = generateDefaultPassword();
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha
      await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        message: "Senha resetada com sucesso",
        newPassword,
      });
    }

    return NextResponse.json(
      { error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
