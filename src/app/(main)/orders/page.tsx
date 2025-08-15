"use client";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Receipt } from "@/components/ui/receipt";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Download,
  TrendingUp,
  ShoppingBag,
  Utensils,
  CheckCircle,
  Eye,
  MoreHorizontal,

  X,
  Clock,
  MapPin,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";

import { toast } from "sonner";

// Função para tocar som de doorbell
const playDoorbellSound = () => {
  try {
    const audio = new Audio("/sound/doorbel.mp3");
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Doorbell sound play failed:", e));
  } catch (error) {
    console.log("Doorbell sound creation failed:", error);
  }
};

// Função para tocar som de pagamento
const playPaymentSound = () => {
  try {
    const audio = new Audio("/sound/coins.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Payment sound play failed:", e));
  } catch (error) {
    console.log("Payment sound creation failed:", error);
  }
};

// Define Order interface based on our database schema
interface Order {
  id: string;
  orderNumber: string;
  customerName: string | null;
  isDelivery: boolean;
  area: {
    id: string;
    name: string;
  } | null;
  table: {
    id: string;
    number: string;
    name: string;
  } | null;
  status: 'NEW' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  paymentMethod: {
    id: string;
    name: string;
    icon: string;
  } | null;
  amountReceived: number | null;
  change: number | null;
  isPaid: boolean;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes: string | null;
    menuItem: {
      id: string;
      name: string;
      description: string | null;
      image: string | null;
      hasStock: boolean;
      stockQuantity: number | null;
      minStockAlert: number | null;
    };
  }>;
}

const cancellationReasons = [
  "Cliente cancelou o pedido",
  "Ingredientes em falta",
  "Problema na cozinha",
  "Erro no pedido",
  "Cliente não compareceu",
];



export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showKitchenDialog, setShowKitchenDialog] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [generateReceipt, setGenerateReceipt] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilters, setStatusFilters] = useState([
    { label: "Todos", value: "all", count: 0 },
    { label: "Novos", value: "new", count: 0 },
    { label: "Preparando", value: "preparing", count: 0 },
    { label: "Prontos", value: "ready", count: 0 },
    { label: "Entregues", value: "delivered", count: 0 },
    { label: "Cancelados", value: "cancelled", count: 0 },
  ]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("today"); // all, today, yesterday, custom
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(100);

  // Função helper para verificar estoque disponível
  const checkStockAvailability = async (menuItemId: string, requestedQuantity: number) => {
    try {
      const response = await fetch(`/api/menu-items/${menuItemId}`);
      if (response.ok) {
        const menuItem = await response.json();
        if (menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
          if (menuItem.stockQuantity < requestedQuantity) {
            return {
              available: false,
              availableStock: menuItem.stockQuantity,
              message: `Só há ${menuItem.stockQuantity} unidade(s) disponível(is) de ${menuItem.name}`
            };
          }
        }
        return { available: true };
      }
    } catch (error) {
      console.error("Erro ao verificar estoque:", error);
    }
    return { available: true }; // Se não conseguir verificar, permitir
  };

  // Carregar pedidos do banco
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/orders");
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

    fetchOrders();
  }, []);

  // Carregar métodos de pagamento
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch('/api/payment-methods');
        if (res.ok) {
          const data = await res.json();
          setPaymentMethods(data);
        }
      } catch {}
    };
    fetchMethods();
  }, []);

  // Atualizar contadores dos filtros
  useEffect(() => {
    const updateFilterCounts = () => {
      const counts = {
        all: orders.length,
        new: orders.filter(o => o.status === 'NEW').length,
        preparing: orders.filter(o => o.status === 'PREPARING').length,
        ready: orders.filter(o => o.status === 'READY').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      };

      setStatusFilters(prev => prev.map((filter: any) => ({
        ...filter,
        count: counts[filter.value as keyof typeof counts] || 0
      })));
    };

    updateFilterCounts();
  }, [orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toUpperCase() }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        
        // Tocar som de doorbell se o status for alterado para PREPARING
        if (newStatus.toUpperCase() === 'PREPARING') {
          playDoorbellSound();
        }
        
        toast.success(`Status do pedido atualizado para ${newStatus}`);
      } else {
        toast.error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      // Encontrar o pedido para restaurar o estoque
      const orderToCancel = orders.find(o => o.id === orderId);
      if (orderToCancel) {
        // Restaurar estoque para todos os itens do pedido
        for (const orderItem of orderToCancel.orderItems) {
          try {
            const stockResponse = await fetch(`/api/menu-items/${orderItem.menuItem.id}/stock`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                action: "restore", 
                quantity: orderItem.quantity 
              }),
            });
            
            if (!stockResponse.ok) {
              console.error("Erro ao restaurar estoque:", await stockResponse.text());
            }
          } catch (stockError) {
            console.error("Erro ao restaurar estoque:", stockError);
          }
        }
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "CANCELLED",
          cancellationReason: reason || "Pedido cancelado"
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        toast.success("Pedido cancelado com sucesso");
        setCancellationReason("");
      } else {
        toast.error("Erro ao cancelar pedido");
      }
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      toast.error("Erro ao cancelar pedido");
    }
  };

  const handlePayNow = (order: Order) => {
    setSelectedOrder(order);
    setShowPaymentDialog(true);
  };



  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;
    // exigir montante para todos os métodos
    if (!selectedPaymentMethodId) return;
      const received = parseFloat(amountReceived);
    const total = selectedOrder.totalAmount || 0;
    if (!amountReceived || Number.isNaN(received) || received < total) {
      const missing = total - (Number.isNaN(received) ? 0 : received);
        toast("Valor insuficiente!", {
          description: `Faltam ${missing.toFixed(2)} MT para completar o pagamento`,
          duration: 4000,
          position: "top-left",
        });
        return;
    }

    try {
      const payload = {
        items: selectedOrder.orderItems.map((oi) => ({ id: oi.id, quantity: oi.quantity, unitPrice: oi.unitPrice })),
        paymentMethodId: selectedPaymentMethodId,
        amountReceived: received,
        isPaid: true,
        isCompleted: true,
        status: 'DELIVERED',
      };

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        
        // Tocar som de pagamento
        playPaymentSound();
        
        toast("Pagamento confirmado!", {
          description: `Pedido ${updated.orderNumber} foi entregue`,
          duration: 3000,
          position: "top-left",
        });
        setShowPaymentDialog(false);
        setSelectedPaymentMethodId("");
        setAmountReceived("");
        setGenerateReceipt(false);
        setCustomerName("");
        if (generateReceipt) {
          setSelectedOrder(updated);
          setShowReceiptDialog(true);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao confirmar pagamento');
      }
    } catch (e) {
      toast.error('Erro ao confirmar pagamento');
    }
  };

  const handleConfirmKitchen = async () => {
    if (!selectedOrder) return;

    try {
      await handleStatusUpdate(selectedOrder.id, 'PREPARING');
      
      // Tocar som de doorbell
      playDoorbellSound();
      
      toast("Pedido enviado para preparo!", {
        description: `Pedido ${selectedOrder.orderNumber} está sendo preparado`,
        duration: 3000,
        position: "top-left",
      });
      setShowKitchenDialog(false);
    } catch (error) {
      toast.error("Erro ao enviar para preparo");
    }
  };

  const handleCloseReceipt = () => {
    setShowReceiptDialog(false);
    setCustomerName("");
    setSelectedPayment("");
    setAmountReceived("");
    setGenerateReceipt(false);
  };



  // Persist item quantity changes immediately
  const persistOrderItems = async (orderId: string, items: Array<{ id: string; quantity: number; unitPrice: number }>) => {
    try {
      // Encontrar o pedido atual para comparar quantidades
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder) return;

      // Calcular diferenças de quantidade para atualizar estoque
      for (const newItem of items) {
        const currentItem = currentOrder.orderItems.find(oi => oi.id === newItem.id);
        if (currentItem && currentItem.quantity !== newItem.quantity) {
          const quantityDiff = currentItem.quantity - newItem.quantity;
          
          // Se a quantidade foi reduzida, restaurar estoque
          if (quantityDiff > 0) {
            try {
              const stockResponse = await fetch(`/api/menu-items/${currentItem.menuItem.id}/stock`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  action: "restore", 
                  quantity: quantityDiff 
                }),
              });
              
              if (!stockResponse.ok) {
                console.error("Erro ao atualizar estoque:", await stockResponse.text());
              }
            } catch (stockError) {
              console.error("Erro ao atualizar estoque:", stockError);
            }
          }
          // Se a quantidade foi aumentada, verificar e reduzir estoque
          else if (quantityDiff < 0) {
            // Verificar se há estoque suficiente antes de consumir
            try {
              const menuItemResponse = await fetch(`/api/menu-items/${currentItem.menuItem.id}`);
              if (menuItemResponse.ok) {
                const menuItem = await menuItemResponse.json();
                if (menuItem.hasStock && menuItem.stockQuantity !== null && menuItem.stockQuantity !== undefined) {
                  if (menuItem.stockQuantity < Math.abs(quantityDiff)) {
                    toast.error(`Estoque insuficiente para ${menuItem.name}!`, {
                      description: `Só há ${menuItem.stockQuantity} unidade(s) disponível(is), mas foram solicitadas ${Math.abs(quantityDiff)}`,
                      duration: 4000,
                      position: "top-left",
                    });
                    return; // Não continuar se não há estoque suficiente
                  }
                }
              }
            } catch (error) {
              console.error("Erro ao verificar estoque:", error);
            }
            
            try {
              const stockResponse = await fetch(`/api/menu-items/${currentItem.menuItem.id}/stock`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  action: "consume", 
                  quantity: Math.abs(quantityDiff) 
                }),
              });
              
              if (!stockResponse.ok) {
                const error = await stockResponse.json();
                toast.error(`Erro ao atualizar estoque: ${error.error || 'Estoque insuficiente'}`);
                return; // Não continuar se não conseguir atualizar o estoque
              }
            } catch (stockError) {
              console.error("Erro ao atualizar estoque:", stockError);
              toast.error("Erro ao atualizar estoque");
              return;
            }
          }
        }
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        if (selectedOrder && selectedOrder.id === updated.id) {
          setSelectedOrder(updated);
        }
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erro ao atualizar itens do pedido');
      }
    } catch (e) {
      toast.error('Erro ao atualizar itens do pedido');
    }
  };

  // Remove item from order and persist changes
  const removeOrderItem = async (orderId: string, itemId: string, itemName: string) => {
    try {
      // Primeiro, verificar se é o último item
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (!orderToUpdate) return;

      // Verificar se é o último item do pedido
      if (orderToUpdate.orderItems.length <= 1) {
        toast.error("Não é possível remover o último item do pedido!", {
          description: "Um pedido deve ter pelo menos um item. Use 'Cancelar Pedido' se deseja cancelar o pedido completo.",
          duration: 6000,
        });
        return;
      }

      // Encontrar o item que será removido para restaurar o estoque
      const itemToRemove = orderToUpdate.orderItems.find(item => item.id === itemId);
      if (itemToRemove) {
        // Atualizar estoque no banco de dados
        try {
          const stockResponse = await fetch(`/api/menu-items/${itemToRemove.menuItem.id}/stock`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "restore", 
              quantity: itemToRemove.quantity 
            }),
          });
          
          if (!stockResponse.ok) {
            console.error("Erro ao atualizar estoque:", await stockResponse.text());
          }
        } catch (stockError) {
          console.error("Erro ao atualizar estoque:", stockError);
        }
      }

      const newItems = orderToUpdate.orderItems.filter(item => item.id !== itemId);
      const total = newItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);

      // Atualizar o pedido localmente
      const updatedOrder = { ...orderToUpdate, orderItems: newItems, totalAmount: total };
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      
      // Atualizar selectedOrder se estiver selecionado
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }

      // Persistir no banco
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: newItems.map(it => ({ id: it.id, quantity: it.quantity, unitPrice: it.unitPrice })),
          totalAmount: total
        }),
      });

      if (res.ok) {
        toast.success(`${itemName} removido do pedido`);
      } else {
        // Se falhar no banco, reverter o estado local
        setOrders(prev => prev.map(o => o.id === orderId ? orderToUpdate : o));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(orderToUpdate);
        }
        const err = await res.json();
        toast.error(err.error || 'Erro ao remover item do pedido');
      }
    } catch (e) {
      console.error('Erro ao remover item:', e);
      toast.error('Erro ao remover item do pedido');
    }
  };



  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeFilter === "all" || order.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por data
    let matchesDate = true;
    if (dateFilter !== "all") {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // Resetar horas para comparação apenas da data
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      if (dateFilter === "today") {
        matchesDate = orderDateOnly.getTime() === todayOnly.getTime();
      } else if (dateFilter === "yesterday") {
        matchesDate = orderDateOnly.getTime() === yesterdayOnly.getTime();
      }
    }
    
    return matchesStatus && matchesSearch && matchesDate;
  });

  // Paginação
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PREPARING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "READY":
        return "bg-green-100 text-green-800 border-green-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "NEW":
        return "Novo";
      case "PREPARING":
        return "Preparando";
      case "READY":
        return "Pronto";
      case "DELIVERED":
        return "Entregue";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="wrapper">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
              <Skeleton className="h-6 w-80 bg-white/20" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-20 bg-white/20" />
              <Skeleton className="h-10 w-32 bg-white/20" />
            </div>
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

        {/* Filter Tabs Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-24" />
          ))}
        </div>

        {/* Search and Filter Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    {[...Array(8)].map((_, index) => (
                      <th key={index} className="text-left py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-gray-100">
                      {[...Array(8)].map((_, colIndex) => (
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
      </div>
    );
  }

  return (
    <div className="wrapper">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestão de Pedidos</h1>
            <p className="text-emerald-100 text-lg">
              Acompanhe e gerencie todos os pedidos do seu restaurante
            </p>
          </div>
       
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total de Pedidos
                </p>
                <p className="text-3xl font-bold text-blue-900">{filteredOrders.length}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600 mb-1">
                  Novos Pedidos
                </p>
                <p className="text-3xl font-bold text-cyan-900">{filteredOrders.filter(order => order.status === 'NEW').length}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-cyan-500 mr-1" />
                  <span className="text-sm text-cyan-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1">
                  Preparando
                </p>
                <p className="text-3xl font-bold text-yellow-900">{filteredOrders.filter(order => order.status === 'PREPARING').length}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-yellow-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <Utensils className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Entregues
                </p>
                <p className="text-3xl font-bold text-green-900">{filteredOrders.filter(order => order.status === 'DELIVERED').length}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 font-medium">
                    {dateFilter === "today" ? "Hoje" : 
                     dateFilter === "yesterday" ? "Ontem" : 
                     "Todos os Dias"}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeFilter === filter.value
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Date Filter Tabs */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={() => setDateFilter("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            dateFilter === "all"
              ? "bg-orange-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          📅 Todos os Dias
        </button>
        <button
          onClick={() => setDateFilter("today")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            dateFilter === "today"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🌅 Hoje ({new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
        </button>
        <button
          onClick={() => setDateFilter("yesterday")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            dateFilter === "yesterday"
              ? "bg-blue-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          🌙 Ontem ({(new Date(Date.now() - 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})
        </button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-48 border-gray-200">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Pedidos Recentes
          </CardTitle>
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
                    Data & Hora
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Itens
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Local
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Preço
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-100 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-orange-50 hover:shadow-sm`}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                          {order.orderNumber.replace('#', '')}
                        </div>
                       
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-semibold text-sm">
                            {order.customerName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customerName || 'Sem Nome'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-xs">
                            {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {order.orderItems?.length || 0} {order.orderItems?.length === 1 ? 'item' : 'itens'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {order.isDelivery ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Utensils className="w-4 h-4 text-orange-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-orange-700">Para Levar</p>
                            <p className="text-xs text-orange-600">Retirada no balcão</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-blue-900">
                              {order.area?.name || 'Área não definida'}
                            </p>
                            <p className="text-sm text-blue-600">
                              {order.table?.name || 'Mesa não definida'} {order.table?.number && `(${order.table.number})`}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-right">
                        <span className="text-lg font-bold text-orange-600">
                          {order.totalAmount.toFixed(2)} MT
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-xs font-semibold`}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full sm:max-w-lg bg-white overflow-y-auto p-6">
                            {/* Header */}
                            <SheetHeader className="pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                              <SheetTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Pedido {order.orderNumber}
                              </SheetTitle>
                              <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </SheetHeader>

                            <div className="py-4 space-y-6">
                              {/* Customer Info */}
                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                  Informações do Cliente
                                </h3>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                      <span className="text-orange-600 font-semibold text-sm">
                                        {order.customerName?.charAt(0) || '?'}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {order.customerName || 'Sem Nome'}
                                      </p>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                          {new Date(order.createdAt).toLocaleDateString()} às {new Date(order.createdAt).toLocaleTimeString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Location Info */}
                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                  Local de Entrega
                                </h3>
                                {order.isDelivery ? (
                                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                        <Utensils className="w-5 h-5 text-orange-600" />
                                      </div>
                                      <div>
                                        <span className="text-orange-700 font-medium">
                                          Para Levar
                                        </span>
                                        <p className="text-sm text-orange-600">
                                          Pedido será retirado no balcão
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-blue-900">
                                          {order.area?.name || 'Área não definida'}
                                        </p>
                                        <p className="text-sm text-blue-600">
                                          {order.table?.name || 'Mesa não definida'} {order.table?.number && `(${order.table.number})`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Order Notes */}
                              {order.notes && (
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    Observações
                                  </h3>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MessageSquare className="w-3 h-3 text-yellow-600" />
                                      </div>
                                      <p className="text-sm text-yellow-800 font-medium">
                                        {order.notes}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Stock Warnings */}
                              {((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems)?.some(item => 
                                item.menuItem.hasStock && item.menuItem.stockQuantity !== null && item.menuItem.stockQuantity <= 0
                              ) && (
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    ⚠️ Avisos de Estoque
                                  </h3>
                                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-red-600 text-xs font-bold">!</span>
                                      </div>
                                      <div className="text-sm text-red-800">
                                        <p className="font-medium mb-1">Alguns itens estão sem estoque:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems)?.filter(item => 
                                            item.menuItem.hasStock && item.menuItem.stockQuantity !== null && item.menuItem.stockQuantity <= 0
                                          ).map(item => (
                                            <li key={item.id} className="text-red-700">
                                              {item.menuItem.name} - {item.quantity} unidade(s) solicitada(s)
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Low Stock Warnings */}
                              {((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems)?.some(item => 
                                item.menuItem.hasStock && 
                                item.menuItem.stockQuantity !== null && 
                                item.menuItem.stockQuantity > 0 && 
                                item.menuItem.stockQuantity <= (item.menuItem.minStockAlert || 0)
                              ) && (
                                <div className="space-y-3">
                                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                    ⚠️ Estoque Baixo
                                  </h3>
                                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-yellow-600 text-xs font-bold">!</span>
                                      </div>
                                      <div className="text-sm text-yellow-800">
                                        <p className="font-medium mb-1">Alguns itens estão com estoque baixo:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          {((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems)?.filter(item => 
                                            item.menuItem.hasStock && 
                                            item.menuItem.stockQuantity !== null && 
                                            item.menuItem.stockQuantity > 0 && 
                                            item.menuItem.stockQuantity <= (item.menuItem.minStockAlert || 0)
                                          ).map(item => (
                                            <li key={item.id} className="text-yellow-700">
                                              {item.menuItem.name} - {item.menuItem.stockQuantity} unidade(s) restante(s)
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Food Items - Editable */}
                              <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                  Itens do Pedido
                                </h3>
                                
                                {/* Aviso quando há apenas um item */}
                                {(selectedOrder && selectedOrder.id === order.id ? selectedOrder.orderItems : order.orderItems)?.length === 1 && (
                                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                      <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="text-yellow-600 text-xs font-bold">!</span>
                                      </div>
                                      <span className="text-sm font-medium">
                                        Este pedido tem apenas um item. Para cancelar o pedido, use a opção "Cancelar Pedido" nas ações abaixo.
                                      </span>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {(selectedOrder && selectedOrder.id === order.id ? selectedOrder.orderItems : order.orderItems)?.map((item, index) => (
                                    <div
                                      key={item.id}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                                        item.menuItem.hasStock && item.menuItem.stockQuantity !== null && item.menuItem.stockQuantity <= 0
                                          ? "bg-red-50 border-red-200 hover:bg-red-100"
                                          : item.menuItem.hasStock && item.menuItem.stockQuantity !== null && item.menuItem.stockQuantity <= (item.menuItem.minStockAlert || 0)
                                          ? "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                                          : "bg-gray-50 border-gray-100 hover:bg-gray-100"
                                      }`}
                                    >
                                      <img
                                        src={item.menuItem.image ? 
                                          (item.menuItem.image.startsWith('http') ? item.menuItem.image :
                                           item.menuItem.image.startsWith('/api/images/') ? item.menuItem.image :
                                           item.menuItem.image.startsWith('/images/') ? item.menuItem.image.replace('/images/', '/api/images/') :
                                           `/api/images/uploads/${item.menuItem.image.split('/').pop()}`) 
                                          : "/placeholder.jpg"}
                                        alt={item.menuItem.name}
                                        className="w-12 h-12 rounded-md object-cover shadow-sm"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = "/placeholder.jpg";
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-medium text-gray-800 text-sm truncate">
                                            {item.menuItem.name}
                                          </h4>
                                          {/* Indicador de estoque */}
                                          {item.menuItem.hasStock && item.menuItem.stockQuantity !== null && (
                                            <div className="flex items-center gap-1">
                                              {item.menuItem.stockQuantity <= 0 ? (
                                                <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                                                  Sem estoque
                                                </Badge>
                                              ) : item.menuItem.stockQuantity <= (item.menuItem.minStockAlert || 0) ? (
                                                <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
                                                  Estoque baixo
                                                </Badge>
                                              ) : (
                                                <Badge className="bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                                  {item.menuItem.stockQuantity} UN
                                                </Badge>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-6 h-6 p-0 hover:bg-gray-200 h-auto"
                                            disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                            onClick={() => {
                                              const newItems = [...(((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems) || [])];
                                              if (newItems[index].quantity > 1) {
                                                newItems[index].quantity -= 1;
                                                const total = newItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                                if (selectedOrder && selectedOrder.id === order.id) {
                                                  setSelectedOrder({ ...selectedOrder, orderItems: newItems, totalAmount: total });
                                                } else {
                                                  setSelectedOrder({ ...order, orderItems: newItems as any, totalAmount: total } as any);
                                                }
                                                // persist
                                                persistOrderItems(order.id, newItems.map(it => ({ id: it.id, quantity: it.quantity, unitPrice: it.unitPrice })));
                                              }
                                            }}
                                          >
                                            <Minus className="w-3 h-3" />
                                          </Button>
                                          <span className="w-8 text-center text-xs font-medium">
                                            {item.quantity}
                                          </span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-6 h-6 p-0 hover:bg-gray-200 h-auto"
                                            disabled={
                                              order.status === 'DELIVERED' || 
                                              order.status === 'CANCELLED' ||
                                              (item.menuItem.hasStock && 
                                               item.menuItem.stockQuantity !== null && 
                                               item.menuItem.stockQuantity <= item.quantity)
                                            }
                                            title={
                                              item.menuItem.hasStock && 
                                              item.menuItem.stockQuantity !== null && 
                                              item.menuItem.stockQuantity <= item.quantity
                                                ? `Estoque insuficiente: só há ${item.menuItem.stockQuantity} unidade(s) disponível(is)`
                                                : "Aumentar quantidade"
                                            }
                                            onClick={async () => {
                                              const newItems = [...(((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.orderItems : order.orderItems) || [])];
                                              const newQuantity = newItems[index].quantity + 1;
                                              
                                              // Verificar estoque antes de aumentar
                                              const stockCheck = await checkStockAvailability(item.menuItem.id, newQuantity);
                                              if (!stockCheck.available) {
                                                toast.error("Estoque insuficiente!", {
                                                  description: stockCheck.message,
                                                  duration: 3000,
                                                  position: "top-left",
                                                });
                                                return;
                                              }
                                              
                                              newItems[index].quantity = newQuantity;
                                              const total = newItems.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
                                              if (selectedOrder && selectedOrder.id === order.id) {
                                                setSelectedOrder({ ...selectedOrder, orderItems: newItems, totalAmount: total });
                                              } else {
                                                setSelectedOrder({ ...order, orderItems: newItems as any, totalAmount: total } as any);
                                              }
                                              // persist
                                              persistOrderItems(order.id, newItems.map(it => ({ id: it.id, quantity: it.quantity, unitPrice: it.unitPrice })));
                                            }}
                                          >
                                            <Plus className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900 text-sm">
                                          {item.unitPrice.toFixed(2)} MT
                                        </p>
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2 py-1 h-auto mt-1"
                                              disabled={
                                                order.status === 'DELIVERED' || 
                                                order.status === 'CANCELLED' ||
                                                order.orderItems.length <= 1
                                              }
                                              title={
                                                order.orderItems.length <= 1 
                                                  ? "Não é possível remover o último item. Cancele o pedido em vez disso." 
                                                  : "Remover item do pedido"
                                              }
                                            >
                                              ×
                                            </Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Remover Item do Pedido</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                {order.orderItems.length <= 1 ? (
                                                  <>
                                                    <strong>Não é possível remover o último item do pedido!</strong>
                                                    <br /><br />
                                                    Se você deseja cancelar este pedido, use a opção "Cancelar Pedido" nas ações do pedido.
                                                  </>
                                                ) : (
                                                  <>
                                                    Tem certeza que deseja remover "{item.menuItem.name}" do pedido {order.orderNumber}?
                                                    <br /><br />
                                                    Esta ação não pode ser desfeita.
                                                  </>
                                                )}
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                              {order.orderItems.length > 1 && (
                                                <AlertDialogAction
                                                  onClick={() => removeOrderItem(order.id, item.id, item.menuItem.name)}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Remover Item
                                                </AlertDialogAction>
                                                )}
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary */}
                              <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.totalAmount : order.totalAmount).toFixed(2)} MT</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Taxa</span>
                                    <span className="font-medium">MT0,00</span>
                                  </div>
                                  <div className="border-t border-orange-200 pt-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-gray-800">Total</span>
                                      <span className="text-xl font-bold text-orange-600">
                                            {((selectedOrder && selectedOrder.id === order.id) ? selectedOrder.totalAmount : order.totalAmount).toFixed(2)} MT
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>



                              {/* Action Buttons */}
                              <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                  Ações do Pedido
                                </h3>
                                
                                {/* Status Update Buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                      {order.status === 'NEW' && (
                                  <Button
                                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                      onClick={() => {
                                        handleStatusUpdate(order.id, 'PREPARING');
                                        // Tocar som de doorbell
                                        playDoorbellSound();
                                      }}
                                  >
                                      <Utensils className="h-4 w-4 mr-2" />
                                      Enviar para Preparo
                                  </Button>
                                  )}
                                  
                                      {order.status === 'PREPARING' && (
                                    <Button
                                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                      onClick={() => handleStatusUpdate(order.id, 'READY')}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marcar como Pronto
                                    </Button>
                                  )}
                                  
                                      {order.status === 'READY' && (
                                        <Button
                                          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                          onClick={() => handlePayNow(order)}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Marcar como Entregue
                                        </Button>
                                      )}
                                </div>

                                  <div className="grid grid-cols-1 gap-3">
                                  <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                                    onClick={() => handlePayNow(order)}
                                    disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Finalizar Pedido
                                  </Button>
                                  {order.status === 'DELIVERED' && (
                                    <Button
                                      variant="outline"
                                      className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setSelectedPayment(order.paymentMethod?.name || '');
                                        setCustomerName(order.customerName || '');
                                        setAmountReceived(order.amountReceived ? String(order.amountReceived) : '');
                                        setShowReceiptDialog(true);
                                      }}
                                    >
                                      Imprimir Recibo
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* Só mostrar opção de cancelar se o pedido NÃO foi entregue E NÃO foi cancelado */}
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    <span className="text-red-600">
                                      Cancelar Pedido
                                    </span>
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancelar Pedido {order.orderNumber}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Por favor, informe o motivo do cancelamento
                                      deste pedido.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <div className="space-y-4">
                                    {/* Quick reasons */}
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        Motivos rápidos:
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {cancellationReasons.map((reason) => (
                                          <Button
                                            key={reason}
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              setCancellationReason(reason)
                                            }
                                            className={
                                              cancellationReason === reason
                                                ? "bg-orange-50 border-orange-200"
                                                : ""
                                            }
                                          >
                                            {reason}
                                          </Button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Custom reason */}
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium">
                                        Ou escreva um motivo personalizado:
                                      </p>
                                      <Textarea
                                        placeholder="Digite o motivo do cancelamento..."
                                        value={cancellationReason}
                                        onChange={(e) =>
                                          setCancellationReason(e.target.value)
                                        }
                                        className="min-h-[80px]"
                                      />
                                    </div>
                                  </div>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={() => setCancellationReason("")}
                                    >
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCancelOrder(
                                          order.id,
                                          cancellationReason
                                        )
                                      }
                                      disabled={!cancellationReason.trim()}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Confirmar Cancelamento
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            {/* Mostrar mensagem informativa se o pedido foi entregue ou cancelado */}
                            {order.status === 'DELIVERED' && (
                              <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span>Pedido já entregue</span>
                              </DropdownMenuItem>
                            )}
                            
                            {order.status === 'CANCELLED' && (
                              <DropdownMenuItem disabled className="text-gray-400 cursor-not-allowed">
                                <X className="h-4 w-4 mr-2" />
                                <span>Pedido já cancelado</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length} pedidos
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

      {/* Payment Confirmation Dialog */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar Pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja finalizar este pedido e processar o pagamento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Customer Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Nome do Cliente (opcional)
              </Label>
              <input
                id="customerName"
                type="text"
                placeholder="Digite o nome do cliente..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Payment Methods (from DB) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Método de Pagamento</Label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method:any) => (
                  <div
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 rounded-xl p-4 ${
                      selectedPaymentMethodId === method.id
                        ? "ring-2 ring-orange-500 bg-orange-50 border-orange-200 shadow-lg scale-105"
                        : "hover:scale-105 bg-gray-50 border-gray-200 hover:shadow-lg"
                    }`}
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl mb-2">{method.icon}</div>
                      <p className="text-sm font-semibold">
                        {method.name}
                      </p>
                      {selectedPaymentMethodId === method.id && (
                        <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Received (required for all methods) */}
            {selectedPaymentMethodId && (
              <div className="space-y-2">
                <Label htmlFor="amountReceived" className="text-sm font-medium">
                  Valor Recebido (MT)
                </Label>
                <input
                  id="amountReceived"
                  type="number"
                  step="0.01"
                  min={selectedOrder?.totalAmount || 0}
                  placeholder={`Mínimo: MT${selectedOrder?.totalAmount || '0'}`}
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                {amountReceived && selectedOrder && parseFloat(amountReceived) >= selectedOrder.totalAmount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      💚 <strong>Troco:</strong> MT{(parseFloat(amountReceived) - selectedOrder.totalAmount).toFixed(2)}
                    </p>
                  </div>
                )}
                {amountReceived && selectedOrder && parseFloat(amountReceived) < selectedOrder.totalAmount && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">
                      ❌ <strong>Faltam:</strong> MT{(selectedOrder.totalAmount - parseFloat(amountReceived)).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Receipt Generation - Optional */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  id="generateReceipt"
                  type="checkbox"
                  checked={generateReceipt}
                  onChange={(e) => setGenerateReceipt(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <Label htmlFor="generateReceipt" className="text-sm font-medium">
                  🧾 Gerar recibo para o cliente
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Opcional - O recibo pode ser impresso ou baixado
              </p>
            </div>
            
            {/* Payment Summary */}
            {selectedOrder && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total a pagar:</span>
                  <span className="font-semibold text-gray-900">MT${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
                {selectedPayment === 'cash' && amountReceived && (
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Valor recebido:</span>
                    <span className="font-semibold text-gray-900">MT${amountReceived}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPayment}
              disabled={!selectedPaymentMethodId || !amountReceived || parseFloat(amountReceived) < (selectedOrder?.totalAmount || 0)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!selectedPaymentMethodId || !amountReceived || !selectedOrder || parseFloat(amountReceived) >= (selectedOrder.totalAmount || 0)
                ? 'Confirmar Pagamento'
                : `Faltam MT${((selectedOrder.totalAmount || 0) - parseFloat(amountReceived)).toFixed(2)}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kitchen Confirmation Dialog */}
      <AlertDialog open={showKitchenDialog} onOpenChange={setShowKitchenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enviar para Preparo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja enviar este pedido para preparo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Order Summary */}
            {selectedOrder && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Pedido:</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Cliente:</span>
                  <span className="font-semibold text-gray-900">{selectedOrder.customerName || 'Sem Nome'}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Valor total:</span>
                  <span className="font-semibold text-gray-900">MT${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleConfirmKitchen();
                // Tocar som de doorbell
                playDoorbellSound();
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              Enviar para Preparo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Receipt Component */}
      {selectedOrder && (
        <Receipt
          orderNumber={selectedOrder.orderNumber}
          items={selectedOrder.orderItems?.map((item: any) => ({
            name: item.menuItem.name,
            quantity: item.quantity,
            price: item.unitPrice
          })) || []}
          total={selectedOrder.totalAmount}
          table={selectedOrder.table?.number || undefined}
          area={selectedOrder.area?.name || undefined}
          isDelivery={selectedOrder.isDelivery}
          date={new Date()}
          paymentMethod={selectedPayment}
          customerName={customerName}
          amountReceived={selectedPayment === 'cash' ? parseFloat(amountReceived) : undefined}
          isOpen={showReceiptDialog}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
}
