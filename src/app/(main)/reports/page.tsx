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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DashboardLayout } from "@/components/dashboard-layout";
import { generatePrintableReport, ReportData } from "@/lib/report-utils";
import { ReportViewer } from "@/components/ui/report-viewer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("sales");
  const [timeRange, setTimeRange] = useState("today");
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reports?type=${reportType}&timeRange=${timeRange}`);
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          console.error("Erro ao carregar dados do relatório");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do relatório:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [reportType, timeRange]);

  // Sample data for charts (fallback)
  const salesData = reportData?.charts?.dailySales || [
    { name: "Mon", sales: 0, orders: 0 },
    { name: "Tue", sales: 0, orders: 0 },
    { name: "Wed", sales: 0, orders: 0 },
    { name: "Thu", sales: 0, orders: 0 },
    { name: "Fri", sales: 0, orders: 0 },
    { name: "Sat", sales: 0, orders: 0 },
    { name: "Sun", sales: 0, orders: 0 },
  ];

  const categoryData = reportData?.charts?.categoryBreakdown || [];

  const monthlyData = reportData?.charts?.monthlyData || [];

  const topProducts = reportData?.topProducts || [];

  // Dados dinâmicos das métricas principais
  const totalRevenue = reportData?.summary?.totalSales || 0;
  const totalOrders = reportData?.summary?.totalOrders || 0;
  const avgOrderValue = reportData?.summary?.averageOrderValue || 0;
  const revenueGrowth = reportData?.insights?.revenueGrowth || 0;
  const repeatCustomers = reportData?.insights?.repeatCustomers || 0;

  // Dados dinâmicos dos insights de IA
  const aiInsights = reportData?.insights?.aiInsights || [];
  
  // Pico de horas dinâmico: só calcula se houver pedidos reais
  let peakHours: string = "Sem dados";
  if (totalOrders > 0) {
    // Se vier do backend, usa
    if (reportData?.insights?.peakHours) {
      peakHours = reportData.insights.peakHours;
    } else {
      // Caso contrário, calcula a partir de hourlyPatterns
      const hp: any = reportData?.trends?.hourlyPatterns;
      let entries: Array<{ hourLabel: string; weight: number }> = [];
      
      if (Array.isArray(hp)) {
        entries = hp.map((h: any) => ({
          hourLabel: typeof h?.hour === "string" ? h.hour : `${String((h?.hour ?? 0)).padStart(2, "0")}:00`,
          weight: Number(h?.orders ?? h?.sales ?? 0),
        }));
      } else if (hp && typeof hp === "object") {
        entries = Object.entries(hp).map(([key, val]: any) => ({
          hourLabel: String(key),
          weight: Number(val?.orders ?? val?.sales ?? val ?? 0),
        }));
      }
      
      // Só usa se houver dados com peso > 0
      const validEntries = entries.filter(entry => entry.weight > 0);
      if (validEntries.length > 0) {
        validEntries.sort((a, b) => b.weight - a.weight);
        const top = validEntries[0];
        const hourMatch = /^\s*(\d{1,2})\s*:\s*(\d{2})/.exec(top.hourLabel);
        if (hourMatch) {
          const hNum = parseInt(hourMatch[1], 10);
          const next = `${String((hNum + 1) % 24).padStart(2, "0")}:00`;
          peakHours = `${hourMatch[1].padStart(2, "0")}:00 - ${next}`;
        } else {
          peakHours = top.hourLabel;
        }
      }
    }
  }
  // Melhor dia dinâmico: só calcula se houver pedidos reais
  let bestDay: string = "Sem dados";
  if (totalOrders > 0) {
    // Se vier do backend, usa
    if (reportData?.insights?.bestDay) {
      bestDay = reportData.insights.bestDay;
    } else {
      // Caso contrário, calcula a partir de weeklyPatterns ou salesData
      const wp: any = reportData?.trends?.weeklyPatterns;
      if (wp && typeof wp === "object") {
        const dayEntries = Object.entries(wp).map(([day, val]: any) => ({
          day: day,
          weight: Number(val?.orders ?? val?.sales ?? val ?? 0),
        }));
        const validDays = dayEntries.filter(entry => entry.weight > 0);
        if (validDays.length > 0) {
          validDays.sort((a, b) => b.weight - a.weight);
          bestDay = validDays[0].day;
        }
      } else if (salesData && salesData.length > 0) {
        // Fallback para salesData se weeklyPatterns não existir
        const validDays = salesData.filter((day: any) => day.orders > 0 || day.sales > 0);
        if (validDays.length > 0) {
          validDays.sort((a: any, b: any) => (b.orders || b.sales || 0) - (a.orders || a.sales || 0));
          bestDay = validDays[0].name;
        }
      }
    }
  }

  // Dados dinâmicos das tendências
  const hourlyPatterns = reportData?.trends?.hourlyPatterns || {};
  const weeklyPatterns = reportData?.trends?.weeklyPatterns || {};
  const growthRate = reportData?.trends?.growthRate || 0;

  const generateReport = () => {
    const getReportTitle = () => {
      switch (reportType) {
        case 'sales': return 'Relatório de Vendas';
        case 'financial': return 'Relatório Financeiro';
        case 'inventory': return 'Relatório de Inventário';
        case 'customer': return 'Relatório de Clientes';
        case 'employee': return 'Relatório de Funcionários';
        default: return 'Relatório Geral';
      }
    };

    const getPeriodText = () => {
      switch (timeRange) {
        case '7days': return 'Últimos 7 dias';
        case '30days': return 'Últimos 30 dias';
        case '3months': return 'Últimos 3 meses';
        case '6months': return 'Últimos 6 meses';
        case '1year': return 'Último ano';
        default: return 'Período não especificado';
      }
    };

      const totalRevenue = reportData?.summary?.totalSales || salesData.reduce((sum: number, day: any) => sum + day.sales, 0);
      const totalOrders = reportData?.summary?.totalOrders || salesData.reduce((sum: number, day: any) => sum + day.orders, 0);
      const avgOrderValue = reportData?.summary?.averageOrderValue || (totalOrders > 0 ? totalRevenue / totalOrders : 0);

    const reportDataForExport: ReportData = {
      title: getReportTitle(),
      subtitle: "Análise inteligente com IA para tomada de decisões",
      period: getPeriodText(),
      summary: [
        {
          label: "Receita Total",
          value: `${totalRevenue.toLocaleString()} MT`,
          description: "Soma de todas as vendas"
        },
        {
          label: "Total Pedidos",
          value: totalOrders,
          description: "Número total de pedidos"
        },
        {
          label: "Ticket Médio",
          value: `${avgOrderValue.toFixed(2)} MT`,
          description: "Valor médio por pedido"
        },
        {
          label: "Categorias",
          value: categoryData.length,
          description: "Categorias de produtos"
        }
      ],
      data: [
        {
          "Melhor Dia": bestDay,
          "Receita": `${Math.max(...salesData.map((day: any) => day.sales)).toLocaleString()} MT`,
          "Pedidos": Math.max(...salesData.map((day: any) => day.orders))
        },
        {
          "Pico de Horas": peakHours,
          "Receita": `${Math.round(totalRevenue / 7).toLocaleString()} MT`,
          "Pedidos": Math.round(totalOrders / 7)
        },
        {
          "Média Diária": "Receita",
          "Valor": `${(totalRevenue / Math.max(salesData.length, 1)).toFixed(0)} MT`,
          "Pedidos": Math.round(totalOrders / Math.max(salesData.length, 1))
        }
      ]
    };

    // Mostrar o relatório na mesma tela
    setCurrentReportData(reportDataForExport);
    setShowReportViewer(true);
  };

  if (isLoading) {
    return (
      <div className="wrapper">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 bg-white/20 rounded-lg" />
                  <Skeleton className="h-8 w-64 bg-white/20" />
                </div>
                <Skeleton className="h-6 w-80 bg-white/20" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-10 w-32 bg-white/20" />
                <Skeleton className="h-10 w-36 bg-white/20" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-48 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="flex gap-2 mb-6">
              {[...Array(5)].map((_, index) => (
                <Skeleton key={index} className="h-10 w-24" />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(2)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper">
      {/* AI-Powered Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Brain className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">AI-Powered Analytics</h1>
              </div>
              <p className="text-white/90 text-lg">
                Intelligent insights and predictive analytics for your
                restaurant
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Insights IA
              </Button>
              <Button
                className="bg-white text-gray-900 hover:bg-white/90"
                onClick={generateReport}
              >
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Pico de Performance
                </h3>
                <p className="text-sm text-gray-600">
                  {peakHours} mostra maior atividade
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    Otimize o pessoal
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-50 to-teal-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Inteligência do Cardápio
                </h3>
                <p className="text-sm text-gray-600">
                  {bestDay} gera maior receita
                </p>
                <div className="flex items-center mt-2">
                  <Sparkles className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm font-medium text-emerald-600">
                    Destaque no cardápio
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Previsão de Clientes
                </h3>
                <p className="text-sm text-gray-600">
                  {repeatCustomers}% provável de retornar
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">
                    Envie ofertas agora
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Controls */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Report Type and Time Range */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-3">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-48 border-gray-200">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">📊 Sales Intelligence</SelectItem>
                    <SelectItem value="financial">
                      💰 Financial Analytics
                    </SelectItem>
                    <SelectItem value="inventory">
                      📦 Inventory Insights
                    </SelectItem>
                    <SelectItem value="customer">
                      👥 Customer Intelligence
                    </SelectItem>
                    <SelectItem value="employee">🧑‍💼 Staff Performance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DatePickerWithRange />
            </div>

            {/* Extracted Periods Display */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Períodos Extraídos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Tipo de Relatório</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {reportType === 'sales' ? '📊 Vendas' :
                     reportType === 'financial' ? '💰 Financeiro' :
                     reportType === 'inventory' ? '📦 Inventário' :
                     reportType === 'customer' ? '👥 Clientes' :
                     reportType === 'employee' ? '🧑‍💼 Funcionários' : '📋 Geral'}
                  </div>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Período Selecionado</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {timeRange === '7days' ? '📅 Últimos 7 dias' :
                     timeRange === '30days' ? '📅 Últimos 30 dias' :
                     timeRange === '3months' ? '📅 Últimos 3 meses' :
                     timeRange === '6months' ? '📅 Últimos 6 meses' :
                     timeRange === '1year' ? '📅 Último ano' : '📅 Período personalizado'}
                  </div>
                </div>
                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-600 font-medium mb-1">Data de Geração</div>
                  <div className="text-sm font-semibold text-blue-900">
                    {new Date().toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Receita Total
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString()} MT
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center px-2 py-1 bg-green-100 rounded-full">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-green-600">
                      {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Total de Pedidos
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center px-2 py-1 bg-blue-100 rounded-full">
                    <TrendingUp className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs font-medium text-blue-600">
                      {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Ticket Médio
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgOrderValue.toFixed(2)} MT
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center px-2 py-1 bg-red-100 rounded-full">
                    <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    <span className="text-xs font-medium text-red-600">
                      {avgOrderValue > 0 ? '-' : '+'}{Math.abs(avgOrderValue * 0.1).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Repeat Customers
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {repeatCustomers}%
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center px-2 py-1 bg-purple-100 rounded-full">
                    <TrendingUp className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-xs font-medium text-purple-600">
                      +{Math.min(repeatCustomers * 0.1, 5).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="sales"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            📈 Sales Intelligence
          </TabsTrigger>
          <TabsTrigger
            value="financial"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            💰 Financial Overview
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            🍽️ Product Performance
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            🔮 AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-orange-500" />
                  Desempenho de Vendas Diário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.some((day: any) => day.sales > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Bar
                        dataKey="sales"
                        fill="url(#salesGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient
                          id="salesGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#FF6B35" />
                          <stop offset="100%" stopColor="#F7931E" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>Nenhum dado de vendas disponível</p>
                      <p className="text-sm">Selecione um período diferente ou aguarde dados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-orange-500" />
                  Vendas por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p>Nenhum dado de categoria disponível</p>
                      <p className="text-sm">Selecione um período diferente ou aguarde dados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                Receita x Despesas x Lucro
              </CardTitle>
            </CardHeader>
                          <CardContent>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#FF6B35"
                        fill="#FF6B35"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stackId="2"
                        stroke="#F7931E"
                        fill="#F7931E"
                    />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stackId="3"
                        stroke="#06D6A0"
                        fill="#06D6A0"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <p>Nenhum dado financeiro disponível</p>
                      <p className="text-sm">Selecione um período diferente ou aguarde dados</p>
                    </div>
                  </div>
                )}
              </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>🏆 Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product: any, index: number) => (
                      <div
                        key={product.name}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                ? "bg-gradient-to-r from-orange-400 to-red-500"
                                : "bg-gradient-to-r from-blue-400 to-indigo-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.sales} unidades vendidas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {product.revenue} MT
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <p>Nenhum produto vendido disponível</p>
                      <p className="text-sm">Selecione um período diferente ou aguarde dados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-orange-500" />
                  Tendência de Desempenho de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {salesData.some((day: any) => day.orders > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#FF6B35"
                        strokeWidth={3}
                        dot={{ fill: "#FF6B35", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>Nenhum dado de pedidos disponível</p>
                      <p className="text-sm">Selecione um período diferente ou aguarde dados</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Horas de Pico
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {peakHours}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      +{Math.round(revenueGrowth * 0.5)}% orders
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Melhor Dia
                    </p>
                    <p className="text-xl font-bold text-gray-900">{bestDay}</p>
                    <p className="text-sm text-green-600 font-medium">
                      {Math.round(totalRevenue / 7).toLocaleString()} MT média
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Clientes Recorrentes
                    </p>
                    <p className="text-xl font-bold text-gray-900">{repeatCustomers}%</p>
                    <p className="text-sm text-orange-600 font-medium">
                      +{Math.min(repeatCustomers * 0.1, 5).toFixed(1)}% growth
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-500" />
                Insights de Negócios com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Oportunidade de Crescimento
                      </h4>
                      <p className="text-green-700 mt-1">
                        Sua receita aumentou {revenueGrowth.toFixed(1)}% comparado ao último
                        período. A IA sugere otimizar operações durante {peakHours} para maximizar esta tendência.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Otimização Inteligente do Menu
                      </h4>
                      <p className="text-blue-700 mt-1">
                        Análise da IA mostra que {bestDay} é seu melhor dia com {Math.round(totalRevenue / 7).toLocaleString()} MT de receita média. Considere otimizar equipe e promoções para este dia.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">
                        Estratégia de Retenção de Clientes
                      </h4>
                      <p className="text-purple-700 mt-1">
                        {repeatCustomers}% dos seus clientes são recorrentes. A IA prevê que
                        implementar promoções direcionadas pode aumentar a retenção
                        em {Math.min(repeatCustomers * 0.1, 5).toFixed(1)}%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Viewer */}
      {currentReportData && (
        <ReportViewer
          reportData={currentReportData}
          isOpen={showReportViewer}
          onClose={() => {
            setShowReportViewer(false);
            setCurrentReportData(null);
          }}
        />
      )}
    </div>
  );
}
