import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Listar todos os pedidos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFilter = searchParams.get('dateFilter'); // today, yesterday, custom
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const method = searchParams.get('method'); // método de pagamento
    const activeOnly = searchParams.get('activeOnly'); // apenas pedidos ativos
    const orderSearch = searchParams.get('orderSearch'); // busca específica por pedido

    const where: any = {};

    // Filtrar por status
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Filtrar apenas pedidos ativos se solicitado
    if (activeOnly === 'true') {
      where.status = { in: ['NEW', 'PREPARING', 'READY'] };
      where.isPaid = false; // Não incluir pedidos já pagos
    }

    // Filtrar por método de pagamento
    if (method) {
      where.paymentMethod = {
        name: method
      };
    }

    // Busca específica por pedido (número, cliente, mesa)
    if (orderSearch) {
      where.OR = [
        { orderNumber: { contains: orderSearch, mode: 'insensitive' } },
        { customerName: { contains: orderSearch, mode: 'insensitive' } },
        { 
          table: { 
            name: { contains: orderSearch, mode: 'insensitive' } 
          } 
        },
        { 
          area: { 
            name: { contains: orderSearch, mode: 'insensitive' } 
          } 
        },
      ];
    }

    // Filtrar por busca geral
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros de data aplicados diretamente no banco
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (dateFilter === 'today') {
        // Hoje: início do dia até fim do dia
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      } else if (dateFilter === 'yesterday') {
        // Ontem: início do dia anterior até fim do dia anterior
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
      } else if (dateFilter === 'custom' && dateFrom && dateTo) {
        // Data customizada: do início do dia inicial até fim do dia final
        startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                price: true,
                hasStock: true,
                stockQuantity: true,
                minStockAlert: true,
              },
            },
          },
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      isDelivery,
      areaId,
      tableId,
      items,
      paymentMethodId,
      amountReceived,
      notes,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Pedido deve conter pelo menos um item" },
        { status: 400 }
      );
    }

    // Verificar estoque antes de criar o pedido
    const stockErrors: string[] = [];
    
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        select: {
          id: true,
          name: true,
          hasStock: true,
          stockQuantity: true,
          minStockAlert: true,
        },
      });

      if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null) {
        if (menuItem.stockQuantity < item.quantity) {
          stockErrors.push(`${menuItem.name}: só há ${menuItem.stockQuantity} unidade(s) disponível(is), mas foram solicitadas ${item.quantity}`);
        }
      }
    }

    if (stockErrors.length > 0) {
      return NextResponse.json(
        { error: "Estoque insuficiente para alguns produtos", details: stockErrors },
        { status: 400 }
      );
    }

    // Calcular total do pedido
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);

    // Calcular troco se houver amountReceived
    let change = 0;
    if (paymentMethodId && amountReceived) {
      change = amountReceived - totalAmount;
    }

    // Gerar número do pedido
    const orderCount = await prisma.order.count();
    const orderNumber = `#${String(orderCount + 1).padStart(3, '0')}`;

    // Definir status conforme pagamento
    const status: any = paymentMethodId ? 'DELIVERED' : 'NEW';
    const isPaid = !!paymentMethodId;
    const isCompleted = paymentMethodId ? true : false;

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName?.trim() || null,
        isDelivery: !!isDelivery,
        areaId: areaId || null,
        tableId: tableId || null,
        totalAmount,
        paymentMethodId: paymentMethodId || null,
        amountReceived: paymentMethodId ? amountReceived || null : null,
        change: paymentMethodId && change > 0 ? change : null,
        isPaid,
        isCompleted,
        notes: notes?.trim() || null,
        status,
      },
    });

    // Criar itens do pedido e consumir estoque
    await Promise.all(
      items.map(async (item: any) => {
        // Criar item do pedido
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes?.trim() || null,
          },
        });

        // Consumir estoque
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
        });

        if (menuItem && menuItem.hasStock && menuItem.stockQuantity !== null) {
          await prisma.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stockQuantity: menuItem.stockQuantity - item.quantity,
            },
          });
        }
      })
    );

    // Retornar pedido completo
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
              },
            },
          },
        },
        paymentMethod: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        area: {
          select: {
            id: true,
            name: true,
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(completeOrder, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
