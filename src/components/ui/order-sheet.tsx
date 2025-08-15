"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  CheckCircle,
  MapPin,
  Clock,
  Utensils,
  Minus,
  Plus,
} from "lucide-react"
import Image from "next/image"

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: string
  image: string
}

export interface Order {
  id: string
  date: string
  time: string
  customer: string
  items: string
  price: string
  status: string
  statusColor: string
  isDelivery: boolean
  area?: string
  table?: string
  foodItems: OrderItem[]
}

interface OrderSheetProps {
  order: Order
  trigger?: React.ReactNode
  onStatusUpdate?: (orderId: string, newStatus: string) => void
  onCancelOrder?: (orderId: string, reason: string) => void
  onEditOrder?: (order: Order) => void
  onDeleteOrder?: (orderId: string) => void
  showActions?: boolean
}

const cancellationReasons = [
  "Cliente cancelou o pedido",
  "Ingredientes em falta",
  "Problema na cozinha",
  "Erro no pedido",
  "Cliente não compareceu",
]

export function OrderSheet({
  order,
  trigger,
  onStatusUpdate,
  onCancelOrder,
  onEditOrder,
  onDeleteOrder,
  showActions = true,
}: OrderSheetProps) {
  const [orderStatus, setOrderStatus] = useState(order.status)
  const [cancellationReason, setCancellationReason] = useState("")
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleStatusUpdate = () => {
    if (onStatusUpdate) {
      onStatusUpdate(order.id, orderStatus)
    }
  }

  const handleCancelOrder = () => {
    if (onCancelOrder && cancellationReason.trim()) {
      onCancelOrder(order.id, cancellationReason)
      setCancellationReason("")
      setShowCancelDialog(false)
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Eye className="h-4 w-4" />
    </Button>
  )

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          {trigger || defaultTrigger}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl">
              Detalhes do Pedido {order.id}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-8">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Informações do Cliente
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{order.customer}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {order.date} às {order.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Local de Entrega
              </h3>
              {order.isDelivery ? (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Utensils className="h-5 w-5 text-orange-500" />
                  <div>
                    <span className="text-orange-700 font-medium">
                      Para Levar
                    </span>
                    <p className="text-sm text-orange-600">
                      Pedido será retirado no balcão
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-900">
                      {order.area || "Área Principal"}
                    </p>
                    <p className="text-sm text-blue-600">
                      {order.table || "Mesa não especificada"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Food Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Itens do Pedido
              </h3>
              <div className="space-y-3">
                {order.foodItems?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Qtd: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-4 border-t-4 border-orange-500">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total do Pedido
                </span>
                <span className="text-2xl font-bold text-orange-600">
                  {order.price}
                </span>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Ações
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEditOrder && (
                        <DropdownMenuItem onClick={() => onEditOrder(order)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Pedido
                        </DropdownMenuItem>
                      )}
                      {onDeleteOrder && (
                        <DropdownMenuItem onClick={() => onDeleteOrder(order.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar Pedido
                        </DropdownMenuItem>
                      )}
                      {onCancelOrder && (
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                          onClick={() => setShowCancelDialog(true)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          <span className="text-red-600">Cancelar Pedido</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status Update */}
                {onStatusUpdate && (
                  <div className="space-y-3">
                    <Select
                      value={orderStatus}
                      onValueChange={setOrderStatus}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">🆕 Novo</SelectItem>
                        <SelectItem value="Preparing">👨‍🍳 Preparando</SelectItem>
                        <SelectItem value="Ready">✅ Pronto</SelectItem>
                        <SelectItem value="Delivered">🚚 Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
                      onClick={handleStatusUpdate}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Atualização
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Order Dialog */}
      {onCancelOrder && (
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Cancelar Pedido {order.id}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Por favor, informe o motivo do cancelamento deste pedido.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              {/* Quick reasons */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Motivos rápidos:</p>
                <div className="flex flex-wrap gap-2">
                  {cancellationReasons.map((reason) => (
                    <Button
                      key={reason}
                      variant="outline"
                      size="sm"
                      onClick={() => setCancellationReason(reason)}
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
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancellationReason("")}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelOrder}
                disabled={!cancellationReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Cancelamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
