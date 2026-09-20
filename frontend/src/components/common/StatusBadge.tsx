import React from 'react';
import { OrderStatus } from '../../types';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const styles: Record<OrderStatus, string> = {
    NEW: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    CONFIRMED: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    PREPARING: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    READY: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    COMPLETED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    CLOSED: 'bg-zinc-800 text-zinc-400 border-zinc-700'
  };

  const textMap: Record<OrderStatus, string> = {
    NEW: 'New Order',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    READY: 'Ready',
    COMPLETED: 'Completed',
    CLOSED: 'Closed'
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${pad} ${styles[status] || styles.NEW}`}>
      {textMap[status] || status}
    </span>
  );
};
