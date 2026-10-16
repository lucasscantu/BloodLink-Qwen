import React, { useState } from 'react';
import { Download, FileText, FileJson } from 'lucide-react';

interface ExportButtonProps<T> {
  data: T[];
  filename?: string;
  columns?: { key: keyof T | string; header: string }[];
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename = 'export',
  columns,
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const exportToCSV = () => {
    if (!data.length) return;

    const headers = columns
      ? columns.map(col => col.header)
      : Object.keys(data[0]);

    const rows = data.map(item => {
      if (columns) {
        return columns.map(col => {
          const value = item[col.key as keyof T];
          return `"${String(value || '').replace(/"/g, '""')}"`;
        }).join(',');
      }
      return Object.values(item).map(val =>
        `"${String(val || '').replace(/"/g, '""')}"`
      ).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    downloadFile(csv, `${filename}.csv`, 'text/csv');
    setIsOpen(false);
  };

  const exportToJSON = () => {
    if (!data.length) return;
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, 'application/json');
    setIsOpen(false);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2"
      >
        <Download size={16} />
        Exportar
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
            <button
              onClick={exportToCSV}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FileText size={16} className="text-green-600" />
              Exportar CSV
            </button>
            <button
              onClick={exportToJSON}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <FileJson size={16} className="text-blue-600" />
              Exportar JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
