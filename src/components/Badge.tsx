import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    neutral: 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
    error: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
    info: 'bg-sky-950/60 text-sky-300 border-sky-800/60',
    purple: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border whitespace-nowrap tracking-wide select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'completed':
    case 'succeeded':
    case 'active':
    case 'resolved':
      return <Badge variant="success">{status.toUpperCase()}</Badge>;
    case 'processing':
    case 'in_progress':
      return <Badge variant="info">{status.replace('_', ' ').toUpperCase()}</Badge>;
    case 'paid':
      return <Badge variant="purple">PAID</Badge>;
    case 'pending':
    case 'open':
      return <Badge variant="warning">{status.toUpperCase()}</Badge>;
    case 'cancelled':
    case 'failed':
    case 'disabled':
      return <Badge variant="error">{status.toUpperCase()}</Badge>;
    case 'refunded':
      return <Badge variant="neutral">REFUNDED</Badge>;
    default:
      return <Badge variant="default">{status.toUpperCase()}</Badge>;
  }
};
