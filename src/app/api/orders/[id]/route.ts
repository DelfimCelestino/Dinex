import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Atualizar pedido (itens, pagamento, status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      status,
      customerName,
      isDelivery,
      areaId,
      tableId,
      notes,
      cancellationReason,
      paymentMethodId,
      amountReceived,
      isPaid,
      isCompleted,
      items,
    } = body as any;

    // Atualizar itens do pedido se enviados
    if (Array.isArray(items)) {
      // Buscar itens atuais
      const existing = await prisma.order.findUnique({
        where: { id: params.id },
        include: { orderItems: true },
      });

      if (!existing) {
        return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
      }

      // Mapear por id para facilitar
      const currentById = new Map(existing.orderItems.map(oi => [oi.id, oi]));

      // Atualizar/criar/remover conforme lista enviada
      for (const item of items) {
        const quantity = Number(item.quantity ?? 0);
        const unitPrice = Number(item.unitPrice ?? 0);
        const totalPrice = quantity * unitPrice;

        if (item.id && currentById.has(item.id)) {
          if (quantity <= 0) {
            await prisma.orderItem.delete({ where: { id: item.id } });
          } else {
            await prisma.orderItem.update({
              where: { id: item.id },
              data: {
                quantity,
                unitPrice,
                totalPrice,
                notes: item.notes ?? null,
              },
            });
          }
          currentById.delete(item.id);
        } else if (!item.id && item.menuItemId && quantity > 0) {
          await prisma.orderItem.create({
            data: {
              orderId: params.id,
              menuItemId: item.menuItemId,
              quantity,
              unitPrice,
              totalPrice,
              notes: item.notes ?? null,
            },
          });
        }
      }

      // Remover itens que não estão mais na lista (foram removidos)
      for (const [itemId, item] of currentById) {
        await prisma.orderItem.delete({ where: { id: itemId } });
      }
    }

    // Recalcular total
    const recalculated = await prisma.order.findUnique({
      where: { id: params.id },
      include: { orderItems: true },
    });

    if (!recalculated) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const totalAmount = recalculated.orderItems.reduce((sum, oi) => sum + oi.totalPrice, 0);

    // Calcular troco se houver amountReceived
    let change: number | undefined = undefined;
    if (amountReceived !== undefined && amountReceived !== null) {
      const received = Number(amountReceived);
      change = received - totalAmount;
      if (change < 0) change = undefined; // sem troco se insuficiente
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        customerName: customerName?.trim() || undefined,
        isDelivery: isDelivery !== undefined ? !!isDelivery : undefined,
        areaId: areaId || undefined,
        tableId: tableId || undefined,
        notes: notes?.trim() || undefined,
        cancellationReason: cancellationReason?.trim() || undefined,
        paymentMethodId: paymentMethodId || undefined,
        amountReceived: amountReceived !== undefined ? Number(amountReceived) : undefined,
        change,
        isPaid: isPaid !== undefined ? !!isPaid : undefined,
        isCompleted: isCompleted !== undefined ? !!isCompleted : undefined,
        totalAmount,
      },
      include: {
        orderItems: {
          include: {
            menuItem: {
              select: { id: true, name: true, description: true, image: true },
            },
          },
        },
        paymentMethod: { select: { id: true, name: true, icon: true } },
        area: { select: { id: true, name: true } },
        table: { select: { id: true, number: true, name: true } },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar pedido (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { cancellationReason } = body as any;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        isCompleted: true,
        cancellationReason: cancellationReason?.trim() || 'Pedido cancelado',
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
