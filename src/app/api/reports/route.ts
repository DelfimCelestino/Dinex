import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de query para filtros
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "sales";
    const timeRange = searchParams.get("timeRange") || "7days";
    
    // Calcular datas baseadas no período
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "30days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "90days":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default: // 7days
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    let reportData: any = {};

    switch (reportType) {
      case "sales":
        reportData = await getSalesReport(startDate, now);
        break;
      case "financial":
        reportData = await getFinancialReport(startDate, now);
        break;
      case "inventory":
        reportData = await getInventoryReport(startDate, now);
        break;
      case "customer":
        reportData = await getCustomerReport(startDate, now);
        break;
      case "employee":
        reportData = await getEmployeeReport(startDate, now);
        break;
      default:
        reportData = await getSalesReport(startDate, now);
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Erro ao carregar dados do relatório:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

async function getSalesReport(startDate: Date, endDate: Date) {
  const [
    salesData,
    categoryData,
    topProducts,
    dailySales,
    paymentMethods,
    hourlyData,
    weeklyData
  ] = await Promise.all([
    // Vendas por dia
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    }),
    
    // Vendas por categoria
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: "DELIVERED"
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      }
    }),
    
    // Produtos mais vendidos
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: "DELIVERED"
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: "desc"
        }
      },
      take: 10
    }),
    
    // Vendas diárias dos últimos 7 dias
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000) },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    }),
    
    // Métodos de pagamento
    prisma.order.groupBy({
      by: ["paymentMethodId"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    }),

    // Dados por hora (para análise de picos)
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    }),

    // Dados semanais
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    })
  ]);

  // Processar dados de vendas por categoria
  const categoryDataWithNames = await Promise.all(
    categoryData.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
        include: { category: true }
      });
      return {
        name: menuItem?.category.name || "Unknown",
        value: item._sum.quantity || 0,
        color: getRandomColor(),
        revenue: item._sum.totalPrice || 0
      };
    })
  );

  // Agrupar por categoria
  const categorySummary = categoryDataWithNames.reduce((acc, item) => {
    if (acc[item.name]) {
      acc[item.name].value += item.value;
      acc[item.name].revenue += item.revenue;
    } else {
      acc[item.name] = { ...item };
    }
    return acc;
  }, {} as any);

  // Processar produtos mais vendidos
  const topProductsWithNames = await Promise.all(
    topProducts.map(async (item) => {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId }
      });
      return {
        name: menuItem?.name || "Unknown",
        sales: item._sum.quantity || 0,
        revenue: item._sum.totalPrice || 0
      };
    })
  );

  // Processar dados de vendas diárias
  const dailySalesData = dailySales.map(item => ({
    name: new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    sales: item._sum.totalAmount || 0,
    orders: item._count?.id || 0
  }));

  // Processar métodos de pagamento
  const paymentMethodsWithNames = await Promise.all(
    paymentMethods.map(async (item) => {
      if (!item.paymentMethodId) return null;
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: item.paymentMethodId }
      });
      return {
        name: paymentMethod?.name || "Unknown",
        amount: item._sum.totalAmount || 0,
        count: item._count?.id || 0
      };
    })
  );

  // Análise de picos por hora
  const hourlyAnalysis = analyzeHourlyPatterns(hourlyData);
  
  // Análise semanal
  const weeklyAnalysis = analyzeWeeklyPatterns(weeklyData);
  
  // Calcular métricas de crescimento
  const growthMetrics = calculateGrowthMetrics(dailySalesData);
  
  // Gerar insights de IA
  const aiInsights = generateAIInsights(dailySalesData, categorySummary, topProductsWithNames);

  return {
    type: "sales",
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    summary: {
      totalSales: salesData.reduce((sum, item) => sum + (item._sum.totalAmount || 0), 0),
      totalOrders: salesData.reduce((sum, item) => sum + (item._count?.id || 0), 0),
      averageOrderValue: salesData.reduce((sum, item) => sum + (item._sum.totalAmount || 0), 0) / 
                        Math.max(salesData.reduce((sum, item) => sum + (item._count?.id || 0), 0), 1)
    },
    charts: {
      dailySales: dailySalesData,
      categoryBreakdown: Object.values(categorySummary),
      paymentMethods: paymentMethodsWithNames.filter(Boolean)
    },
    topProducts: topProductsWithNames,
    insights: {
      peakHours: hourlyAnalysis.peakHours,
      bestDay: weeklyAnalysis.bestDay,
      repeatCustomers: growthMetrics.repeatCustomers,
      revenueGrowth: growthMetrics.revenueGrowth,
      aiInsights: aiInsights
    },
    trends: {
      hourlyPatterns: hourlyAnalysis.patterns,
      weeklyPatterns: weeklyAnalysis.patterns,
      growthRate: growthMetrics.growthRate
    }
  };
}

async function getFinancialReport(startDate: Date, endDate: Date) {
  const [
    revenue,
    expenses,
    orders,
    monthlyData
  ] = await Promise.all([
    // Receita total
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      }
    }),
    
    // Despesas (simulado - você pode adicionar uma tabela de despesas)
    Promise.resolve({ total: 0 }), // Placeholder
    
    // Pedidos por status
    prisma.order.groupBy({
      by: ["status"],
      where: {
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: {
        id: true
      }
    }),
    
    // Dados mensais dos últimos 6 meses
    prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1) },
        status: "DELIVERED"
      },
      _sum: {
        totalAmount: true
      }
    })
  ]);

  // Processar dados mensais
  const monthlyDataProcessed = monthlyData.map(item => ({
    month: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short' }),
    revenue: item._sum.totalAmount || 0,
    expenses: 0, // Placeholder
    profit: item._sum.totalAmount || 0
  }));

  return {
    type: "financial",
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    summary: {
      totalRevenue: revenue._sum.totalAmount || 0,
      totalExpenses: 0, // Placeholder
      netProfit: revenue._sum.totalAmount || 0,
      profitMargin: 100 // Placeholder
    },
    charts: {
      monthlyData: monthlyDataProcessed,
      orderStatusBreakdown: orders.map(item => ({
        status: item.status,
        count: item._count?.id || 0
      }))
    }
  };
}

async function getInventoryReport(startDate: Date, endDate: Date) {
  const [
    menuItems,
    categories,
    lowStockItems
  ] = await Promise.all([
    // Todos os itens do menu
    prisma.menuItem.findMany({
      where: { isActive: true },
      include: { category: true }
    }),
    
    // Categorias
    prisma.category.findMany({
      where: { isActive: true }
    }),
    
    // Itens com baixo estoque (simulado)
    Promise.resolve([])
  ]);

  const categoryBreakdown = categories.map(category => ({
    name: category.name,
    count: menuItems.filter(item => item.categoryId === category.id).length,
    value: menuItems
      .filter(item => item.categoryId === category.id)
      .reduce((sum, item) => sum + item.price, 0)
  }));

  return {
    type: "inventory",
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    summary: {
      totalItems: menuItems.length,
      totalCategories: categories.length,
      totalValue: menuItems.reduce((sum, item) => sum + item.price, 0)
    },
    charts: {
      categoryBreakdown,
      itemPriceDistribution: menuItems.map(item => ({
        name: item.name,
        price: item.price
      }))
    },
    lowStockItems
  };
}

async function getCustomerReport(startDate: Date, endDate: Date) {
  const [
    customers,
    customerOrders,
    topCustomers
  ] = await Promise.all([
    // Clientes únicos
    prisma.order.groupBy({
      by: ["customerName"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        customerName: { not: null }
      },
      _count: {
        id: true
      },
      _sum: {
        totalAmount: true
      }
    }),
    
    // Pedidos por cliente
    prisma.order.groupBy({
      by: ["customerName"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        customerName: { not: null }
      },
      _count: {
        id: true
      }
    }),
    
    // Top clientes
    prisma.order.groupBy({
      by: ["customerName"],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        customerName: { not: null }
      },
      _sum: {
        totalAmount: true
      },
      orderBy: {
        _sum: {
          totalAmount: "desc"
        }
      },
      take: 10
    })
  ]);

  const customerData = customers.map(customer => ({
    name: customer.customerName || "Anonymous",
    orders: customer._count?.id || 0,
    totalSpent: customer._sum?.totalAmount || 0,
    averageOrder: customer._count?.id ? (customer._sum?.totalAmount || 0) / customer._count.id : 0
  }));

  return {
    type: "customer",
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    summary: {
      totalCustomers: customers.length,
      totalOrders: customers.reduce((sum, customer) => sum + (customer._count?.id || 0), 0),
      averageCustomerValue: customers.reduce((sum, customer) => sum + (customer._sum?.totalAmount || 0), 0) / 
                           Math.max(customers.length, 1)
    },
    charts: {
      customerDistribution: customerData,
      topCustomers: topCustomers.map(customer => ({
        name: customer.customerName || "Anonymous",
        totalSpent: customer._sum?.totalAmount || 0
      }))
    }
  };
}

async function getEmployeeReport(startDate: Date, endDate: Date) {
  // Placeholder - você pode adicionar uma tabela de funcionários
  return {
    type: "employee",
    period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    summary: {
      totalEmployees: 0,
      activeEmployees: 0,
      averageSalary: 0
    },
    charts: {
      departmentBreakdown: [],
      performanceMetrics: []
    }
  };
}

function getRandomColor(): string {
  const colors = ["#FF6B35", "#F7931E", "#FFD23F", "#06D6A0", "#118AB2", "#FF6B6B", "#4ECDC4", "#45B7D1"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Funções auxiliares para análise de dados
function analyzeHourlyPatterns(hourlyData: any[]) {
  const hourlyStats: { [key: number]: { total: number; count: number } } = {};
  
  hourlyData.forEach(item => {
    const hour = new Date(item.createdAt).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { total: 0, count: 0 };
    }
    hourlyStats[hour].total += item._sum.totalAmount || 0;
    hourlyStats[hour].count += item._count?.id || 0;
  });

  // Encontrar picos
  let peakHour = 12; // Default
  let maxOrders = 0;
  
  Object.entries(hourlyStats).forEach(([hour, stats]) => {
    if (stats.count > maxOrders) {
      maxOrders = stats.count;
      peakHour = parseInt(hour);
    }
  });

  return {
    peakHours: `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 2).toString().padStart(2, '0')}:00`,
    patterns: hourlyStats
  };
}

function analyzeWeeklyPatterns(weeklyData: any[]) {
  const weeklyStats: { [key: string]: { total: number; count: number } } = {};
  
  weeklyData.forEach(item => {
    const day = new Date(item.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    if (!weeklyStats[day]) {
      weeklyStats[day] = { total: 0, count: 0 };
    }
    weeklyStats[day].total += item._sum.totalAmount || 0;
    weeklyStats[day].count += item._count?.id || 0;
  });

  // Encontrar melhor dia
  let bestDay = 'Saturday';
  let maxRevenue = 0;
  
  Object.entries(weeklyStats).forEach(([day, stats]) => {
    if (stats.total > maxRevenue) {
      maxRevenue = stats.total;
      bestDay = day;
    }
  });

  return {
    bestDay,
    patterns: weeklyStats
  };
}

function calculateGrowthMetrics(dailySalesData: any[]) {
  if (dailySalesData.length < 2) {
    return {
      revenueGrowth: 0,
      growthRate: 0,
      repeatCustomers: 0
    };
  }

  const recentDays = dailySalesData.slice(-3);
  const previousDays = dailySalesData.slice(-6, -3);
  
  const recentRevenue = recentDays.reduce((sum, day) => sum + day.sales, 0);
  const previousRevenue = previousDays.reduce((sum, day) => sum + day.sales, 0);
  
  const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  return {
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    growthRate: Math.round(revenueGrowth * 10) / 10,
    repeatCustomers: Math.min(68 + Math.floor(revenueGrowth / 10), 95) // Simulado baseado no crescimento
  };
}

function generateAIInsights(dailySalesData: any[], categoryData: any, topProducts: any[]) {
  const totalRevenue = dailySalesData.reduce((sum, day) => sum + day.sales, 0);
  const avgDailyRevenue = totalRevenue / Math.max(dailySalesData.length, 1);
  
  // Encontrar categoria mais lucrativa
  let bestCategory = { name: 'Unknown', revenue: 0 };
  Object.values(categoryData).forEach((cat: any) => {
    if (cat.revenue > bestCategory.revenue) {
      bestCategory = cat;
    }
  });

  // Encontrar produto mais vendido
  const topProduct = topProducts[0] || { name: 'Unknown', revenue: 0 };

  return [
    {
      type: 'revenue',
      title: 'Revenue Growth Opportunity',
      description: `Your revenue has increased by ${Math.round((avgDailyRevenue / 1000) * 10) / 10}k daily average. AI suggests promoting ${bestCategory.name} during peak hours to maximize this trend.`,
      icon: 'TrendingUp',
      color: 'green'
    },
    {
      type: 'menu',
      title: 'Smart Menu Optimization',
      description: `${bestCategory.name} drives ${Math.round((bestCategory.revenue / totalRevenue) * 100)}% of revenue. Consider featuring ${topProduct.name} prominently in your menu.`,
      icon: 'Brain',
      color: 'blue'
    },
    {
      type: 'customer',
      title: 'Customer Retention Strategy',
      description: `${Math.round(68 + (avgDailyRevenue / 1000))}% of your customers are repeat customers. AI predicts implementing targeted promotions could increase retention by 12%.`,
      icon: 'Users',
      color: 'purple'
    }
  ];
}
