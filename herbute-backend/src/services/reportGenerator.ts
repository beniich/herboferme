// backend/services/reportGenerator.ts
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportGenerator {
  private exportsDir: string;

  constructor() {
    this.exportsDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  /**
   * Generate Balance Sheet PDF
   */
  async generateBalanceSheetPDF(data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `balance_sheet_${Date.now()}.pdf`;
      const filepath = path.join(this.exportsDir, filename);

      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // Header
      doc
        .fontSize(20)
        .text('Bilan Comptable', { align: 'center' })
        .moveDown();

      doc
        .fontSize(12)
        .text(`Exercice: ${data.fiscalYear}`, { align: 'center' })
        .text(`Domaine: ${data.domainName || 'Mon Domaine'}`, { align: 'center' })
        .moveDown(2);

      // Table Header
      doc
        .fontSize(10)
        .text('Compte', 50, 200, { width: 100 })
        .text('Libellé', 150, 200, { width: 150 })
        .text('Débit', 300, 200, { width: 100, align: 'right' })
        .text('Crédit', 400, 200, { width: 100, align: 'right' })
        .text('Solde', 500, 200, { width: 100, align: 'right' });

      // Line
      doc.moveTo(50, 215).lineTo(550, 215).stroke();

      // Data rows
      let y = 225;
      data.entries.forEach((entry: any) => {
        if (y > 750) {
            doc.addPage();
            y = 50;
        }
        doc
          .fontSize(9)
          .text(entry.accountNumber, 50, y, { width: 100 })
          .text(entry.accountName, 150, y, { width: 150 })
          .text(entry.debit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 300, y, { width: 100, align: 'right' })
          .text(entry.credit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 400, y, { width: 100, align: 'right' })
          .text(entry.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 500, y, { width: 100, align: 'right' });

        y += 20;
      });

      // Totals
      doc.moveTo(50, y).lineTo(550, y).stroke();
      y += 10;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTAL', 50, y)
        .text(data.totalDebit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 300, y, { width: 100, align: 'right' })
        .text(data.totalCredit.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 400, y, { width: 100, align: 'right' })
        .text(data.finalBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 }), 500, y, { width: 100, align: 'right' });

      // Footer
      doc
        .fontSize(8)
        .font('Helvetica')
        .text(
          `Généré le ${new Date().toLocaleDateString('fr-FR')}`,
          50,
          780,
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => resolve(filepath));
      stream.on('error', reject);
    });
  }

  /**
   * Generate Budget Report Excel
   */
  async generateBudgetExcel(budget: any): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Budget');

    // Header
    worksheet.addRow(['Rapport Budgétaire']);
    worksheet.addRow([`Exercice: ${budget.fiscalYear}`]);
    worksheet.addRow([`Période: ${budget.startDate} - ${budget.endDate}`]);
    worksheet.addRow([]);

    // Column headers
    worksheet.addRow(['Catégorie', 'Budgété', 'Dépensé', 'Restant', '% Utilisé']);

    // Data rows
    budget.categories.forEach((category: any) => {
      worksheet.addRow([
        category.name,
        category.budgeted,
        category.spent,
        category.remaining,
        `${category.percentage.toFixed(2)}%`,
      ]);
    });

    // Totals
    worksheet.addRow([]);
    worksheet.addRow([
      'TOTAL',
      budget.totalBudgeted,
      budget.totalSpent,
      budget.totalRemaining,
      `${((budget.totalSpent / budget.totalBudgeted) * 100).toFixed(2)}%`,
    ]);

    // Styling
    worksheet.getRow(1).font = { bold: true, size: 14 };
    worksheet.getRow(5).font = { bold: true };
    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const filename = `budget_${Date.now()}.xlsx`;
    const filepath = path.join(this.exportsDir, filename);

    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }

  /**
   * Generate Attendance Report CSV (Excel format)
   */
  async generateAttendanceCSV(attendance: any[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Présences');

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Ouvrier', key: 'worker', width: 25 },
      { header: 'Statut', key: 'status', width: 15 },
      { header: 'Check-in', key: 'checkIn', width: 15 },
      { header: 'Check-out', key: 'checkOut', width: 15 },
      { header: 'Heures', key: 'workHours', width: 10 },
      { header: 'Heures Supp.', key: 'overtime', width: 15 },
    ];

    attendance.forEach((record) => {
      worksheet.addRow({
        date: new Date(record.date).toLocaleDateString('fr-FR'),
        worker: record.worker ? `${record.worker.firstName} ${record.worker.lastName}` : 'N/A',
        status: record.status,
        checkIn: record.checkIn
          ? new Date(record.checkIn).toLocaleTimeString('fr-FR')
          : '-',
        checkOut: record.checkOut
          ? new Date(record.checkOut).toLocaleTimeString('fr-FR')
          : '-',
        workHours: record.workHours ? record.workHours.toFixed(2) : '0.00',
        overtime: record.overtime ? record.overtime.toFixed(2) : '0.00',
      });
    });

    const filename = `attendance_${Date.now()}.xlsx`;
    const filepath = path.join(this.exportsDir, filename);

    await workbook.xlsx.writeFile(filepath);

    return filepath;
  }
}

export const reportGenerator = new ReportGenerator();
