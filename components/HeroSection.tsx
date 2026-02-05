"use client";

import { useState } from "react";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export default function HeroSection({ onAnalyze, isLoading }: HeroSectionProps) {
  const [url, setUrl] = useState("www.se-ed.com");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          AI Search Checker
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          ตรวจให้พร้อมก่อนให้ AI ค้นหาเว็บไซต์ของคุณ
        </p>

        {/* Form Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 md:p-8 max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* URL Input */}
            <div className="text-left">
              <label className="block text-gray-400 text-sm mb-2">
                เว็บไซต์ URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="www.example.com"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-3 text-white text-center placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] disabled:bg-[#3730a3] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังวิเคราะห์...
                </>
              ) : (
                "วิเคราะห์เว็บไซต์"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
