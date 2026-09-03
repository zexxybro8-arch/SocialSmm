import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PlatformCategory } from '../types/database';
import { PlatformIcon, getPlatformMeta } from './PlatformIcon';

interface CategoryCardProps {
  category: PlatformCategory;
  onClick: (category: PlatformCategory) => void;
  serviceCount?: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  serviceCount,
}) => {
  const meta = getPlatformMeta(category.id || category.name);
  const count = serviceCount !== undefined ? serviceCount : (category.servicesCount ?? 0);

  return (
    <button
      id={`cat-card-${category.id}`}
      onClick={() => onClick(category)}
      className="group relative flex flex-col justify-between text-left p-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-200 shadow-lg shadow-black/40 active:scale-[0.98] w-full"
    >
      <div className="flex items-start justify-between w-full">
        {/* Circular Platform Icon */}
        <div
          className="h-11 w-11 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
          style={{
            backgroundColor: category.bgColor || meta.bgColor,
            color: category.color || meta.color,
            boxShadow: `0 0 16px ${category.bgColor || meta.bgColor}`
          }}
        >
          <PlatformIcon platformOrIcon={category.iconName || category.id} className="w-5 h-5" />
        </div>

        {/* Small subtle chevron */}
        <div className="text-zinc-600 group-hover:text-zinc-300 transition-colors p-1">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3.5">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
          {category.name}
        </h3>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 font-medium">
          {count} {count === 1 ? 'service' : 'services'} available
        </p>
      </div>
    </button>
  );
};
