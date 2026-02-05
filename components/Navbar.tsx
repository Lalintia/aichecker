"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "หน้าหลัก", href: "#" },
    { label: "บริการของเรา", href: "#", hasDropdown: true },
    { label: "บทความ", href: "#" },
    { label: "เครื่องมือฟรี", href: "#", hasDropdown: true },
    { label: "ร่วมงานกับเรา", href: "#" },
    { label: "เกี่ยวกับเรา", href: "#", hasDropdown: true },
  ];

  return (
    <nav className="bg-[#1e293b] border-b border-[#334155]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#" className="flex items-center gap-1">
              <div className="text-white font-bold text-xl">
                <span className="text-white">NERD</span>
                <span className="text-blue-400 text-sm absolute ml-1">✦</span>
              </div>
              <div className="text-gray-400 text-xs mt-4">OPTIMIZE</div>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-300 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <a
              href="#"
              className="bg-gray-200 hover:bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              เช็คความพร้อมรับ ยุค AI Search
            </a>
            <a
              href="#"
              className="bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              ติดต่อเรา
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#334155]">
            <div className="space-y-3">
              {menuItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block text-gray-300 hover:text-white text-sm py-2"
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                <a
                  href="#"
                  className="block bg-gray-200 text-gray-900 px-4 py-2 rounded-full text-sm font-medium text-center"
                >
                  เช็คความพร้อมรับ ยุค AI Search
                </a>
                <a
                  href="#"
                  className="block bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium text-center"
                >
                  ติดต่อเรา
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
