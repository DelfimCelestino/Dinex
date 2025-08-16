import { NextRequest, NextResponse } from 'next/server';
import { getLicenseManager, createTestLicense } from '@/lib/license';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar licenças (apenas para admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'validate') {
      // Validar licença específica
      const licenseKey = searchParams.get('key');
      if (!licenseKey) {
        return NextResponse.json({ error: 'Chave de licença não fornecida' }, { status: 400 });
      }

      const manager = getLicenseManager();
      const result = await manager.validateLicense(licenseKey);
      
      return NextResponse.json(result);
    }

    if (action === 'hardware') {
      // Obter informações do hardware
      const manager = getLicenseManager();
      const hardware = await manager.generateHardwareId();
      
      return NextResponse.json({
        hardwareId: hardware.hardwareId,
        machineName: hardware.machineName
      });
    }

    // Listar todas as licenças (apenas para admin)
    const licenses = await prisma.license.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error('Erro ao processar requisição de licenças:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova licença
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      clientName, 
      clientEmail, 
      hardwareId, 
      machineName, 
      days, 
      features,
      version = '1.0.0'
    } = body;

    // Validações
    if (!clientName || !hardwareId || !machineName || !days) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios: clientName, hardwareId, machineName, days' 
      }, { status: 400 });
    }

    const manager = getLicenseManager();
    
    const licenseData = {
      clientName,
      clientEmail,
      hardwareId,
      machineName,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      version,
      features: JSON.stringify(features || {
        orders: true,
        menu: true,
        reports: true,
        admin: true
      })
    };

    const licenseKey = await manager.createLicense(licenseData);

    return NextResponse.json({ 
      success: true, 
      licenseKey,
      message: 'Licença criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar licença:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar licença
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey, isActive, maxValidations } = body;

    if (!licenseKey) {
      return NextResponse.json({ error: 'Chave de licença não fornecida' }, { status: 400 });
    }

    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof maxValidations === 'number') updateData.maxValidations = maxValidations;

    const license = await prisma.license.update({
      where: { licenseKey },
      data: updateData
    });

    return NextResponse.json({ 
      success: true, 
      license,
      message: 'Licença atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar licença:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Revogar licença
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const licenseKey = searchParams.get('key');

    if (!licenseKey) {
      return NextResponse.json({ error: 'Chave de licença não fornecida' }, { status: 400 });
    }

    await prisma.license.delete({
      where: { licenseKey }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Licença revogada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao revogar licença:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
