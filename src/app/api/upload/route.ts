import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// POST - Upload de imagem
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo foi enviado" },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado. Use JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }

    // Validar tamanho do arquivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Tamanho máximo: 5MB" },
        { status: 400 }
      );
    }

    // Resolver diretório público de forma robusta (funciona no build e dev)
    let publicDir = join(process.cwd(), "public");
    if (!existsSync(publicDir)) {
      // Em alguns ambientes (standalone), o cwd pode ser .next/standalone
      const parentPublic = join(process.cwd(), "..", "public");
      if (existsSync(parentPublic)) {
        publicDir = parentPublic;
      }
    }

    // Criar diretório de uploads se não existir
    const uploadDir = join(publicDir, "images", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = join(uploadDir, fileName);

    // Converter File para Buffer e salvar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Retornar URL da imagem usando a nova rota API
    const imageUrl = `/api/images/uploads/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Remover imagem enviada (para cancelamentos)
export async function DELETE(request: NextRequest) {
  try {
    let fileName = '';
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json().catch(() => ({} as any));
      fileName = body?.fileName || '';
      const url: string = body?.url || '';
      if (!fileName && url) {
        const parts = url.split('/');
        fileName = parts[parts.length - 1] || '';
      }
    } else {
      const { searchParams } = new URL(request.url);
      fileName = searchParams.get('file') || '';
    }

    if (!fileName) {
      return NextResponse.json({ error: 'fileName é obrigatório' }, { status: 400 });
    }

    // Apenas permite deletar dentro de images/uploads
    let publicDir = join(process.cwd(), "public");
    if (!existsSync(publicDir)) {
      const parentPublic = join(process.cwd(), "..", "public");
      if (existsSync(parentPublic)) {
        publicDir = parentPublic;
      }
    }

    const filePath = join(publicDir, 'images', 'uploads', fileName);
    if (!existsSync(filePath)) {
      return NextResponse.json({ success: true, message: 'Arquivo já não existe' });
    }

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
