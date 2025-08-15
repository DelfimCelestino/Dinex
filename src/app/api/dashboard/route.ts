import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de query para filtros de data
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days"; // 7days, 30days, 90days
    
    // Calcular datas baseadas no período
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "30days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "90days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      default: // 7days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Estatísticas gerais
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      recentOrders,
      topProducts,
      orderStatusCounts,
      dailyRevenue,
      monthlyRevenue,
      avgOrderTime
    ] = await Promise.all([
      // Total de pedidos
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      
      // Receita total
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Total de clientes únicos
      prisma.order.groupBy({
        by: ["customerName"],
        where: {
          createdAt: { gte: startDate },
          customerName: { not: null }
        },
        _count: {
          customerName: true
        }
      }),
      
      // Pedidos recentes
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        include: {
          orderItems: {
            include: {
              menuItem: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 4
      }),
      
      // Produtos mais vendidos
      prisma.orderItem.groupBy({
        by: ["menuItemId"],
        where: {
          order: {
            createdAt: { gte: startDate },
            status: "DELIVERED"
          }
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _sum: {
            quantity: "desc"
          }
        },
        take: 5
      }),
      
      // Contagem por status
      prisma.order.groupBy({
        by: ["status"],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          status: true
        }
      }),
      
      // Receita diária dos últimos 7 dias
      prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Receita mensal dos últimos 6 meses
      prisma.order.groupBy({
        by: ["createdAt"],
        where: {
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
          status: "DELIVERED"
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Tempo médio de preparação dos pedidos
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: "DELIVERED"
        },
        _avg: {
          totalAmount: true
        }
      })
    ]);

    // Processar dados dos produtos mais vendidos
    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId }
        });
        return {
          name: menuItem?.name || "Unknown",
          sales: item._sum.quantity || 0,
          revenue: (item._sum.quantity || 0) * (menuItem?.price || 0)
        };
      })
    );

    // Processar dados de receita diária
    const dailyRevenueData = dailyRevenue.map(item => ({
      name: new Date(item.createdAt).toLocaleDateString('pt-BR', { weekday: 'short' }),
      revenue: item._sum.totalAmount || 0
    }));

    // Processar dados de receita mensal - agrupar por mês
    const monthlyRevenueMap = new Map();
    monthlyRevenue.forEach(item => {
      const monthKey = new Date(item.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      const currentRevenue = monthlyRevenueMap.get(monthKey) || 0;
      monthlyRevenueMap.set(monthKey, currentRevenue + (item._sum.totalAmount || 0));
    });

    const monthlyRevenueData = Array.from(monthlyRevenueMap.entries()).map(([month, revenue]) => ({
      name: month,
      revenue: revenue
    }));

    // Calcular estatísticas comparativas (simulado para demonstração)
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousPeriodOrders = await prisma.order.count({
      where: {
        createdAt: { 
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const previousPeriodRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { 
          gte: previousPeriodStart,
          lt: startDate
        },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      }
    });

    // Calcular percentuais de mudança
    const ordersChange = totalOrders > 0 && previousPeriodOrders > 0 
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders * 100).toFixed(1)
      : "0";
    
    const revenueChange = (totalRevenue._sum.totalAmount || 0) > 0 && (previousPeriodRevenue._sum.totalAmount || 0) > 0
      ? (((totalRevenue._sum.totalAmount || 0) - (previousPeriodRevenue._sum.totalAmount || 0)) / (previousPeriodRevenue._sum.totalAmount || 0) * 100).toFixed(1)
      : "0";

    // Processar pedidos recentes para o formato esperado
    const processedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      image: order.orderItems[0]?.menuItem.image || "/placeholder.svg",
      name: order.orderItems[0]?.menuItem.name || "Unknown Item",
      description: `${order.orderItems.length} items`,
      price: `$${(order.totalAmount || 0).toFixed(2)}`,
      time: getTimeAgo(order.createdAt),
      status: order.status.toLowerCase()
    }));

    // Processar dados da tabela
    const tableOrders = recentOrders.slice(0, 6).map(order => ({
      id: order.orderNumber,
      customer: order.customerName || "Anonymous",
      items: order.orderItems.map(item => item.menuItem.name).join(", "),
      total: `$${(order.totalAmount || 0).toFixed(2)}`,
      status: order.status,
      time: new Date(order.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));

    const dashboardData = {
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalCustomers: totalCustomers.length,
        avgOrderTime: calculateAverageOrderTime(avgOrderTime._avg.totalAmount || 0),
        ordersChange: ordersChange,
        revenueChange: revenueChange
      },
      charts: {
        dailyRevenue: dailyRevenueData,
        monthlyRevenue: monthlyRevenueData
      },
      recentOrders: processedRecentOrders,
      topProducts: topProductsWithDetails,
      orderStatusCounts,
      tableOrders
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Agora mesmo";
  if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
}

function calculateAverageOrderTime(avgAmount: number): string {
  // Simular tempo baseado no valor médio do pedido
  // Pedidos maiores geralmente levam mais tempo
  const baseTime = 15; // 15 minutos base
  const additionalTime = Math.floor(avgAmount / 10); // +1 min por cada 10 de valor
  const totalMinutes = Math.min(baseTime + additionalTime, 45); // Máximo 45 min
  
  return `${totalMinutes} min`;
}
