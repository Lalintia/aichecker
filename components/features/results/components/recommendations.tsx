import { AlertCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import type { CheckResponse } from '@/lib/types/checker';
import { RecommendationGroup } from './recommendation-group';

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

  // Group by priority
  const critical = recommendations.filter((r) => r.priority === 'critical');
  const high = recommendations.filter((r) => r.priority === 'high');
  const medium = recommendations.filter((r) => r.priority === 'medium');
  const low = recommendations.filter((r) => r.priority === 'low');

  const redItems = [...critical, ...high];
  const redTitle = critical.length > 0 ? 'Critical Issues' : 'High Priority';

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Recommendations</h2>
        <span className="ml-auto text-sm text-gray-500">{recommendations.length} items</span>
      </div>

      <div className="space-y-4">
        <RecommendationGroup
          title={redTitle}
          count={redItems.length}
          items={redItems}
          color="rose"
          icon={<AlertTriangle className="w-4 h-4" />}
        />

        <RecommendationGroup
          title="Medium Priority"
          count={medium.length}
          items={medium}
          color="amber"
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <RecommendationGroup
          title="Low Priority"
          count={low.length}
          items={low}
          color="blue"
          icon={<Lightbulb className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
