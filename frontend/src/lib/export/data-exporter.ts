
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

interface ExportOptions {
    filename?: string;
    sheetName?: string;
    title?: string;
    orientation?: 'portrait' | 'landscape';
    includeTimestamp?: boolean;
}

interface TableColumn {
    header: string;
    key: string;
    width?: number;
    format?: (value: any) => string;
}

export class DataExporter {
    /**
     * Export data to Excel format (.xlsx)
     */
    static exportToExcel<T extends Record<string, any>>(
        data: T[],
        columns: TableColumn[],
        options: ExportOptions = { /* Intentionally empty */ }
    ): void {
        const {
            filename = 'export',
            sheetName = 'Sheet1',
            includeTimestamp = true,
        } = options;

        // Pr  parer les donn  es
        const formattedData = data.map((row) => {
            const formattedRow: Record<string, any> = { /* Intentionally empty */ };
            columns.forEach((col) => {
                const value = row[col.key];
                formattedRow[col.header] = col.format ? col.format(value) : value;
            });
            return formattedRow;
        });

        // Cr  er le workbook
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();

        // Ajuster les largeurs de colonnes
        const columnWidths = columns.map((col) => ({
            wch: col.width || Math.max(col.header.length, 15),
        }));
        worksheet['!cols'] = columnWidths;

        // Ajouter la feuille
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // G  n  rer et t  l  charger le fichier
        const timestamp = includeTimestamp
            ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
            : '';
        XLSX.writeFile(workbook, `${filename}${timestamp}.xlsx`);
    }

    /**
     * Export data to CSV format
     */
    static exportToCSV<T extends Record<string, any>>(
        data: T[],
        columns: TableColumn[],
        options: ExportOptions = { /* Intentionally empty */ }
    ): void {
        const { filename = 'export', includeTimestamp = true } = options;

        // Headers
        const headers = columns.map((col) => col.header).join(',');

        // Rows
        const rows = data.map((row) => {
            return columns
                .map((col) => {
                    const value = row[col.key];
                    const formatted = col.format ? col.format(value) : value;
                    // Escape commas and quotes
                    const escaped = String(formatted)
                        .replace(/"/g, '""')
                        .replace(/,/g, '","');
                    return `"${escaped}"`;
                })
                .join(',');
        });

        // Combine
        const csv = [headers, ...rows].join('\n');

        // Download
        const timestamp = includeTimestamp
            ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
            : '';
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Export data to PDF format
     */
    static exportToPDF<T extends Record<string, any>>(
        data: T[],
        columns: TableColumn[],
        options: ExportOptions = { /* Intentionally empty */ }
    ): void {
        const {
            filename = 'export',
            title = 'Export de donn  es',
            orientation = 'landscape',
            includeTimestamp = true,
        } = options;

        // Cr  er le document PDF
        // eslint-disable-next-line new-cap
        const doc = new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4',
        });

        // Titre
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 20);

        // Date d'export
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
            `G  n  r   le ${format(new Date(), 'dd MMMM yyyy    HH:mm', { locale: fr })}`,
            14,
            28
        );

        // Pr  parer les donn  es pour le tableau
        const tableData = data.map((row) =>
            columns.map((col) => {
                const value = row[col.key];
                return col.format ? col.format(value) : String(value || '');
            })
        );

        // G  n  rer le tableau
        autoTable(doc, {
            head: [columns.map((col) => col.header)],
            body: tableData,
            startY: 35,
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [59, 130, 246], // primary color
                textColor: 255,
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [249, 250, 251],
            },
            margin: { top: 35 },
        });

        // Pied de page
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(
                `Page ${i} sur ${pageCount}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // T  l  charger
        const timestamp = includeTimestamp
            ? `_${format(new Date(), 'yyyyMMdd_HHmmss')}`
            : '';
        doc.save(`${filename}${timestamp}.pdf`);
    }

    /**
     * Export g  n  rique - d  tecte le format automatiquement
     */
    static export<T extends Record<string, any>>(
        format: ExportFormat,
        data: T[],
        columns: TableColumn[],
        options: ExportOptions = { /* Intentionally empty */ }
    ): void {
        switch (format) {
            case 'excel':
                return this.exportToExcel(data, columns, options);
            case 'csv':
                return this.exportToCSV(data, columns, options);
            case 'pdf':
                return this.exportToPDF(data, columns, options);
            default:
                throw new Error(`Format non support  : ${format}`);
        }
    }
}
