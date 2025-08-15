import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { authCode, password } = await request.json();

    if (!authCode || !password) {
      return NextResponse.json(
        { error: "Código de autenticação e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar usuário pelo código de autenticação
    const user = await prisma.user.findUnique({
      where: { authCode },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Código de autenticação inválido" },
        { status: 401 }
      );
    }

               if (!user.isActive) {
             return NextResponse.json(
               { error: "Usuário inativo. Entre em contato com o administrador." },
               { status: 401 }
             );
           }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user?.password || '');

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Criar token (simplificado - em produção usar JWT)
    const tokenData = {
      id: user.id,
      name: user.name,
      role: user.role,
      authCode: user.authCode,
    };

    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        authCode: user.authCode,
      },
    });

    // Definir cookie de autenticação
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;

  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
