"use client";

import { AlertTriangle } from "lucide-react";
import GaugeChart from "./GaugeChart";
import Checklist, { CheckItem } from "./Checklist";
import SchemaDetail, { SchemaType } from "./SchemaDetail";

interface ResultSectionProps {
  url: string;
  score: number;
  checkItems: CheckItem[];
  foundSchemas: SchemaType[];
  missingSchemas: SchemaType[];
}

export default function ResultSection({
  url,
  score,
  checkItems,
  foundSchemas,
  missingSchemas,
}: ResultSectionProps) {
  const getWarningMessage = (score: number) => {
    if (score >= 80) {
      return {
        title: "เว็บไซต์ของคุณพร้อมมากสำหรับ AI Search",
        description:
          "เว็บไซต์คุณกำลังอยู่ในระดับที่ดี AI สามารถเข้าถึงข้อมูลได้ครบถ้วน",
        type: "success",
      };
    }
    if (score >= 50) {
      return {
        title:
          'เว็บไซต์ของคุณยังนับเป็นช่วง AI Search "กำลังเสี่ยง" เว็บไซต์คุณอย่างเต็มที่',
        description:
          "เว็บไซต์คุณกำลังอยู่ในช่วนเสี่ยง AI อ่านข้อมูลได้ไม่ครบ ทำให้เว็บถูกมองข้ามในผลค้นหาได้",
        type: "warning",
      };
    }
    return {
      title: "เว็บไซต์ของคุณยังไม่พร้อมสำหรับ AI Search",
      description:
        "เว็บไซต์คุณกำลังอยู่ในช่วนเสี่ยงสูง AI ไม่สามารถเข้าถึงข้อมูลสำคัญได้",
      type: "danger",
    };
  };

  const warning = getWarningMessage(score);

  const getWarningStyles = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 border-green-500/30 text-green-400";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      case "danger":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      default:
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
    }
  };

  return (
    <section className="py-8 px-4 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Result Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ผลการวิเคราะห์ &apos;ความเสี่ยง&apos; ต่อ AI Search
          </h2>
          <span className="inline-block bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm">
            {url.startsWith("http") ? url : `https://${url}`}
          </span>
        </div>

        {/* Warning Banner */}
        <div
          className={`rounded-xl border p-4 mb-8 text-center ${getWarningStyles(
            warning.type
          )}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">{warning.title}</span>
          </div>
          <p className="text-sm opacity-90">{warning.description}</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-12 gap-6">
          {/* Gauge Chart - Left Side */}
          <div className="md:col-span-4">
            <GaugeChart score={score} />
          </div>

          {/* Checklist - Right Side */}
          <div className="md:col-span-8">
            <Checklist items={checkItems} />
          </div>
        </div>

        {/* Schema Detail Section */}
        <SchemaDetail
          foundSchemas={foundSchemas}
          missingSchemas={missingSchemas}
        />
      </div>
    </section>
  );
}
