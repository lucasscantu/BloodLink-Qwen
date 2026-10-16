import React from 'react';
import { CheckCircle2, Circle, AlertCircle, XCircle } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'error' | 'warning';
  icon?: React.ReactNode;
  metadata?: Record<string, string>;
}

interface TimelineProps {
  items: TimelineItem[];
  showDate?: boolean;
}

export function Timeline({ items, showDate = true }: TimelineProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 size={18} className="text-green-500" />;
      case 'error':
        return <XCircle size={18} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={18} className="text-yellow-500" />;
      default:
        return <Circle size={18} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-0">
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Timeline line and icon */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStatusColor(item.status)}`}>
              {item.icon || getStatusIcon(item.status)}
            </div>
            {index < items.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 my-1 min-h-[2rem]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>
              {showDate && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(item.timestamp).toLocaleString('pt-BR')}
                </span>
              )}
            </div>

            {/* Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <span key={key} className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-medium text-gray-700">{value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
