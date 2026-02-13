import type { CheckGrade } from '@/lib/types/checker';
import { getGradeLabel } from '@/lib/utils/check-helpers';

interface ScoreDisplayProps {
  readonly score: number;
  readonly grade: CheckGrade;
  readonly url: string;
}

export function ScoreDisplay({ score, grade, url }: ScoreDisplayProps): React.ReactElement {
  const gradeInfo = getGradeLabel(grade);

  return (
    <div className="text-center">
      <p className="text-gray-500 mb-2 text-sm">Analysis Result</p>
      <p className="text-gray-900 font-medium mb-8 truncate px-4" title={url}>{url}</p>

      <div className="flex flex-col items-center mb-8">
        <div
          role="img"
          aria-label={`AI Search readiness score: ${score} out of 100 — ${gradeInfo.label}`}
          className={`w-40 h-40 rounded-full flex items-center justify-center ${gradeInfo.bgColor} border-4 border-white shadow-lg mb-4`}
        >
          <div className="text-center">
            <span className={`text-6xl font-bold ${gradeInfo.color}`}>{score}</span>
            <span className="text-gray-400 text-lg block">/100</span>
          </div>
        </div>
        <span className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.label}</span>
      </div>
    </div>
  );
}
