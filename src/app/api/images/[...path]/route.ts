import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Verificar se params.path existe e é um array
    if (!params || !params.path || !Array.isArray(params.path)) {
      return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }
    
    const imagePath = params.path.join('/');
    
    // Tentar resolver o arquivo no diretório public
    let publicDir = join(process.cwd(), 'public');
    if (!existsSync(publicDir)) {
      // Em modo standalone, tentar diretório pai
      const parentPublic = join(process.cwd(), '..', 'public');
      if (existsSync(parentPublic)) {
        publicDir = parentPublic;
      }
    }
    
    const filePath = join(publicDir, 'images', imagePath);
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }
    
    // Ler o arquivo e retornar como resposta
    const fileBuffer = readFileSync(filePath);
    const ext = imagePath.split('.').pop()?.toLowerCase();
    
    let contentType = 'application/octet-stream';
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro ao servir imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
