"use client";

import { MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const knowledgeLinks = [
    { label: "ความรู้ SEO", href: "#" },
    { label: "ความรู้ Digital Marketing", href: "#" },
    { label: "SEO Case Study", href: "#" },
  ];

  const serviceLinks = [
    { label: "รับทำ SEO", href: "#" },
    { label: "รับทำ Backlink", href: "#" },
    { label: "รับสอน SEO", href: "#" },
    { label: "รับทำเว็บไซต์ WordPress", href: "#" },
    { label: "รับทำ Google Ads", href: "#" },
  ];

  const aboutLinks = [
    { label: "รู้จักกับแบรนด์", href: "#" },
  ];

  return (
    <footer className="bg-[#0f172a] border-t border-[#334155] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            {/* Logo */}
            <div className="mb-6">
              <svg
                viewBox="0 0 80 40"
                className="h-10 w-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Glasses icon */}
                <circle
                  cx="20"
                  cy="20"
                  r="12"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="55"
                  cy="20"
                  r="12"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                />
                <line
                  x1="32"
                  y1="20"
                  x2="43"
                  y2="20"
                  stroke="white"
                  strokeWidth="3"
                />
                {/* Sparkle */}
                <path
                  d="M68 8 L70 12 L74 12 L71 15 L72 19 L68 17 L64 19 L65 15 L62 12 L66 12 Z"
                  fill="#60a5fa"
                />
              </svg>
            </div>
            <h3 className="text-white font-bold mb-4">NERDOPTIMIZE CO., LTD.</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              เราเป็นกลุ่มคนที่ทุ่มเทให้กับเรื่องที่เรารักอย่างเต็มที่
              รวมตัวกันเพื่อทำ SEO ให้กับคุณ
              ด้วยความตั้งใจที่จะทำให้ธุรกิจของคุณเติบโต
              ทั้งเว็บไซต์และแบรนด์ของคุณ
              เพราะความสำเร็จของคุณคือเป้าหมายสูงสุดของเรา
            </p>
          </div>

          {/* Knowledge Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">ส่งเสริมความรู้</h4>
            <ul className="space-y-3">
              {knowledgeLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mb-4 mt-6">เกี่ยวกับเรา</h4>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">บริการของเรา</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  ชั้น 6 อาคารเสริมมิตร สุขุมวิท,
                  <br />
                  723 ถนนสีลม แขวงสีลม เขต
                  <br />
                  บางรัก กรุงเทพฯ 10500
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a
                  href="tel:02-481-9891"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  02-481-9891
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <a
                  href="mailto:expert@nerdoptimize.com"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  expert@nerdoptimize.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
