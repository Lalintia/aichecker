'use client';

import type { CheckResponse } from '@/lib/types/checker';
import { checkLabels, type CheckType } from '@/lib/utils/check-helpers';
import { ChecklistItem } from './checklist-item';

interface ChecklistProps {
  readonly checks: CheckResponse['checks'];
}

export function Checklist({ checks }: ChecklistProps): React.ReactElement {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analysis Checklist</h2>

      <div className="space-y-3">
        {(Object.keys(checkLabels) as CheckType[]).map((key, index) => (
          <ChecklistItem
            key={key}
            index={index}
            check={checks[key]}
            label={checkLabels[key]}
          />
        ))}
      </div>
    </div>
  );
}
