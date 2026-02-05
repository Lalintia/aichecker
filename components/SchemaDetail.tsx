"use client";

import { Check, X, Code } from "lucide-react";

export interface SchemaType {
  name: string;
  found: boolean;
}

interface SchemaDetailProps {
  foundSchemas: SchemaType[];
  missingSchemas: SchemaType[];
}

export default function SchemaDetail({
  foundSchemas,
  missingSchemas,
}: SchemaDetailProps) {
  return (
    <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Code className="w-5 h-5 text-white" />
        <h3 className="text-white text-lg font-semibold">
          รายละเอียด Schema ที่ตรวจพบ
        </h3>
      </div>

      {/* Found Schemas */}
      <div className="mb-6">
        <h4 className="text-green-400 text-sm font-medium mb-3">
          ประเภท Schema ที่ AI &apos;พอจะเข้าใจ&apos;
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {foundSchemas.map((schema) => (
            <div
              key={schema.name}
              className="bg-[#0f172a] border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-white text-sm truncate">{schema.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Schemas */}
      <div>
        <h4 className="text-red-400 text-sm font-medium mb-3">
          ประเภท Schema สำคัญที่ &apos;ขาดหาย&apos; (AI ใช้ไม่ได้)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {missingSchemas.map((schema) => (
            <div
              key={schema.name}
              className="bg-[#0f172a] border border-red-500/30 rounded-lg px-4 py-3 flex items-center gap-2 opacity-70"
            >
              <X className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-gray-400 text-sm truncate">
                {schema.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
