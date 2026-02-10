"use client";

import { useState } from "react";
import { analyzeWebsite, CheckResponse, getGradeLabel, checkLabels, CheckType } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import ResultSection from "@/components/ResultSection";
import { CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeWebsite(url);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const gradeInfo = result ? getGradeLabel(result.grade) : null;

  return (
    <main className="min-h-screen bg-[#0f172a]">
      <HeroSection onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

      {error && (
        <div className="max-w-4xl mx-auto px-4 -mt-10 mb-10">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-red-400 font-semibold text-lg mb-1">เกิดข้อผิดพลาด</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="max-w-6xl mx-auto px-4 pb-20">
          {/* Overall Score */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">ผลการตรวจสอบ</h2>
              <p className="text-slate-400 mb-6">{result.url}</p>
              
              <div className="inline-flex items-center gap-6 bg-slate-900/50 rounded-2xl p-6">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${gradeInfo?.color} mb-2`}>
                    {result.overallScore}
                  </div>
                  <div className="text-slate-400">คะแนนรวม / 100</div>
                </div>
                <div className="w-px h-20 bg-slate-700" />
                <div className="text-left">
                  <div className={`text-2xl font-bold ${gradeInfo?.color} mb-1`}>
                    {gradeInfo?.label}
                  </div>
                  <div className="text-slate-400">ระดับความพร้อม</div>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{result.summary.passed}</div>
                <div className="text-slate-400 text-sm">ผ่าน</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400">{result.summary.warning}</div>
                <div className="text-slate-400 text-sm">ควรปรับปรุง</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{result.summary.failed}</div>
                <div className="text-slate-400 text-sm">ไม่ผ่าน</div>
              </div>
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">รายการตรวจสอบ ({result.summary.total} หัวข้อ)</h3>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 mb-4 px-4 text-sm font-medium text-slate-400 border-b border-slate-700 pb-2">
              <div className="col-span-1">#</div>
              <div className="col-span-4">หัวข้อ</div>
              <div className="col-span-2 text-center">น้ำหนัก</div>
              <div className="col-span-2 text-center">คะแนน</div>
              <div className="col-span-3">ผลลัพธ์</div>
            </div>
            
            <div className="space-y-3">
              {(Object.keys(checkLabels) as CheckType[]).map((key, index) => {
                const check = result.checks[key];
                const label = checkLabels[key];
                
                let statusColor = 'text-red-400 bg-red-500/10 border-red-500/20';
                let statusIcon = '🔴';
                if (check.score! >= 80) {
                  statusColor = 'text-green-400 bg-green-500/10 border-green-500/20';
                  statusIcon = '✅';
                } else if (check.score! >= 50) {
                  statusColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
                  statusIcon = '🟡';
                }
                
                return (
                  <div key={key} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* # */}
                      <div className="col-span-1 text-slate-500 font-medium">{index + 1}</div>
                      
                      {/* หัวข้อ */}
                      <div className="col-span-4">
                        <h4 className="font-semibold text-white">{label.title}</h4>
                        <p className="text-slate-500 text-xs">{label.description}</p>
                      </div>
                      
                      {/* น้ำหนัก */}
                      <div className="col-span-2 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-sm">
                          {label.weight}%
                        </span>
                      </div>
                      
                      {/* คะแนน */}
                      <div className="col-span-2 text-center">
                        <div className={`inline-flex flex-col items-center justify-center w-16 h-14 rounded-lg border ${statusColor}`}>
                          <span className="text-lg font-bold">{check.score}</span>
                          <span className="text-xs">/100</span>
                        </div>
                      </div>
                      
                      {/* ผลลัพธ์ */}
                      <div className="col-span-3">
                        <p className={`text-sm ${check.found ? 'text-slate-300' : 'text-red-400'}`}>
                          {statusIcon} {check.details}
                        </p>
                        {check.warnings && check.warnings.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {check.warnings.map((warning, idx) => (
                              <p key={idx} className="text-yellow-400 text-xs flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {warning}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">คำแนะนำสำหรับการปรับปรุง</h3>
              
              <div className="space-y-4">
                {result.recommendations.map((rec, idx) => {
                  const priorityColors = {
                    critical: 'bg-red-500 text-white',
                    high: 'bg-orange-500 text-white',
                    medium: 'bg-yellow-500 text-black',
                    low: 'bg-blue-500 text-white'
                  };
                  
                  const priorityLabels = {
                    critical: 'สำคัญมาก',
                    high: 'สูง',
                    medium: 'ปานกลาง',
                    low: 'ต่ำ'
                  };
                  
                  return (
                    <div key={idx} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        <span className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${priorityColors[rec.priority]}`}>
                          {priorityLabels[rec.priority]}
                        </span>
                        <div>
                          <h4 className="font-medium text-white mb-1">{rec.category}</h4>
                          <p className="text-slate-400 text-sm mb-2">{rec.message}</p>
                          <p className="text-green-400 text-sm">💡 {rec.action}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
