'use client';

import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import type { CheckResult } from '@/lib/types/checker';
import type { CheckLabel } from '@/lib/utils/check-helpers';

type StatusType = 'good' | 'partial' | 'missing';

interface ChecklistItemProps {
  readonly index: number;
  readonly check: CheckResult;
  readonly label: CheckLabel;
}

export function ChecklistItem({ index, check, label }: ChecklistItemProps): React.ReactElement {
  const status = getStatusInfo(check.score, check.found);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-gray-400 font-medium text-sm w-5 flex-shrink-0">
          {index + 1}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
            {label.title}
          </h3>
          <p className="text-gray-500 text-xs hidden sm:block">{label.description}</p>
        </div>
      </div>

      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ml-2 ${
          status.status === 'good'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : status.status === 'partial'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}
      >
        {status.icon}
        <span className="hidden sm:inline">{status.label}</span>
      </span>
    </div>
  );
}

interface StatusInfo {
  status: StatusType;
  label: string;
  icon: React.ReactNode;
}

function getStatusInfo(score: number, found: boolean): StatusInfo {
  if (score >= 70) {
    return {
      status: 'good',
      label: 'Present',
      icon: <CheckCircle className="w-4 h-4" />,
    };
  }

  if (found || score >= 50) {
    return {
      status: 'partial',
      label: 'Partial',
      icon: <AlertCircle className="w-4 h-4" />,
    };
  }

  return {
    status: 'missing',
    label: 'Missing',
    icon: <XCircle className="w-4 h-4" />,
  };
}
