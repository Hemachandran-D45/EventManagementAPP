import React from 'react';

interface Props {
  amount: number;
  className?: string;
}

export const CurrencyText: React.FC<Props> = ({ amount, className = '' }) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount || 0);

  return <span className={className}>₹{formatted}</span>;
};
