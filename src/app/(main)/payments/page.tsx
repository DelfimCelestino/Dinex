"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Eye,
  Calendar,
 
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { generatePrintableReport, ReportData } from "@/lib/report-utils";
import { ReportViewer } from "@/components/ui/report-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Validar que as datas são válidas
    if (isNaN(now.getTime()) || isNaN(firstDayOfMonth.getTime())) {
      return undefined;
    }
    
    return {
      from: firstDayOfMonth,
      to: now,
    };
  });
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [currentReportData, setCurrentReportData] = useState<ReportData | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("today"); // all, today, yesterday, custom
  
  // Estados para modal de detalhes
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<any>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  // Carregar todos os pedidos do banco (incluindo cancelados)
  useEffect(() => {
    const fetchOrdersWithFilters = async () => {
      try {
        setIsLoading(true);
        
        // Construir URL com filtros
        const params = new URLSearchParams();
        
        // Filtros de data
        if (dateFilter === "today") {
          params.append("dateFilter", "today");
        } else if (dateFilter === "yesterday") {
          params.append("dateFilter", "yesterday");
        } else if (dateFilter === "custom" && dateRange?.from && dateRange?.to && 
                   dateRange.from instanceof Date && dateRange.to instanceof Date && 
                   !isNaN(dateRange.from.getTime()) && !isNaN(dateRange.to.getTime())) {
          params.append("dateFilter", "custom");
          params.append("dateFrom", dateRange.from.toISOString());
          params.append("dateTo", dateRange.to.toISOString());
        }
        
        // Filtros de status e método
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        
        if (methodFilter !== "all") {
          // Mapear método para nome do banco
          const methodMap: { [key: string]: string } = {
            "M-Pesa": "M-Pesa",
            "E-Mola": "E-Mola", 
            "Cash": "Dinheiro"
          };
          if (methodMap[methodFilter]) {
            params.append("method", methodMap[methodFilter]);
          }
        }
        
        // Filtro de busca
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }
        
        const response = await fetch(`/api/orders?${params.toString()}`);
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        } else {
          console.error("Erro ao carregar pedidos");
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrdersWithFilters();
  }, [dateFilter, dateRange, statusFilter, methodFilter, searchTerm]);

  // Converter pedidos para o formato de pagamentos
  const payments = orders.map(order => {

    
    let paymentStatus;
    if (order.status === 'CANCELLED') {
      paymentStatus = 'failed';
    } else if (order.isPaid) {
      paymentStatus = 'completed';
    } else {
      paymentStatus = 'pending';
    }
    

    
    return {
      id: order.orderNumber,
      customer: order.customerName || 'Cliente Anônimo',
      method: order.paymentMethod?.name || 'N/A',
      amount: order.totalAmount,
      status: paymentStatus,
      date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
      time: new Date(order.createdAt).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      cancellationReason: order.cancellationReason || null,
    };
  });



  const filteredPayments = payments.filter((payment) => {
    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" || payment.method === methodFilter;
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtros de data já são aplicados no banco de dados
    return matchesStatus && matchesMethod && matchesSearch;
  });



  // Paginação
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, methodFilter, searchTerm, dateFilter, dateRange]);

  const totalRevenue = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const failedAmount = filteredPayments
    .filter((p) => p.status === "failed")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleViewDetails = (payment: any) => {
    // Encontrar o order original correspondente
    const originalOrder = orders.find(order => order.orderNumber === payment.id);
    if (originalOrder) {
      setSelectedPaymentDetails({
        payment,
        order: originalOrder
      });
      setShowDetailsDialog(true);
    }
  };

  const generateReport = () => {
    const completedPayments = filteredPayments.filter(p => p.status === "completed");
    const pendingPayments = filteredPayments.filter(p => p.status === "pending");
    const failedPayments = filteredPayments.filter(p => p.status === "failed");
    
    const reportData: ReportData = {
      title: "Relatório de Pagamentos",
      subtitle: "Análise completa de transações financeiras",
      period: dateFilter === "today" ? "Hoje" :
              dateFilter === "yesterday" ? "Ontem" :
              dateRange?.from && dateRange?.to 
                ? `${format(dateRange.from, 'dd/MM/yyyy')} a ${format(dateRange.to, 'dd/MM/yyyy')}`
                : "Todos os períodos",
      summary: [
        {
          label: "Receita Total",
          value: `R$${totalRevenue.toFixed(2)}`,
          description: "Transações concluídas"
        },
        {
          label: "Valor Pendente",
          value: `R$${pendingAmount.toFixed(2)}`,
          description: "Transações pendentes"
        },
        {
          label: "Valor Perdido",
          value: `R$${failedAmount.toFixed(2)}`,
          description: "Pedidos cancelados"
        },
        {
          label: "Total Transações",
          value: filteredPayments.length,
          description: "Todas as transações"
        },
        {
          label: "Concluídas",
          value: completedPayments.length,
          description: "Pagamentos realizados"
        },
        {
          label: "Pendentes",
          value: pendingPayments.length,
          description: "Aguardando pagamento"
        },
        {
          label: "Cancelados",
          value: failedPayments.length,
          description: "Pedidos cancelados"
        }
      ],
      data: filteredPayments.map(payment => ({
        ID: payment.id,
        Cliente: payment.customer,
        Método: payment.method,
        Valor: `R$${payment.amount.toFixed(2)}`,
        Status: payment.status === "completed" ? "Concluído" :
                payment.status === "pending" ? "Pendente" : "Cancelado",
        Data: payment.date,
        Hora: payment.time,
        "Motivo Cancelamento": payment.cancellationReason || "-"
      }))
    };

    // Mostrar o relatório na mesma tela
    setCurrentReportData(reportData);
    setShowReportViewer(true);
  };

  if (isLoading) {
    return (
      <div className="wrapper">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
              <Skeleton className="h-6 w-80 bg-white/20" />
            </div>
            <Skeleton className="h-10 w-32 bg-white/20" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-48" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-8 w-24" />
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white border border-green-200 rounded-lg p-3">
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Skeleton */}
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[900px] rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      {[...Array(7)].map((_, index) => (
                        <th key={index} className="text-left py-4 px-4">
                          <Skeleton className="h-4 w-20" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <tr key={rowIndex} className="border-b border-gray-100">
                        {[...Array(7)].map((_, colIndex) => (
                          <td key={colIndex} className="py-4 px-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="wrapper">
      {/* Modern Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Análise de Pagamentos</h1>
            <p className="text-orange-100 text-lg">
              Acompanhe e gerencie todas as transações financeiras
            </p>
          </div>
          <Button 
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={generateReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Receita Total
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {totalRevenue.toFixed(2)} MT
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">
                  Pendentes
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {pendingAmount.toFixed(2)} MT
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-yellow-600 font-medium">
                    {filteredPayments.filter((p) => p.status === "pending").length}{" "}
                    transações
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Cancelados</p>
                <p className="text-3xl font-bold text-red-900">
                  {failedAmount.toFixed(2)} MT
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600 font-medium">
                    {filteredPayments.filter((p) => p.status === "failed").length}{" "}
                    pedidos cancelados
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total de Transações
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {filteredPayments.length}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Search */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {/* Search and Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar por cliente ou ID do pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="failed">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full sm:w-[180px] border-gray-200">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Métodos</SelectItem>
                  <SelectItem value="M-Pesa">M-Pesa</SelectItem>
                  <SelectItem value="E-Mola">E-Mola</SelectItem>
                  <SelectItem value="Cash">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtrar por período:</span>
              </div>
              <DatePickerWithRange 
                className="w-auto"
                date={dateRange}
                onDateChange={(newDateRange) => {
                  // Validar que as datas são válidas antes de atualizar
                  if (newDateRange?.from && newDateRange?.to && 
                      newDateRange.from instanceof Date && newDateRange.to instanceof Date &&
                      !isNaN(newDateRange.from.getTime()) && !isNaN(newDateRange.to.getTime())) {
                    setDateRange(newDateRange);
                  }
                }}
              />
              {dateRange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange(undefined)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Limpar Filtro
                </Button>
              )}
            </div>

            {/* Quick Date Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setDateFilter("all");
                  setDateRange(undefined);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  dateFilter === "all"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                📅 Todos os Dias
              </button>
              <button
                onClick={() => {
                  setDateFilter("today");
                  setDateRange(undefined);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  dateFilter === "today"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🌅 Hoje ({new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
              </button>
              <button
                onClick={() => {
                  setDateFilter("yesterday");
                  setDateRange(undefined);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  dateFilter === "yesterday"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                🌙 Ontem ({(new Date(Date.now() - 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
              </button>
            </div>

            {/* Extracted Periods Display */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Períodos Extraídos
              </h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Tipo de Relatório</div>
                  <div className="text-sm font-semibold text-green-900">
                    💰 Relatório de Pagamentos
                  </div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Período Selecionado</div>
                  <div className="text-sm font-semibold text-green-900">
                    {dateFilter === "today" ? "🌅 Hoje" :
                     dateFilter === "yesterday" ? "🌙 Ontem" :
                     dateRange?.from && dateRange?.to 
                       ? `📅 ${format(dateRange.from, 'dd/MM/yyyy')} a ${format(dateRange.to, 'dd/MM/yyyy')}`
                       : '📅 Todos os períodos'
                    }
                  </div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Total de Transações</div>
                  <div className="text-sm font-semibold text-green-900">
                    {filteredPayments.length} transações
                  </div>
                </div>
                <div className="bg-white border border-green-200 rounded-lg p-3">
                  <div className="text-xs text-green-600 font-medium mb-1">Pedidos Cancelados</div>
                  <div className="text-sm font-semibold text-green-900">
                    {filteredPayments.filter(p => p.status === "failed").length} cancelados
                  </div>
                  {filteredPayments.filter(p => p.status === "failed").length === 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {dateFilter === "today" ? "Nenhum cancelamento hoje" :
                       dateFilter === "yesterday" ? "Nenhum cancelamento ontem" :
                       "Nenhum cancelamento no período"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Table (responsive) */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-[900px] rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <TableRow className="border-b-2 border-gray-200">
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    ID do Pagamento
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Cliente
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Método
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Valor
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Data & Hora
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Motivo Cancelamento
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 px-4 text-sm uppercase tracking-wide whitespace-nowrap">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        <p className="text-lg font-medium mb-2">Nenhum pagamento encontrado</p>
                        <p className="text-sm">
                          {dateFilter === "today" ? "Não há pagamentos para hoje" :
                           dateFilter === "yesterday" ? "Não há pagamentos para ontem" :
                           statusFilter !== "all" ? `Não há pagamentos com status "${statusFilter}"` :
                           methodFilter !== "all" ? `Não há pagamentos com método "${methodFilter}"` :
                           searchTerm ? `Nenhum resultado para "${searchTerm}"` :
                           "Não há pagamentos disponíveis"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentPayments.map((payment, index) => (
                  <TableRow
                    key={payment.id}
                    className={`transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-orange-50 hover:shadow-sm`}
                  >
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {payment.id.replace('PAY', '')}
                        </div>
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {payment.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {payment.customer.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.customer}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <Badge 
                        variant="outline" 
                        className={`font-medium px-3 py-1 ${
                          payment.method === 'M-Pesa' 
                            ? 'border-purple-200 text-purple-700 bg-purple-50'
                            : payment.method === 'E-Mola'
                            ? 'border-blue-200 text-blue-700 bg-blue-50'
                            : 'border-green-200 text-green-700 bg-green-50'
                        }`}
                      >
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {payment.amount.toFixed(2)} MT
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <Badge className={`${getStatusColor(payment.status)} px-3 py-1 text-xs font-semibold`}>
                        {payment.status === "completed" ? "Concluído" :
                         payment.status === "pending" ? "Pendente" : "Cancelado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.date}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {payment.time}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      {payment.status === "cancelled" && payment.cancellationReason ? (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">
                            {payment.cancellationReason}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
                          onClick={() => handleViewDetails(payment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredPayments.length)} de {filteredPayments.length} transações
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1"
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="px-3 py-1 min-w-[40px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* Modal de Detalhes do Pagamento */}
      {selectedPaymentDetails && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl h-[90vh] flex flex-col bg-white">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                🧾 Detalhes do Pagamento
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {selectedPaymentDetails.payment.id} - {selectedPaymentDetails.payment.date}
              </p>
            </DialogHeader>

            <div className="py-4 space-y-6 flex-1 overflow-y-auto">
              {/* Payment Header */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-bold text-blue-800 mb-2">💳 Informações do Pagamento</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Status:</span>
                    <p className="font-medium text-blue-900">
                      {selectedPaymentDetails.payment.status === "completed" ? "✅ Concluído" : 
                       selectedPaymentDetails.payment.status === "pending" ? "⏳ Pendente" : "❌ Cancelado"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600">Método:</span>
                    <p className="font-medium text-blue-900">{selectedPaymentDetails.payment.method}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Valor:</span>
                    <p className="font-medium text-blue-900">${selectedPaymentDetails.payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-blue-600">Hora:</span>
                    <p className="font-medium text-blue-900">{selectedPaymentDetails.payment.time}</p>
                  </div>
                </div>
                {selectedPaymentDetails.payment.cancellationReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700 font-medium">
                      ❌ Motivo do Cancelamento: {selectedPaymentDetails.payment.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Informações do Pedido
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pedido:</span>
                    <p className="font-medium text-gray-900">{selectedPaymentDetails.order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <p className="font-medium text-gray-900">{selectedPaymentDetails.order.customerName || 'Anônimo'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Método:</span>
                    <p className="font-medium text-gray-900">{selectedPaymentDetails.order.paymentMethod?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPaymentDetails.order.status === "DELIVERED" ? "✅ Entregue" :
                       selectedPaymentDetails.order.status === "CANCELLED" ? "❌ Cancelado" :
                       selectedPaymentDetails.order.status === "READY" ? "🟢 Pronto" :
                       selectedPaymentDetails.order.status === "PREPARING" ? "🟡 Preparando" :
                       "🔵 Novo"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium text-gray-900">
                      {selectedPaymentDetails.order.isDelivery ? '🛍️ Para Levar' : `🪑 Mesa ${selectedPaymentDetails.order.table?.number || 'N/A'}`}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Área:</span>
                    <p className="font-medium text-gray-900">{selectedPaymentDetails.order.area?.name || 'N/A'}</p>
                  </div>
                  {selectedPaymentDetails.order.amountReceived && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Valor recebido:</span>
                      <p className="font-medium text-gray-900">💵 R${selectedPaymentDetails.order.amountReceived.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedPaymentDetails.order.change && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Troco:</span>
                      <p className="font-medium text-green-600">💚 R${selectedPaymentDetails.order.change.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedPaymentDetails.order.notes && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Observações:</span>
                      <p className="font-medium text-gray-900 italic">"{selectedPaymentDetails.order.notes}"</p>
                    </div>
                  )}
                  {selectedPaymentDetails.order.cancellationReason && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Motivo Cancelamento:</span>
                      <p className="font-medium text-red-600">❌ {selectedPaymentDetails.order.cancellationReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Itens do Pedido
                </h3>
                <div className="space-y-2">
                  {selectedPaymentDetails.order.orderItems?.map((item: any, itemIndex: number) => (
                    <div
                      key={itemIndex}
                      className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.menuItem.image ? 
                            (item.menuItem.image.startsWith('http') ? item.menuItem.image :
                             item.menuItem.image.startsWith('/api/images/') ? item.menuItem.image :
                             item.menuItem.image.startsWith('/images/') ? item.menuItem.image.replace('/images/', '/api/images/') :
                             `/api/images/uploads/${item.menuItem.image.split('/').pop()}`) 
                            : "/placeholder.jpg"}
                          alt={item.menuItem.name}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                        <div>
                          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                            {item.quantity}x
                          </span>
                          <p className="font-medium text-gray-900 mt-1">{item.menuItem.name}</p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 italic">"{item.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">R$ {item.unitPrice.toFixed(2)}</p>
                        <p className="font-semibold text-gray-900">
                          R$ {(item.quantity * item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-t-4 border-orange-500">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total do Pedido</span>
                  <span className="text-2xl font-bold text-orange-600">R$ {selectedPaymentDetails.order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">
                  Detalhes completos do pagamento e pedido
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ID: {selectedPaymentDetails.payment.id} | Cliente: {selectedPaymentDetails.payment.customer}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailsDialog(false)} 
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  ✕ Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
