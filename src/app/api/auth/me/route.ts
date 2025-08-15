import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Obter o token do cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Decodificar o token
    const userData = JSON.parse(Buffer.from(token, 'base64').toString());
    
    if (!userData.id || !userData.role) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Retornar dados do usuário (sem senha)
    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      role: userData.role,
      authCode: userData.authCode,
    });

  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
