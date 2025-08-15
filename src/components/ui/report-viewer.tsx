"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ReportData } from "@/lib/report-utils";

interface ReportViewerProps {
  reportData: ReportData;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportViewer({
  reportData,
  isOpen,
  onClose,
}: ReportViewerProps) {
  const handlePrint = () => {
    // Criar um elemento temporário para impressão
    const printElement = document.createElement('div');
    printElement.innerHTML = `
      <div style="
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 20px;
        color: #1f2937;
      ">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
          <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #f97316;">🍽️ Dinex ERP</h1>
          <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #1f2937;">${reportData.title}</p>
          ${reportData.subtitle ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">${reportData.subtitle}</p>` : ''}
          ${reportData.period ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">📅 ${reportData.period}</p>` : ''}
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>

        ${reportData.summary ? `
          <div style="margin-bottom: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1e293b;">📊 Resumo Executivo</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              ${reportData.summary.map(item => `
                <div style="text-align: center; background: white; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
                  <h3 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #f97316;">${item.value}</h3>
                  <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #475569;">${item.label}</p>
                  ${item.description ? `<p style="margin: 0; font-size: 12px; color: #64748b;">${item.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${reportData.data && reportData.data.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1e293b;">📋 Dados Detalhados</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f8fafc;">
                  ${Object.keys(reportData.data[0] || {}).map(key => 
                    `<th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #1e293b;">${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
                  ).join('')}
                </tr>
              </thead>
              <tbody>
                ${reportData.data.map((row, index) => `
                  <tr style="${index % 2 === 0 ? 'background: white;' : 'background: #f8fafc;'}">
                    ${Object.values(row).map(value => `<td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${value}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p style="margin: 4px 0; font-weight: 600; color: #f97316;">🍽️ Dinex ERP</p>
          <p style="margin: 4px 0;">Relatório gerado automaticamente pelo sistema de gestão</p>
          <p style="margin: 4px 0;">© ${new Date().getFullYear()} Dinex ERP. Todos os direitos reservados.</p>
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
        #print-report, #print-report * {
          visibility: visible;
        }
        #print-report {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);

    // Adicionar o elemento à página
    printElement.id = 'print-report';
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
    const reportContent = `
🍽️ Dinex ERP
${reportData.title}
${reportData.subtitle ? reportData.subtitle : ''}
${reportData.period ? `Período: ${reportData.period}` : ''}
Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}

${reportData.summary ? `
RESUMO EXECUTIVO:
${reportData.summary.map(item => `${item.label}: ${item.value}${item.description ? ` (${item.description})` : ''}`).join('\n')}
` : ''}

${reportData.data && reportData.data.length > 0 ? `
DADOS DETALHADOS:
${Object.keys(reportData.data[0] || {}).join(' | ')}
${reportData.data.map(row => Object.values(row).join(' | ')).join('\n')}
` : ''}

© ${new Date().getFullYear()} Dinex ERP. Todos os direitos reservados.
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-4xl bg-white overflow-y-auto p-6">
        <SheetHeader className="pb-4 border-b border-gray-200">
          <SheetTitle className="text-xl font-semibold text-gray-900">
            {reportData.title}
          </SheetTitle>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('pt-BR')}</p>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Report Header */}
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{reportData.title}</h2>
            {reportData.subtitle && (
              <p className="text-sm text-gray-600 mb-2">{reportData.subtitle}</p>
            )}
            {reportData.period && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium text-gray-700 border border-gray-200 bg-gray-50">
                <span>Período:</span>
                {reportData.period}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>

          {/* Summary Section */}
          {reportData.summary && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Resumo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {reportData.summary.map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-md p-3 text-center">
                    <div className="text-xl font-semibold text-gray-900 mb-1">{item.value}</div>
                    <div className="text-xs font-medium text-gray-600">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Section */}
          {reportData.data && reportData.data.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Dados Detalhados</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(reportData.data[0] || {}).map((key, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.data.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={`${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                        >
                          {Object.values(row).map((value, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                            >
                              {typeof value === 'string'
                                ? (value.includes('$')
                                  ? <span className="font-medium text-gray-900">{value}</span>
                                  : value)
                                : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar TXT
            </Button>
            
            <Button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Relatório gerado automaticamente pelo sistema de gestão
            </p>
            <p className="text-xs text-gray-500 mt-1">
              © {new Date().getFullYear()} Dinex ERP. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
