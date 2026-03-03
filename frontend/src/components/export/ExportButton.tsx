
'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { DataExporter, ExportFormat } from '@/lib/export/data-exporter';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportButtonProps<T> {
    data: T[];
    columns: Array<{
        header: string;
        key: string;
        width?: number;
        format?: (value: any) => string;
    }>;
    filename?: string;
    title?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function ExportButton<T extends Record<string, any>>({
    data,
    columns,
    filename = 'export',
    title = 'Export de donn  es',
    variant = 'outline',
    size = 'default',
}: ExportButtonProps<T>) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: ExportFormat) => {
        if (data.length === 0) {
            toast.error('Aucune donn  e    exporter');
            return;
        }

        setIsExporting(true);
        toast.loading(`Export ${format.toUpperCase()} en cours...`);

        try {
            // Simuler un d  lai pour les gros exports
            await new Promise((resolve) => setTimeout(resolve, 500));

            DataExporter.export(format, data, columns, {
                filename,
                title,
                includeTimestamp: true,
            });

            toast.dismiss();
            toast.success(`Export ${format.toUpperCase()} r  ussi!`, {
                description: `${data.length} ligne(s) export  e(s)`,
            });
        } catch (error) {
            toast.dismiss();
            toast.error('Erreur lors de l\'export', {
                description: error instanceof Error ? error.message : 'Erreur inconnue',
            });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                    Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    <File className="w-4 h-4 mr-2 text-red-600" />
                    PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
