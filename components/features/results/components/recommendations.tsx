'use client';

import { AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import type { CheckResponse } from '@/lib/types/checker';

interface RecommendationsProps {
  readonly recommendations: CheckResponse['recommendations'];
}

export function Recommendations({ recommendations }: RecommendationsProps): React.ReactElement {
  if (recommendations.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 sm:p-8 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        </div>
        <p className="text-emerald-700">
          Great job! Your website is well-optimized for AI search engines. No critical issues found.
        </p>
      </div>
    );
  }

  // Group by priority (only show critical, high, medium)
  const critical = recommendations.filter((r) => r.priority === 'critical');
  const high = recommendations.filter((r) => r.priority === 'high');
  const medium = recommendations.filter((r) => r.priority === 'medium');
  // Low priority is hidden

  // Combine critical + high for red section
  const redItems = [...critical, ...high];

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        <span className="ml-auto text-sm text-gray-500">
          {redItems.length + medium.length} items
        </span>
      </div>

      <div className="space-y-4">
        {/* Red section: Critical + High */}
        {redItems.length > 0 && (
          <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-rose-100 text-rose-600 p-1.5 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h3 className="font-semibold text-rose-700">
                {critical.length > 0 ? 'Critical Issues' : 'High Priority'}
              </h3>
              <span className="ml-auto text-xs text-rose-700 opacity-70">{redItems.length}</span>
            </div>
            <div className="space-y-3">
              {redItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-rose-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 mb-1">{item.message}</p>
                      <p className="text-sm text-gray-500 mb-2">{item.action}</p>
                      <span className="inline-block text-xs px-2 py-1 rounded-md bg-rose-100 text-rose-700 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Yellow section: Medium */}
        {medium.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-100 text-amber-600 p-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4" />
              </span>
              <h3 className="font-semibold text-amber-700">Medium Priority</h3>
              <span className="ml-auto text-xs text-amber-700 opacity-70">{medium.length}</span>
            </div>
            <div className="space-y-3">
              {medium.map((item, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 mb-1">{item.message}</p>
                      <p className="text-sm text-gray-500 mb-2">{item.action}</p>
                      <span className="inline-block text-xs px-2 py-1 rounded-md bg-amber-100 text-amber-700 font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
