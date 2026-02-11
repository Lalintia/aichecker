'use client';

import type { Recommendation } from '@/lib/types/checker';

interface RecommendationGroupProps {
  readonly title: string;
  readonly count: number;
  readonly items: readonly Recommendation[];
  readonly color: 'rose' | 'amber' | 'blue';
  readonly icon: React.ReactNode;
}

const colorStyles = {
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-100',
    headerBg: 'bg-rose-100',
    headerText: 'text-rose-600',
    titleText: 'text-rose-700',
    itemBorder: 'border-rose-200',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    headerBg: 'bg-amber-100',
    headerText: 'text-amber-600',
    titleText: 'text-amber-700',
    itemBorder: 'border-amber-200',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    headerBg: 'bg-blue-100',
    headerText: 'text-blue-600',
    titleText: 'text-blue-700',
    itemBorder: 'border-blue-200',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
} as const;

export function RecommendationGroup({
  title,
  count,
  items,
  color,
  icon,
}: RecommendationGroupProps): React.ReactElement | null {
  if (items.length === 0) return null;

  const c = colorStyles[color];

  return (
    <div className={`${c.bg} rounded-2xl border ${c.border} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`${c.headerBg} ${c.headerText} p-1.5 rounded-lg`}>{icon}</span>
        <h3 className={`font-semibold ${c.titleText}`}>{title}</h3>
        <span className={`ml-auto text-xs ${c.titleText} opacity-70`}>{count}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className={`bg-white rounded-xl p-4 border ${c.itemBorder}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 mb-1">{item.message}</p>
                <p className="text-sm text-gray-500 mb-2">{item.action}</p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-md ${c.badgeBg} ${c.badgeText} font-medium`}
                >
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
