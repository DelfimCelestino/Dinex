"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptProps {
  orderNumber: string;
  items: ReceiptItem[];
  total: number;
  table?: string;
  area?: string;
  isDelivery?: boolean;
  date: Date;
  paymentMethod: string;
  customerName?: string;
  amountReceived?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Receipt({
  orderNumber,
  items,
  total,
  table,
  area,
  isDelivery,
  date,
  paymentMethod,
  customerName,
  amountReceived,
  isOpen,
  onClose,
}: ReceiptProps) {
  const [companySettings, setCompanySettings] = useState<any>(null);

  // Carregar configurações da empresa
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const response = await fetch('/api/company-settings');
        if (response.ok) {
          const settings = await response.json();
          setCompanySettings(settings);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações da empresa:', error);
      }
    };

    fetchCompanySettings();
  }, []);
  const handlePrint = () => {
    // Criar um elemento temporário para impressão
    const printElement = document.createElement('div');
    printElement.innerHTML = `
      <div style="
        font-family: monospace; 
        font-size: 14px; 
        max-width: 300px; 
        margin: 0 auto; 
        background: white;
        padding: 16px;
      ">
        <div style="text-align: center; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 16px;">
          <div style="font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">🍽️ ${companySettings?.name || 'Restaurante'}</div>
          <p style="margin: 4px 0;">${companySettings?.location || 'Localização não configurada'}</p>
          <p style="margin: 4px 0;">Tel: ${companySettings?.phone || 'Telefone não configurado'}</p>
                     <p style="margin: 4px 0;">NUIT: ${companySettings?.nuit || 'NUIT não configurado'}</p>
        </div>

        <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Pedido: <strong>${orderNumber}</strong></span>
            <span>${format(date, "HH:mm")}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Data: ${format(date, "dd/MM/yyyy")}</span>
            <span>${format(date, "EEEE")}</span>
          </div>
          ${customerName ? `<div style="display: flex; justify-content: space-between; margin: 4px 0;"><span>Cliente: ${customerName}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>${isDelivery ? 'Para Levar' : `Mesa: ${table || 'N/A'}`}</span>
            <span>${isDelivery ? 'Retirada no Balcão' : `Área: ${area || 'N/A'}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Pagamento: <strong>${{
              'cash': 'Dinheiro',
              'emola': 'E-Mola',
              'mpesa': 'M-Pesa',
              'card': 'Cartão'
            }[paymentMethod] || paymentMethod}</strong></span>
          </div>
          ${amountReceived ? `
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Valor recebido: <strong>${amountReceived.toFixed(2)} MT</strong></span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Troco: <strong>${(amountReceived - total).toFixed(2)} MT</strong></span>
          </div>
          ` : ''}
        </div>

        <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin-bottom: 16px;">
          <div style="display: grid; grid-template-columns: 60px 1fr 80px; gap: 8px; margin-bottom: 8px; font-weight: bold;">
            <div style="text-align: center;">Qtd</div>
            <div style="padding-left: 8px;">Item</div>
            <div style="text-align: right;">Total</div>
          </div>
          ${items.map(item => `
            <div style="display: grid; grid-template-columns: 60px 1fr 80px; gap: 8px; margin: 4px 0;">
              <div style="text-align: center;">${item.quantity}x</div>
              <div style="padding-left: 8px; word-break: break-word;">${item.name}</div>
              <div style="text-align: right;">${(item.price * item.quantity).toFixed(2)} MT</div>
            </div>
          `).join('')}
        </div>

        <div style="text-align: right; margin-bottom: 16px; font-weight: bold; font-size: 16px; border-top: 2px solid #000; padding-top: 8px;">
          Total: ${total.toFixed(2)} MT
        </div>

        <div style="text-align: center; margin-top: 16px; padding-top: 16px; border-top: 1px dashed #000; font-size: 13px;">
          <p style="margin: 4px 0; font-weight: bold;">Obrigado pela preferência!</p>
          <p style="margin: 4px 0;">Volte sempre! 🍽️</p>
          <p style="margin: 8px 0; font-size: 11px;">Este documento é um comprovante de pagamento</p>
        </div>
      </div>
    `;

    // Adicionar estilos de impressão
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-receipt, #print-receipt * {
          visibility: visible;
        }
        #print-receipt {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);

    // Adicionar o elemento à página
    printElement.id = 'print-receipt';
    document.body.appendChild(printElement);

    // Imprimir
    window.print();

    // Limpar após impressão
    setTimeout(() => {
      document.body.removeChild(printElement);
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownload = () => {
    const paymentMethodText = {
      'cash': 'Dinheiro',
      'emola': 'E-Mola',
      'mpesa': 'M-Pesa',
      'card': 'Cartão'
    }[paymentMethod] || paymentMethod;

         const receiptContent = `
 🍽️ ${companySettings?.name || 'Restaurante'}
 ${companySettings?.location || 'Localização não configurada'}
 Tel: ${companySettings?.phone || 'Telefone não configurado'}
   NUIT: ${companySettings?.nuit || 'NUIT não configurado'}
 
 Pedido: ${orderNumber}
 Data: ${format(date, "dd/MM/yyyy HH:mm")}
 ${customerName ? `Cliente: ${customerName}` : ''}
 ${isDelivery ? 'Para Levar - Retirada no Balcão' : `Mesa: ${table || 'N/A'} - Área: ${area || 'N/A'}`}
 Pagamento: ${paymentMethodText}
 ${amountReceived ? `
 Valor recebido: ${amountReceived.toFixed(2)} MT
 Troco: ${(amountReceived - total).toFixed(2)} MT` : ''}
 
 ${items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)} MT`).join('\n')}
 
 Total: ${total.toFixed(2)} MT
 
 Obrigado pela preferência!
 Volte sempre! 🍽️
     `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-${orderNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-white overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-gray-100">
          <SheetTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🧾 Recibo do Pedido
          </SheetTitle>
          <p className="text-sm text-gray-500">
            {orderNumber} - {format(date, "dd/MM/yyyy HH:mm")}
          </p>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Restaurant Header */}
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <h2 className="text-lg font-bold text-orange-800 mb-2">🍽️ {companySettings?.name || 'Restaurante'}</h2>
            <p className="text-sm text-orange-700">{companySettings?.location || 'Localização não configurada'}</p>
            <p className="text-sm text-orange-700">Tel: {companySettings?.phone || 'Telefone não configurado'}</p>
                         {companySettings?.nuit && (
               <p className="text-sm text-orange-700">NUIT: {companySettings.nuit}</p>
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
                  <p className="font-medium text-gray-900">{orderNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">Data:</span>
                  <p className="font-medium text-gray-900">{format(date, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <span className="text-gray-600">Hora:</span>
                  <p className="font-medium text-gray-900">{format(date, "HH:mm")}</p>
                </div>
                <div>
                  <span className="text-gray-600">Pagamento:</span>
                  <p className="font-medium text-gray-900">
                    {{
                      'cash': '💵 Dinheiro',
                      'emola': '📱 E-Mola',
                      'mpesa': '💳 M-Pesa',
                      'card': '💳 Cartão'
                    }[paymentMethod] || paymentMethod}
                  </p>
                </div>
                                 {customerName && (
                   <div className="col-span-2">
                     <span className="text-gray-600">Cliente:</span>
                     <p className="font-medium text-gray-900">{customerName}</p>
                   </div>
                 )}
                 <div className="col-span-2">
                   <span className="text-gray-600">Local:</span>
                   <p className="font-medium text-gray-900">
                     {isDelivery ? '🛍️ Para Levar - Retirada no Balcão' : `🪑 ${table} - ${area}`}
                   </p>
                 </div>
                 {amountReceived && (
                   <>
                     <div className="col-span-2">
                       <span className="text-gray-600">Valor recebido:</span>
                       <p className="font-medium text-gray-900">💵 {amountReceived.toFixed(2)} MT</p>
                     </div>
                     <div className="col-span-2">
                       <span className="text-gray-600">Troco:</span>
                       <p className="font-medium text-green-600">💚 {(amountReceived - total).toFixed(2)} MT</p>
                     </div>
                   </>
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
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} MT
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border-t-4 border-orange-500">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total do Pedido</span>
              <span className="text-2xl font-bold text-orange-600">{total.toFixed(2)} MT</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 py-3 font-semibold"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar TXT
            </Button>
            
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 font-semibold"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium">
              Obrigado pela preferência! 🍽️
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Este documento é um comprovante de pagamento
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
