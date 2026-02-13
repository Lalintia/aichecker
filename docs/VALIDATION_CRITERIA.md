# AI Search Checker - เกณฑ์การตรวจสอบ

> **เอกสารอ้างอิงมาตรฐานการตรวจสอบ** สำหรับ AI Search Checker (aicheck.ohmai.me)
> 
> อัปเดตล่าสุด: กุมภาพันธ์ 2026

---

## 📋 สารบัญ

1. [Schema.org Structured Data](#1-schemaorg-structured-data)
2. [robots.txt](#2-robotstxt)
3. [XML Sitemap](#3-xml-sitemap)
4. [Page Speed & Core Web Vitals](#4-page-speed--core-web-vitals)
5. [Semantic HTML](#5-semantic-html)
6. [Heading Hierarchy](#6-heading-hierarchy)
7. [llms.txt](#7-llmstxt)
8. [Open Graph Protocol](#8-open-graph-protocol)
9. [Canonical URLs](#9-canonical-urls)
10. [Mobile Responsiveness](#10-mobile-responsiveness)

---

## 1. Schema.org Structured Data

### ทำไมต้องตรวจ?

Schema.org Structured Data ช่วยให้ Search Engine และ AI สามารถเข้าใจเนื้อหาของเว็บไซต์ได้ดีขึ้น นำไปสู่:
- **Rich Snippets** ในผลการค้นหา
- **AI Overviews** ที่แสดงข้อมูลจากเว็บไซต์
- **Knowledge Graph** ที่เชื่อมโยงข้อมูล

### ตรวจอะไรบ้าง?

| Schema Type | น้ำหนัก | ตรวจ Fields หลัก |
|-------------|--------|------------------|
| **Organization** | 30% | `@type`, `name`, `url`, `logo`, `sameAs` |
| **WebSite** | 20% | `@type`, `name`, `url`, `potentialAction` |
| **Article** | 15% | `@type`, `headline`, `author`, `datePublished`, `publisher`, `image` |
| **BreadcrumbList** | 15% | `@type`, `itemListElement`, `position`, `name`, `item` |
| **WebPage** | 10% | `@type`, `name`, `description`, `url` |
| **LocalBusiness** | 10% | `@type`, `name`, `address`, `telephone`, `geo` |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Schema.org Official** | https://schema.org/ |
| **Google Search Central - Structured Data** | https://developers.google.com/search/docs/appearance/structured-data |
| **Google Article Schema** | https://developers.google.com/search/docs/appearance/structured-data/article |
| **Google Organization Schema** | https://developers.google.com/search/docs/appearance/structured-data/organization |
| **Google Local Business** | https://developers.google.com/search/docs/appearance/structured-data/local-business |

---

## 2. robots.txt

### ทำไมต้องตรวจ?

robots.txt บอก Search Engine Crawler ว่าควรหรือไม่ควรเข้าถึงส่วนใดของเว็บไซต์ ช่วย:
- ป้องกันการ index เนื้อหาที่ไม่ต้องการ
- ประหยัด crawl budget
- ป้องกัน duplicate content

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| ไฟล์มีอยู่ (`/robots.txt`) | Required |
| มี `User-agent` directive | Required |
| มี `Sitemap` directive | Recommended |
| ไม่มี syntax error | Required |
| ไม่ block หน้าสำคัญ | Required |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google Search Central - robots.txt** | https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt |
| **RFC 9309 - Robots Exclusion Protocol** | https://www.rfc-editor.org/rfc/rfc9309.html |

---

## 3. XML Sitemap

### ทำไมต้องตรวจ?

XML Sitemap ช่วย Search Engine ค้นพบและ crawl หน้าสำคัญของเว็บไซต์ได้เร็วขึ้น:
- แจ้ง URL ทั้งหมดที่ต้องการ index
- บอกความสำคัญและความถี่ในการ update
- ช่วยหลังจาก redesign หรือย้ายโดเมน

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| ไฟล์มีอยู่ (`/sitemap.xml`) | Required |
| Valid XML format | Required |
| มี `<urlset>` หรือ `<sitemapindex>` | Required |
| URL ไม่เกิน 50,000 URLs | Best Practice |
| ขนาดไฟล์ไม่เกิน 50MB | Best Practice |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google Search Central - Sitemaps** | https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview |
| **Sitemap.org Protocol** | https://www.sitemaps.org/protocol.html |

---

## 4. Page Speed & Core Web Vitals

### ทำไมต้องตรวจ?

Core Web Vitals เป็นปัจจัยการจัดอันดับของ Google วัดประสบการณ์ผู้ใช้:
- **LCP** (Largest Contentful Paint) - ความเร็วโหลด
- **INP** (Interaction to Next Paint) - การตอบสนอง
- **CLS** (Cumulative Layout Shift) - ความเสถียรของ layout

### ตรวจอะไรบ้าง?

| Metric | เกณฑ์ดี | ต้องปรับปรุง |
|--------|---------|--------------|
| **LCP** | ≤ 2.5s | > 4.0s |
| **INP** | ≤ 200ms | > 500ms |
| **CLS** | ≤ 0.1 | > 0.25 |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google Core Web Vitals** | https://web.dev/articles/vitals |
| **PageSpeed Insights** | https://pagespeed.web.dev/ |
| **Web Vitals Thresholds** | https://web.dev/articles/defining-core-web-vitals-thresholds |

---

## 5. Semantic HTML

### ทำไมต้องตรวจ?

Semantic HTML ช่วย:
- Screen readers เข้าใจโครงสร้าง (Accessibility)
- Search Engine เข้าใจ context ของเนื้อหา
- AI แยกแยะส่วนต่างๆ ของหน้าเว็บ

### ตรวจอะไรบ้าง?

| Element | ใช้สำหรับ | สถานะ |
|---------|----------|--------|
| `<header>` | ส่วนหัวของเว็บ/section | Recommended |
| `<nav>` | Navigation links | Recommended |
| `<main>` | เนื้อหาหลัก | **Required** |
| `<article>` | เนื้อหาอิสระ (blog post, news) | Recommended |
| `<section>` | กลุ่มเนื้อหาที่เกี่ยวข้อง | Recommended |
| `<aside>` | เนื้อหาเสริม (sidebar) | Recommended |
| `<footer>` | ส่วนท้ายของเว็บ/section | Recommended |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **MDN - HTML Semantic Elements** | https://developer.mozilla.org/en-US/docs/Glossary/Semantics |
| **W3C HTML5 Specification** | https://html.spec.whatwg.org/multipage/ |
| **WebAIM - Semantic Structure** | https://webaim.org/techniques/semanticstructure/ |

---

## 6. Heading Hierarchy

### ทำไมต้องตรวจ?

Heading Hierarchy ช่วย:
- ผู้ใช้ screen reader นำทางเนื้อหา
- Search Engine เข้าใจความสำคัญของเนื้อหา
- AI สรุปโครงสร้างของบทความ

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| มี `<h1>` 1 อันต่อหน้า | **Required** |
| ไม่ข้ามระดับ (h1 → h3) | **Required** |
| h1 ต้องอยู่ก่อน h2, h3... | **Required** |
| ใช้ heading ตามลำดับ | Best Practice |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google - Headings and Titles** | https://developers.google.com/search/docs/appearance/title-link |
| **W3C - Heading Rank** | https://www.w3.org/WAI/tutorials/page-structure/headings/ |
| **WebAIM - Headings** | https://webaim.org/techniques/semanticstructure/#headings |

---

## 7. llms.txt

### ทำไมต้องตรวจ?

llms.txt เป็นมาตรฐานใหม่ที่ช่วย AI (ChatGPT, Claude, Gemini) เข้าใจเว็บไซต์:
- บอก AI ว่าเว็บมีเนื้อหาอะไรบ้าง
- ช่วย AI อ้างอิงข้อมูลถูกต้อง
- เพิ่มโอกาสถูก cite ใน AI responses

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| ไฟล์มีอยู่ (`/llms.txt`) | Required |
| มี H1 Title | Required |
| มี Bullet list ของหน้าสำคัญ | Required |
| มี Optional sections | Recommended |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **llms.txt Specification** | https://llmstxt.org/ |
| **GitHub - llms.txt** | https://github.com/AnswerDotAI/llms-txt |

---

## 8. Open Graph Protocol

### ทำไมต้องตรวจ?

Open Graph กำหนดวิธีแสดงตัวอย่างลิงก์บน Social Media:
- Facebook, LinkedIn, Twitter/X
- Messaging apps (LINE, WhatsApp, iMessage)
- การแชร์บน Social Platforms

### ตรวจอะไรบ้าง?

| Property | ใช้สำหรับ | สถานะ |
|----------|----------|--------|
| `og:title` | หัวข้อที่แสดง | **Required** |
| `og:description` | คำอธิบาย | **Required** |
| `og:image` | รูป thumbnail | **Required** |
| `og:url` | URL ที่แชร์ | **Required** |
| `og:type` | ประเภทเนื้อหา | Recommended |
| `og:site_name` | ชื่อเว็บไซต์ | Recommended |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Open Graph Protocol** | https://ogp.me/ |
| **Facebook Sharing Debugger** | https://developers.facebook.com/tools/debug/ |
| **Twitter Cards** | https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards |

---

## 9. Canonical URLs

### ทำไมต้องตรวจ?

Canonical URL แก้ปัญหา duplicate content:
- บอก Search Engine ว่า URL ไหนเป็น "ต้นฉบับ"
- รวม link signals เข้าที่ URL เดียว
- ป้องกันการแยก index เนื้อหาซ้ำ

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| มี `<link rel="canonical">` | **Required** |
| URL เป็น absolute URL | **Required** |
| ไม่มี self-referencing loop | **Required** |
| ไม่มี multiple canonical tags | **Required** |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google - Consolidate Duplicate URLs** | https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls |
| **RFC 6596 - Canonical Link Relation** | https://datatracker.ietf.org/doc/html/rfc6596 |

---

## 10. Mobile Responsiveness

### ทำไมต้องตรวจ?

Google ใช้ Mobile-First Indexing:
- 70%+ การค้นหามาจาก mobile
- Google จัดอันดับจาก mobile version เป็นหลัก
- ส่งผลต่อ Core Web Vitals

### ตรวจอะไรบ้าง?

| รายการ | สถานะ |
|--------|--------|
| มี `<meta name="viewport">` | **Required** |
| Content ไม่ wider than screen | **Required** |
| Text readable without zoom | **Required** |
| Touch targets มีขนาดเหมาะสม | **Required** |

### อ้างอิงมาตรฐาน

| แหล่งที่มา | ลิงก์ |
|-----------|--------|
| **Google - Mobile-First Indexing** | https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-first-indexing |
| **Web.dev - Responsive Design** | https://web.dev/articles/responsive-web-design-basics |
| **W3C - Viewport Meta Tag** | https://www.w3.org/TR/css-device-adapt-1/#viewport-meta |

---

## 📊 สรุปน้ำหนักการตรวจสอบ

| หัวข้อ | น้ำหนัก | ความสำคัญ |
|--------|--------|-----------|
| Schema.org Structured Data | **25%** | 🔴 สูงมาก |
| robots.txt | **20%** | 🔴 สูงมาก |
| XML Sitemap | **15%** | 🟠 สูง |
| Page Speed & Core Web Vitals | **10%** | 🟠 สูง |
| Semantic HTML | **10%** | 🟡 ปานกลาง |
| Heading Hierarchy | **10%** | 🟡 ปานกลาง |
| llms.txt | **5%** | 🟢 น้อย |
| Open Graph Protocol | **0%** | ⚪ ไม่นับ |
| Canonical URLs | **0%** | ⚪ ไม่นับ |
| Mobile Responsiveness | **0%** | ⚪ ไม่นับ |

---

## 🔄 การอัปเดตเกณฑ์

เกณฑ์การตรวจสอบจะได้รับการอัปเดตตาม:
- ประกาศจาก Google Search Central
- มาตรฐาน W3C ใหม่
- Best Practices จากอุตสาหกรรม
- ฟีดแบ็กจากผู้ใช้

---

*เอกสารนี้จัดทำโดย AI Search Checker Team*
*สอบถามเพิ่มเติม: support@ohmai.me*
