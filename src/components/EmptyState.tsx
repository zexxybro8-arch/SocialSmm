import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30">
      <div className="p-3.5 rounded-2xl bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 mb-3.5">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-zinc-200">{title}</h4>
      <p className="mt-1 text-sm text-zinc-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs tracking-wide transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
