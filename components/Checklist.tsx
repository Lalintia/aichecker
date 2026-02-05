"use client";

import { Check, X, AlertCircle } from "lucide-react";

export interface CheckItem {
  id: string;
  name: string;
  description: string;
  impact: string;
  status: "pass" | "fail" | "warning";
  count?: number;
}

interface ChecklistProps {
  items: CheckItem[];
}

export default function Checklist({ items }: ChecklistProps) {
  const getStatusBadge = (status: CheckItem["status"], count?: number) => {
    switch (status) {
      case "pass":
        return (
          <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded text-sm font-medium">
            ผ่าน
            {count && <span className="text-xs text-gray-400">({count} ประเภท)</span>}
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded text-sm font-medium">
            คำเตือน
          </span>
        );
      case "fail":
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-sm font-medium">
            ไม่พบ!
          </span>
        );
    }
  };

  const getStatusIcon = (status: CheckItem["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="w-5 h-5 text-green-400 flex-shrink-0" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />;
      case "fail":
      default:
        return <X className="w-5 h-5 text-red-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-6">
        Checklist: เพื่อตรวจเช็คความพร้อมสำหรับ AI Search&apos;
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 hover:border-[#475569] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm mb-1">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-xs mb-1">{item.description}</p>
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span>📍</span>
                    {item.impact}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                {getStatusBadge(item.status, item.count)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
