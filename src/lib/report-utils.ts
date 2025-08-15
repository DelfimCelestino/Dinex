export interface ReportData {
  title: string;
  subtitle?: string;
  period?: string;
  summary?: Array<{
    label: string;
    value: string | number;
    description?: string;
  }>;
  data?: any[];
  footer?: string;
}

export const generatePrintableReport = (reportData: ReportData) => {
  const dataKeys = Array.isArray(reportData.data) && reportData.data.length > 0
    ? Object.keys(reportData.data[0])
    : [];

  const reportContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportData.title} - ${new Date().toLocaleDateString('pt-BR')}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            margin: 0;
            padding: 32px;
            color: #111827;
            background: #ffffff;
            font-size: 14px;
            line-height: 1.6;
          }
          .container { max-width: 1000px; margin: 0 auto; }
          .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 600; color: #111827; letter-spacing: -0.01em; }
          .muted { color: #6b7280; font-size: 13px; margin: 2px 0; }
          .pill { display: inline-block; padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; font-size: 12px; color: #374151; }
          .section-title { font-size: 13px; font-weight: 600; color: #111827; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: .04em; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table td { padding: 8px 10px; border-bottom: 1px solid #eef0f2; font-size: 13px; }
          .summary-table .s-label { color: #6b7280; width: 50%; }
          .summary-table .s-value { color: #111827; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
          .summary-table .s-desc td { font-size: 12px; color: #9ca3af; padding-top: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
          thead th { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
          tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; color: #111827; }
          tbody td.numeric { text-align: right; font-variant-numeric: tabular-nums; }
          tr:nth-child(even) td { background: #fafafa; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
          @media print { 
            @page { margin: 16mm 12mm; }
            body { padding: 0; }
            .pill { background: #fff; }
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }
            tr, td, th { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${reportData.title}</h1>
            ${reportData.subtitle ? `<div class=\"muted\">${reportData.subtitle}</div>` : ''}
            ${reportData.period ? `<div class=\"muted\">Período: ${reportData.period}</div>` : ''}
            <div class="muted">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>

          ${reportData.summary ? `
            <div>
              <div class="section-title">Resumo</div>
              <table class="summary-table">
                <tbody>
                  ${reportData.summary.map(item => `
                    <tr>
                      <td class="s-label">${item.label}</td>
                      <td class="s-value">${item.value}</td>
                    </tr>
                    ${item.description ? `<tr class="s-desc"><td colspan="2">${item.description}</td></tr>` : ''}
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          ${reportData.data && reportData.data.length > 0 ? `
            <div>
              <div class="section-title">Dados Detalhados</div>
              <table>
                <thead>
                  <tr>
                    ${dataKeys.map(key => 
                      `<th>${key.charAt(0).toUpperCase() + key.slice(1)}</th>`
                    ).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${reportData.data.map(row => `
                    <tr>
                      ${dataKeys.map(key => {
                        const value = (row as any)[key];
                        const isNumeric = typeof value === 'number' || (typeof value === 'string' && /[\d\s$€£.,%-]+/.test(value));
                        return '<td class="' + (isNumeric ? 'numeric' : '') + '\">' + (value ?? '') + '</td>';
                      }).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="footer">
            © ${new Date().getFullYear()} Melt Restaurant — Relatório gerado automaticamente
          </div>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(reportContent);
    printWindow.document.close();
    
    // Aguarda o conteúdo carregar e então imprime
    printWindow.onload = () => {
      if (printWindow) {
        printWindow.print();
        printWindow.close();
      }
    };
  }
};

export const downloadCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
