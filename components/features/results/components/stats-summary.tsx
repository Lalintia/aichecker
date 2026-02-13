'use client';

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatsSummaryProps {
  readonly passed: number;
  readonly warning: number;
  readonly failed: number;
}

export function StatsSummary({ passed, warning, failed }: StatsSummaryProps): React.ReactElement {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        value={passed}
        label="Passed"
        color="emerald"
      />
      <StatCard
        icon={<AlertCircle className="w-5 h-5" />}
        value={warning}
        label="Partial"
        color="amber"
      />
      <StatCard
        icon={<XCircle className="w-5 h-5" />}
        value={failed}
        label="Missing"
        color="rose"
      />
    </div>
  );
}

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly value: number;
  readonly label: string;
  readonly color: 'emerald' | 'amber' | 'rose';
}

const STAT_CARD_COLORS = {
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    border: 'border-amber-100',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    border: 'border-rose-100',
  },
} as const;

function StatCard({ icon, value, label, color }: StatCardProps): React.ReactElement {
  const c = STAT_CARD_COLORS[color];

  return (
    <div className={`${c.bg} rounded-2xl p-4 text-center border ${c.border}`}>
      <div className={`w-10 h-10 ${c.iconBg} rounded-full flex items-center justify-center mx-auto mb-2`}>
        <span className={c.iconColor}>{icon}</span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold ${c.text}`}>{value}</div>
      <div className={`${c.text} text-xs sm:text-sm font-medium`}>{label}</div>
    </div>
  );
}
