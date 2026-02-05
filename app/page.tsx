"use client";

import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import ResultSection from "@/components/ResultSection";
import { CheckItem } from "@/components/Checklist";
import { SchemaType } from "@/components/SchemaDetail";
import { runAllChecks, calculateScore } from "@/lib/checker";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analyzedUrl, setAnalyzedUrl] = useState("");
  const [score, setScore] = useState(0);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([]);
  const [foundSchemas, setFoundSchemas] = useState<SchemaType[]>([]);
  const [missingSchemas, setMissingSchemas] = useState<SchemaType[]>([]);

  // Schema types ที่ตรวจสอบ
  const allSchemaTypes = [
    "OnlineStore",
    "PostalAddress",
    "SearchAction",
    "WebSite",
    "AggregateRating",
    "Article",
    "BlogPosting",
    "BreadcrumbList",
    "CreativeWorkSeries",
    "FAQPage",
    "HowTo",
    "ImageObject",
    "LocalBusiness",
    "NewsArticle",
    "Offer",
    "Organization",
    "Person",
    "Product",
    "QAPage",
    "Review",
    "VideoObject",
    "WebPage",
  ];

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      // รันการตรวจสอบทั้งหมด
      const results = await runAllChecks(url);
      
      // คำนวณคะแนน
      const calculatedScore = calculateScore(results);
      setScore(calculatedScore);

      // สร้าง Check Items
      const items: CheckItem[] = [
        {
          id: "schema",
          name: "Schema Data (JSON-LD)",
          description: "ช่วยให้ AI เข้าใจเนื้อหาเว็บไซต์ได้ถูกต้อง",
          impact: "ถ้าไม่มี AI อาจไม่รู้ว่าหน้าเว็บพูดถึงอะไร",
          status: results.schema.found ? "pass" : "fail",
          count: results.schema.count,
        },
        {
          id: "robots",
          name: "Robots.txt",
          description: "บอกให้ AI รู้ว่าเข้าถึงหน้าไหนได้บ้าง",
          impact: "ถ้าไม่มี AI อาจอ่านข้อมูลผิด",
          status: results.robotsTxt.found ? "pass" : "fail",
        },
        {
          id: "llms",
          name: "LLMs.txt",
          description: "แนะนำ AI ว่าข้อมูลไหนใช้ได้หรือไม่",
          impact: "ถ้าไม่มี AI อาจใช้ข้อมูลผิดพลาด",
          status: results.llmsTxt.found ? "pass" : "fail",
        },
        {
          id: "webapi",
          name: "Web API (ai-plugin.json)",
          description: "ช่วยให้ AI ดึงข้อมูลเฉพาะทางจากเว็บไซต์ได้โดยตรง",
          impact: "ถ้าไม่มี AI จะเข้าถึงบริการคุณไม่ได้",
          status: results.webAPI.found ? "pass" : "fail",
        },
        {
          id: "github",
          name: "Public GitHub Repository",
          description: "แหล่งข้อมูลบุคคลที่ AI เข้าอ่านได้",
          impact: "ถ้าไม่มี AI จะไม่เห็นข้อมูลเชิงลึกของคุณ",
          status: results.githubRepo.found ? "pass" : "fail",
        },
        {
          id: "customgpt",
          name: "Custom GPT Mention",
          description: "ช่วยให้ AI รู้ว่าคุณมี AI Assistant หรือ GPT ของตัวเอง",
          impact: "เพิ่มโอกาสให้ธุรกิจคุณถูกกล่าวถึงบ่อยใน AI Search",
          status: results.customGPT.found ? "pass" : "fail",
        },
        {
          id: "wikidata",
          name: "Wikidata Mention",
          description: "อ้างอิงข้อมูลบริษัทกับ Wikidata",
          impact: "ถ้าไม่มี AI อาจไม่รู้ว่าคุณคือใคร",
          status: results.wikidata.found ? "pass" : "fail",
        },
        {
          id: "credential",
          name: "Company Credential Data",
          description: "ยืนยันความน่าเชื่อถือของบริษัท",
          impact: "ถ้าไม่มี AI อาจมองว่าเว็บไม่ปลอดภัย",
          status: results.companyCredential.found ? "pass" : "fail",
        },
      ];
      setCheckItems(items);

      // แยก Schema ที่พบและไม่พบ
      // จำลอง: พบ 4 ประเภทแรก, ที่เหลือไม่พบ
      const found: SchemaType[] = allSchemaTypes.slice(0, 4).map((name) => ({
        name,
        found: true,
      }));
      const missing: SchemaType[] = allSchemaTypes.slice(4).map((name) => ({
        name,
        found: false,
      }));
      
      setFoundSchemas(found);
      setMissingSchemas(missing);

      setAnalyzedUrl(url);
      setShowResults(true);
    } catch (error) {
      console.error("Error analyzing website:", error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a]">
      <HeroSection onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

      {showResults && (
        <ResultSection
          url={analyzedUrl}
          score={score}
          checkItems={checkItems}
          foundSchemas={foundSchemas}
          missingSchemas={missingSchemas}
        />
      )}
    </main>
  );
}
