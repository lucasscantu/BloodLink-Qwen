import React from 'react';

interface StatusBadgeProps {
  status: string;
  label: string;
  color: string;
}

export function StatusBadge({ status, label, color }: StatusBadgeProps) {
  return (
    <span
      data-testid={`status-badge-${status}`}
      className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}
