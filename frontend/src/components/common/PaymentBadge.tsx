import React from 'react';
import { PaymentStatus } from '../../types';

interface Props {
  status: PaymentStatus;
  size?: 'sm' | 'md';
}

export const PaymentBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const styles: Record<PaymentStatus, string> = {
    UNPAID: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    PARTIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    PAID: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border font-semibold ${pad} ${styles[status] || styles.UNPAID}`}>
      {status}
    </span>
  );
};
