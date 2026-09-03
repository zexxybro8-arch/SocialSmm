import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`relative rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md text-zinc-100 shadow-xl shadow-black/20 ${
        hoverEffect
          ? 'transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-black/40'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
