// Export utilities for PDF and Excel

export class ExportService {
  // Generate PDF from HTML content
  static async generatePDF(htmlContent: string, filename: string): Promise<void> {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to generate PDF');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .page-break { page-break-after: always; }
              table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1, h2, h3 { color: #333; }
              .no-print { display: none; }
            }
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { color: #2563eb; font-size: 24px; margin-bottom: 10px; }
            h2 { color: #1e40af; font-size: 20px; margin-top: 30px; margin-bottom: 10px; }
            h3 { color: #1e3a8a; font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
            .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
            .logo { max-width: 200px; margin: 0 auto 20px; }
            .severity-critical { color: #dc2626; font-weight: bold; }
            .severity-high { color: #ea580c; font-weight: bold; }
            .severity-medium { color: #d97706; font-weight: bold; }
            .severity-low { color: #65a30d; font-weight: bold; }
            .severity-info { color: #0891b2; font-weight: bold; }
            .status-compliant { color: #16a34a; }
            .status-partial { color: #d97706; }
            .status-non-compliant { color: #dc2626; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Export data to CSV
  static exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
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
  }

  // Export to Excel (using CSV format with .xlsx extension for compatibility)
  static exportToExcel(data: any[], filename: string): void {
    // For a more sophisticated Excel export, you could use a library like xlsx
    // For now, we'll use CSV with Excel-friendly formatting
    this.exportToCSV(data, filename);
  }

  // Generate VAPT Report PDF
  static async generateVAPTReportPDF(report: any, settings: any): Promise<void> {
    const findingsByseverity = {
      critical: report.findings.filter((f: any) => f.severity === 'critical'),
      high: report.findings.filter((f: any) => f.severity === 'high'),
      medium: report.findings.filter((f: any) => f.severity === 'medium'),
      low: report.findings.filter((f: any) => f.severity === 'low'),
      info: report.findings.filter((f: any) => f.severity === 'info'),
    };

    const htmlContent = `
      <div class="header">
        ${settings?.clientLogo ? `<img src="${settings.clientLogo}" class="logo" alt="Client Logo" />` : ''}
        <h1>Vulnerability Assessment and Penetration Testing Report</h1>
        <p><strong>Client:</strong> ${report.clientName}</p>
        <p><strong>Report Date:</strong> ${new Date(report.createdAt).toLocaleDateString()}</p>
      </div>

      <h2>Executive Summary</h2>
      <p>${report.summary || 'No summary provided.'}</p>

      <h2>Findings Overview</h2>
      <table>
        <tr>
          <th>Severity</th>
          <th>Count</th>
        </tr>
        <tr>
          <td class="severity-critical">Critical</td>
          <td>${findingsByeverity.critical.length}</td>
        </tr>
        <tr>
          <td class="severity-high">High</td>
          <td>${findingsByeverity.high.length}</td>
        </tr>
        <tr>
          <td class="severity-medium">Medium</td>
          <td>${findingsByeverity.medium.length}</td>
        </tr>
        <tr>
          <td class="severity-low">Low</td>
          <td>${findingsByeverity.low.length}</td>
        </tr>
        <tr>
          <td class="severity-info">Informational</td>
          <td>${findingsByeverity.info.length}</td>
        </tr>
      </table>

      <div class="page-break"></div>

      <h2>Detailed Findings</h2>
      ${report.findings.map((finding: any, index: number) => `
        <div style="margin-bottom: 30px;">
          <h3>${index + 1}. ${finding.title}</h3>
          <p><strong>Severity:</strong> <span class="severity-${finding.severity}">${finding.severity.toUpperCase()}</span></p>
          <p><strong>CVSS Score:</strong> ${finding.cvss || 'N/A'}</p>
          
          <p><strong>Description:</strong></p>
          <p>${finding.description || 'No description provided.'}</p>
          
          <p><strong>Evidence:</strong></p>
          <p>${finding.evidence || 'No evidence provided.'}</p>
          
          <p><strong>Remediation:</strong></p>
          <p>${finding.remediation || 'No remediation provided.'}</p>
        </div>
        ${index < report.findings.length - 1 ? '<div class="page-break"></div>' : ''}
      `).join('')}
    `;

    await this.generatePDF(htmlContent, `VAPT_Report_${report.clientName.replace(/\s+/g, '_')}`);
  }

  // Generate Compliance Report PDF
  static async generateComplianceReportPDF(framework: string, controls: any[], settings: any): Promise<void> {
    const compliant = controls.filter(c => c.status === 'compliant').length;
    const partial = controls.filter(c => c.status === 'partial').length;
    const nonCompliant = controls.filter(c => c.status === 'non-compliant').length;
    const notApplicable = controls.filter(c => c.status === 'not-applicable').length;
    const total = controls.length;
    const complianceRate = ((compliant / total) * 100).toFixed(1);

    const htmlContent = `
      <div class="header">
        ${settings?.clientLogo ? `<img src="${settings.clientLogo}" class="logo" alt="Client Logo" />` : ''}
        <h1>${framework} Compliance Report</h1>
        <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <h2>Compliance Overview</h2>
      <table>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
        <tr>
          <td class="status-compliant">Compliant</td>
          <td>${compliant}</td>
          <td>${((compliant / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td class="status-partial">Partially Compliant</td>
          <td>${partial}</td>
          <td>${((partial / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td class="status-non-compliant">Non-Compliant</td>
          <td>${nonCompliant}</td>
          <td>${((nonCompliant / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td>Not Applicable</td>
          <td>${notApplicable}</td>
          <td>${((notApplicable / total) * 100).toFixed(1)}%</td>
        </tr>
        <tr>
          <td><strong>Total Controls</strong></td>
          <td><strong>${total}</strong></td>
          <td><strong>${complianceRate}% Compliant</strong></td>
        </tr>
      </table>

      <div class="page-break"></div>

      <h2>Control Details</h2>
      <table>
        <tr>
          <th>Control ID</th>
          <th>Title</th>
          <th>Status</th>
          <th>Notes</th>
        </tr>
        ${controls.map(control => `
          <tr>
            <td>${control.controlId}</td>
            <td>${control.title}</td>
            <td class="status-${control.status}">${control.status.toUpperCase()}</td>
            <td>${control.notes || '-'}</td>
          </tr>
        `).join('')}
      </table>
    `;

    await this.generatePDF(htmlContent, `${framework.replace(/\s+/g, '_')}_Compliance_Report`);
  }
}
