'use client';

import { ArrowRight } from 'lucide-react';

interface ResetButtonProps {
  readonly onReset: () => void;
}

export function ResetButton({ onReset }: ResetButtonProps): React.ReactElement {
  return (
    <div className="text-center">
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        Analyze another website
      </button>
    </div>
  );
}
