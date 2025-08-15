"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Clock,
  Download,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface DashboardData {
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    avgOrderTime: string;
    ordersChange: string;
    revenueChange: string;
  };
  charts: {
    dailyRevenue: Array<{ name: string; revenue: number }>;
    monthlyRevenue: Array<{ name: string; revenue: number }>;
  };
  recentOrders: Array<{
    id: string;
    image: string;
    name: string;
    description: string;
    price: string;
    time: string;
    status: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  orderStatusCounts: Array<{
    status: string;
    _count: { status: number };
  }>;
  tableOrders: Array<{
    id: string;
    customer: string;
    items: string;
    total: string;
    status: string;
    time: string;
  }>;
}



export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("7days");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error("Erro ao carregar dados do dashboard");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  if (isLoading) {
    return (
      <div className="wrapper">
        {/* Header Skeleton */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent className="pt-1">
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chart Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>

        {/* Recent Orders Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card className="mb-6">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {[...Array(6)].map((_, index) => (
                      <th key={index} className="text-left py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(4)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {[...Array(6)].map((_, colIndex) => (
                        <td key={colIndex} className="py-4 px-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-600">
            Bem-vindo de volta! Aqui está o que está acontecendo no seu restaurante.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Baixar relatório
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Pedidos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">
              {dashboardData?.metrics?.totalOrders?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {dashboardData?.metrics?.ordersChange || "0"}% do período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">
              R${dashboardData?.metrics?.totalRevenue?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {dashboardData?.metrics?.revenueChange || "0"}% do período anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">
              {dashboardData?.metrics?.totalCustomers?.toLocaleString() || "0"}
            </div>
            <div className="flex items-center text-xs text-gray-600">
              Clientes únicos neste período
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tempo Médio
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="pt-1">
            <div className="text-xl font-bold">
              {dashboardData?.metrics?.totalOrders && dashboardData.metrics.totalOrders > 0 
                ? dashboardData.metrics.avgOrderTime 
                : "N/A"}
            </div>
            <div className="flex items-center text-xs text-gray-600">
              {dashboardData?.metrics?.totalOrders && dashboardData.metrics.totalOrders > 0 
                ? "Tempo médio de preparação"
                : "Sem pedidos para calcular"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Visão Geral da Receita</CardTitle>
            <p className="text-sm text-gray-600">
              Receita mensal dos últimos 6 meses
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData?.charts?.monthlyRevenue || []}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pedidos Recentes</CardTitle>
            <p className="text-sm text-gray-600">
              Últimos pedidos dos clientes
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center space-x-3">
                  <img
                    src={order.image || "/placeholder.svg"}
                    alt={order.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.description}
                    </p>
                    <p className="text-xs text-gray-400">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {order.price}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "preparing"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "ready"
                          ? "bg-green-100 text-green-800"
                          : order.status === "delivered"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Nenhum pedido recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Pedidos Recentes
          </CardTitle>
          <p className="text-sm text-gray-600">
            Lista completa dos pedidos mais recentes
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Nº Pedido
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Itens
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Total
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Hora
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.tableOrders?.map((order, index: number) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-orange-50 hover:shadow-sm`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {order.id.replace('#', '')}
                        </div>
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {order.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {order.customer.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customer}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {order.items}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {order.total}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Preparing"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : order.status === "Ready"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full inline-block">
                        {order.time}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Itens Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.topProducts?.slice(0, 3).map((product, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium">{product.sales} orders</span>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Sem dados de produtos
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.orderStatusCounts?.map((status, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{status.status}</span>
                  <span className="text-sm font-medium text-blue-600">{status._count.status}</span>
                </div>
              )) || (
                <div className="text-center py-4 text-gray-500">
                  Sem dados de status
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo de Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vendas Totais</span>
                <span className="text-sm font-medium">
                  R${dashboardData?.metrics?.totalRevenue?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pedidos</span>
                <span className="text-sm font-medium">
                  {dashboardData?.metrics?.totalOrders?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Média por Pedido</span>
                <span className="text-sm font-medium">
                  {dashboardData?.metrics?.totalRevenue && dashboardData?.metrics?.totalOrders 
                    ? (dashboardData.metrics.totalRevenue / dashboardData.metrics.totalOrders).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
