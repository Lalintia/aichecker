"use client";

interface GaugeChartProps {
  score: number;
}

export default function GaugeChart({ score }: GaugeChartProps) {
  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // green
    if (score >= 50) return "#f59e0b"; // yellow/orange
    return "#ef4444"; // red
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return "พร้อมมาก";
    if (score >= 50) return "กำลังเสี่ยง";
    return "เสี่ยงมาก";
  };

  const color = getColor(score);
  const statusText = getStatusText(score);

  // Gauge configuration
  const radius = 70;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75; // 75% of circle (270 degrees)
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 md:p-8 flex flex-col items-center justify-center h-full min-h-[400px]">
      <h3 className="text-white text-center mb-6 text-sm md:text-base">
        คะแนนความพร้อมสำหรับยุค AI Search
      </h3>

      {/* Gauge Container */}
      <div className="relative w-44 h-40">
        <svg
          width="176"
          height="160"
          viewBox="0 0 176 160"
          className="transform -rotate-90"
        >
          {/* Background arc */}
          <circle
            cx="88"
            cy="88"
            r={normalizedRadius}
            fill="none"
            stroke="#334155"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <circle
            cx="88"
            cy="88"
            r={normalizedRadius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>

        {/* Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-bold" style={{ color }}>
            {score}
          </span>
          <span className="text-gray-400 text-sm">/ 100</span>
        </div>
      </div>

      {/* Status Text */}
      <p className="mt-6 text-lg font-medium" style={{ color }}>
        {statusText}
      </p>
    </div>
  );
}
