import { NextRequest, NextResponse } from 'next/server';

// Types
export interface CheckResult {
  found: boolean;
  details: string;
  count?: number;
  score?: number;
  data?: any;
  warnings?: string[];
}

export interface CheckResponse {
  url: string;
  overallScore: number;
  grade: 'excellent' | 'good' | 'fair' | 'poor';
  checks: {
    schema: CheckResult;
    robotsTxt: CheckResult;
    llmsTxt: CheckResult;
    sitemap: CheckResult;
    openGraph: CheckResult;
    semanticHTML: CheckResult;
    headingHierarchy: CheckResult;
    faqBlocks: CheckResult;
    pageSpeed: CheckResult;
    authorAuthority: CheckResult;
  };
  recommendations: Recommendation[];
  summary: {
    passed: number;
    warning: number;
    failed: number;
    total: number;
  };
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  action: string;
}

// Normalize URL
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  normalized = normalized.replace(/\/$/, '');
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  return normalized;
}

// ==================== 1. Schema.org (JSON-LD) - 30% ====================
async function checkSchema(url: string, html: string): Promise<CheckResult> {
  const schemas: any[] = [];
  const schemaRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = schemaRegex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      schemas.push(json);
    } catch (e) {}
  }
  
  const schemaTypes = schemas.map(s => s['@type']).filter(Boolean);
  const uniqueTypes = [...new Set(schemaTypes)];
  
  const importantTypes = ['Organization', 'WebSite', 'Article', 'Product', 'LocalBusiness', 'FAQPage'];
  const hasImportant = uniqueTypes.some(t => importantTypes.includes(t));
  
  if (schemas.length === 0) {
    return {
      found: false,
      score: 0,
      details: 'ไม่พบ Schema.org JSON-LD',
      data: { types: [] }
    };
  }
  
  return {
    found: true,
    score: hasImportant ? 100 : 70,
    count: schemas.length,
    details: `พบ Schema ${schemas.length} รายการ (${uniqueTypes.join(', ')})`,
    data: { 
      types: uniqueTypes,
      hasImportantTypes: hasImportant
    },
    warnings: !hasImportant ? ['ควรเพิ่ม Organization หรือ WebSite Schema'] : undefined
  };
}

// ==================== 2. robots.txt - 15% ====================
async function checkRobotsTxt(url: string): Promise<CheckResult> {
  try {
    const robotsUrl = `${url}/robots.txt`;
    const response = await fetch(robotsUrl, { 
      method: 'GET',
      headers: { 'User-Agent': 'AISearchChecker/1.0' },
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      return {
        found: false,
        score: 0,
        details: 'ไม่พบ robots.txt',
        data: {}
      };
    }
    
    const content = await response.text();
    const hasSitemap = content.toLowerCase().includes('sitemap');
    const blocksAI = content.includes('GPTBot') && content.includes('Disallow: /');
    
    let score = 100;
    const warnings: string[] = [];
    
    if (!hasSitemap) {
      score -= 20;
      warnings.push('ควรระบุ Sitemap ใน robots.txt');
    }
    if (blocksAI) {
      score -= 30;
      warnings.push('อาจบล็อค AI crawlers (GPTBot)');
    }
    
    return {
      found: true,
      score,
      details: `พบ robots.txt ${hasSitemap ? '(มี Sitemap)' : '(ไม่มี Sitemap)'}`,
      data: { hasSitemap, blocksAI, content: content.slice(0, 500) },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    return {
      found: false,
      score: 0,
      details: 'ไม่สามารถเข้าถึง robots.txt ได้',
      data: {}
    };
  }
}

// ==================== 3. llms.txt - 15% ====================
async function checkLlmsTxt(url: string): Promise<CheckResult> {
  try {
    const llmsUrl = `${url}/llms.txt`;
    const response = await fetch(llmsUrl, { 
      method: 'GET',
      next: { revalidate: 0 }
    });
    
    if (response.ok) {
      const content = await response.text();
      
      // ตรวจสอบว่าเนื้อหาเป็น HTML (SPA redirect) หรือไม่
      const isHTML = content.trim().toLowerCase().startsWith('<!doctype') || 
                     content.trim().toLowerCase().startsWith('<html') ||
                     content.toLowerCase().includes('<head>') ||
                     content.toLowerCase().includes('<body>');
      
      if (isHTML) {
        return {
          found: false,
          score: 0,
          details: 'ไม่พบ llms.txt (เว็บตอบกลับด้วย HTML แทน)',
          data: {}
        };
      }
      
      return {
        found: true,
        score: 100,
        details: `พบ llms.txt (${content.length} ตัวอักษร)`,
        data: { content: content.slice(0, 300) }
      };
    }
    
    return {
      found: false,
      score: 0,
      details: 'ไม่พบ llms.txt (แนะนำให้สร้าง - มาตรฐานใหม่สำหรับ AI)',
      data: {}
    };
  } catch (error) {
    return {
      found: false,
      score: 0,
      details: 'ไม่พบ llms.txt',
      data: {}
    };
  }
}

// ==================== 4. Sitemap.xml - 10% ====================
async function checkSitemap(url: string, robotsContent?: string): Promise<CheckResult> {
  try {
    let sitemapUrl = `${url}/sitemap.xml`;
    
    if (robotsContent) {
      const sitemapMatch = robotsContent.match(/sitemap:\s*(.+)/i);
      if (sitemapMatch) {
        sitemapUrl = sitemapMatch[1].trim();
      }
    }
    
    const response = await fetch(sitemapUrl, { 
      method: 'GET',
      next: { revalidate: 0 }
    });
    
    if (response.ok) {
      const content = await response.text();
      
      // ตรวจสอบว่าเป็น XML จริงๆ ไม่ใช่ HTML (SPA redirect)
      const isHTML = content.trim().toLowerCase().startsWith('<!doctype') || 
                     content.trim().toLowerCase().startsWith('<html') ||
                     content.toLowerCase().includes('<head>') ||
                     content.toLowerCase().includes('<body>');
      
      if (isHTML) {
        return {
          found: false,
          score: 0,
          details: 'ไม่พบ Sitemap.xml (เว็บตอบกลับด้วย HTML แทน)',
          data: {}
        };
      }
      
      const urlCount = (content.match(/<url>/g) || []).length;
      const hasLastmod = content.includes('<lastmod>');
      
      return {
        found: true,
        score: hasLastmod ? 100 : 80,
        count: urlCount,
        details: `พบ Sitemap (${urlCount} URLs) ${hasLastmod ? '+ Lastmod' : ''}`,
        data: { url: sitemapUrl, hasLastmod },
        warnings: !hasLastmod ? ['ควรเพิ่ม <lastmod> ในแต่ละ URL'] : undefined
      };
    }
    
    return {
      found: false,
      score: 0,
      details: 'ไม่พบ Sitemap.xml',
      data: {}
    };
  } catch (error) {
    return {
      found: false,
      score: 0,
      details: 'ไม่พบ Sitemap',
      data: {}
    };
  }
}

// ==================== 5. Open Graph + Twitter Cards - 15% ====================
function checkOpenGraph(html: string): CheckResult {
  // Critical tags that must be present
  const criticalOgTags = ['og:title', 'og:description', 'og:image'];
  const otherOgTags = ['og:url', 'og:type'];
  const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
  
  const foundCritical: string[] = [];
  const foundOther: string[] = [];
  const foundTwitter: string[] = [];
  
  // Check critical OG tags
  criticalOgTags.forEach(tag => {
    const regex = new RegExp(`<meta[^>]*property="${tag}"[^>]*content="([^"]*)"`, 'i');
    if (regex.test(html)) foundCritical.push(tag);
  });
  
  // Check other OG tags
  otherOgTags.forEach(tag => {
    const regex = new RegExp(`<meta[^>]*property="${tag}"[^>]*content="([^"]*)"`, 'i');
    if (regex.test(html)) foundOther.push(tag);
  });
  
  // Check Twitter tags
  twitterTags.forEach(tag => {
    const regex = new RegExp(`<meta[^>]*name="${tag}"[^>]*content="([^"]*)"`, 'i');
    if (regex.test(html)) foundTwitter.push(tag);
  });
  
  const criticalCount = foundCritical.length;
  const otherCount = foundOther.length;
  const twitterComplete = foundTwitter.length >= 2;
  const twitterPartial = foundTwitter.length >= 1;
  
  // Calculate score based on critical tags
  let score = 0;
  let status = '';
  
  if (criticalCount === 3 && otherCount === 2 && twitterComplete) {
    score = 100;
    status = 'สมบูรณ์';
  } else if (criticalCount === 3 && otherCount >= 1 && twitterComplete) {
    score = 90;
    status = 'ดีมาก';
  } else if (criticalCount === 3 && twitterComplete) {
    score = 80;
    status = 'ดี';
  } else if (criticalCount === 3 && twitterPartial) {
    score = 70;
    status = 'ค่อนข้างดี';
  } else if (criticalCount === 3) {
    score = 60;
    status = 'พอใช้';
  } else if (criticalCount === 2 && twitterPartial) {
    score = 50;
    status = 'ขาดบางส่วน';
  } else if (criticalCount === 2) {
    score = 40;
    status = 'ขาดบางส่วน';
  } else if (criticalCount === 1) {
    score = 20;
    status = 'ไม่สมบูรณ์';
  } else {
    score = 0;
    status = 'ไม่มี';
  }
  
  const warnings: string[] = [];
  const missingCritical = criticalOgTags.filter(t => !foundCritical.includes(t));
  const missingOther = otherOgTags.filter(t => !foundOther.includes(t));
  
  if (missingCritical.length > 0) {
    warnings.push(`ขาดสำคัญ: ${missingCritical.join(', ')}`);
  }
  if (missingOther.length > 0) {
    warnings.push(`ขาดรอง: ${missingOther.join(', ')}`);
  }
  if (!twitterComplete) {
    warnings.push('ควรเพิ่ม Twitter Card tags');
  }
  
  const foundOg = [...foundCritical, ...foundOther];
  
  return {
    found: criticalCount > 0,
    score,
    count: foundOg.length + foundTwitter.length,
    details: `OG: ${criticalCount}/3 สำคัญ + ${otherCount}/2 รอง, Twitter: ${foundTwitter.length}/3 (${status})`,
    data: { 
      critical: foundCritical, 
      other: foundOther, 
      twitter: foundTwitter 
    },
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ==================== 6. Semantic HTML - 5% ====================
function checkSemanticHTML(html: string): CheckResult {
  const semanticElements = ['<header', '<main', '<article', '<section', '<footer', '<nav', '<aside'];
  const found: string[] = [];
  
  semanticElements.forEach(el => {
    const regex = new RegExp(el, 'i');
    if (regex.test(html)) found.push(el.replace('<', ''));
  });
  
  const hasMain = html.includes('<main');
  const hasHeader = html.includes('<header');
  const hasArticleOrSection = html.includes('<article') || html.includes('<section');
  
  let score = 0;
  if (hasMain && hasHeader && hasArticleOrSection) score = 100;
  else if (hasMain && hasHeader) score = 80;
  else if (found.length >= 3) score = 60;
  else if (found.length > 0) score = 40;
  else score = 20;
  
  return {
    found: found.length > 0,
    score,
    count: found.length,
    details: `พบ Semantic Elements: ${found.join(', ') || 'ไม่พบ'}`,
    data: { elements: found },
    warnings: !hasMain ? ['ควรใช้ <main> สำหรับเนื้อหาหลัก'] : undefined
  };
}

// ==================== 7. Heading Hierarchy - 5% ====================
function checkHeadingHierarchy(html: string): CheckResult {
  const h1Matches = html.match(/<h1[^>]*>/gi) || [];
  const h2Matches = html.match(/<h2[^>]*>/gi) || [];
  const h3Matches = html.match(/<h3[^>]*>/gi) || [];
  
  const h1Count = h1Matches.length;
  const h2Count = h2Matches.length;
  const h3Count = h3Matches.length;
  
  const warnings: string[] = [];
  let score = 100;
  
  if (h1Count === 0) {
    score -= 40;
    warnings.push('ไม่พบ H1 - ควรมี 1 H1 ต่อหน้า');
  } else if (h1Count > 1) {
    score -= 20;
    warnings.push(`พบ ${h1Count} H1 - ควรมีแค่ 1 อัน`);
  }
  
  if (h2Count === 0 && h1Count > 0) {
    score -= 10;
    warnings.push('ควรมี H2 ย่อยอย่างน้อย 1 อัน');
  }
  
  return {
    found: h1Count > 0,
    score: Math.max(0, score),
    count: h1Count + h2Count + h3Count,
    details: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
    data: { h1: h1Count, h2: h2Count, h3: h3Count },
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ==================== 8. FAQ/QA Blocks - 5% ====================
function checkFAQBlocks(html: string): CheckResult {
  // Check for FAQPage schema
  const hasFAQSchema = html.includes('"@type": "FAQPage"') || html.includes('"@type":"FAQPage"');
  
  // Check for common FAQ patterns
  const faqPatterns = [
    /<details\s*>/i,
    /class="[^"]*faq/i,
    /class="[^"]*accordion/i,
    /<h[2-4][^>]*>.*(คำถาม|FAQ|ถามบ่อย|Q&A).*/i,
    /class="[^"]*question/i
  ];
  
  let patternMatches = 0;
  faqPatterns.forEach(pattern => {
    if (pattern.test(html)) patternMatches++;
  });
  
  let score = 0;
  if (hasFAQSchema) score = 100;
  else if (patternMatches >= 2) score = 60;
  else if (patternMatches === 1) score = 40;
  else score = 0;
  
  return {
    found: hasFAQSchema || patternMatches > 0,
    score,
    details: hasFAQSchema 
      ? 'พบ FAQPage Schema'
      : patternMatches > 0 
        ? `พบรูปแบบ FAQ (${patternMatches} patterns)`
        : 'ไม่พบ FAQ/QA blocks',
    data: { hasFAQSchema, patternMatches }
  };
}

// ==================== 9. Page Speed - 5% ====================
async function checkPageSpeed(url: string): Promise<CheckResult> {
  try {
    // ใช้ Google PageSpeed Insights API (ต้องมี API Key)
    // สำหรับตอนนี้จำลองผลลัพธ์ หรือใช้ fetch time ประเมิน
    const startTime = Date.now();
    const response = await fetch(url, { 
      method: 'GET',
      next: { revalidate: 0 }
    });
    const loadTime = Date.now() - startTime;
    
    let score = 0;
    if (loadTime < 1000) score = 100;
    else if (loadTime < 2000) score = 80;
    else if (loadTime < 3000) score = 60;
    else if (loadTime < 5000) score = 40;
    else score = 20;
    
    return {
      found: true,
      score,
      details: `โหลดหน้าเว็บ ${loadTime}ms`,
      data: { loadTime, note: 'ใช้ Google PSI API สำหรับผลลัพธ์ที่แม่นยำกว่า' },
      warnings: loadTime > 3000 ? ['เว็บโหลดช้า ควรปรับปรุง'] : undefined
    };
  } catch (error) {
    return {
      found: false,
      score: 0,
      details: 'ไม่สามารถวัดความเร็วได้',
      data: {}
    };
  }
}

// ==================== 10. Author Authority - 5% ====================
function checkAuthorAuthority(html: string): CheckResult {
  const checks = {
    hasAuthor: /<meta[^>]*name="author"[^>]*>/i.test(html) || /class="[^"]*author/i.test(html),
    hasPublisher: /<meta[^>]*name="publisher"[^>]*>/i.test(html) || html.includes('"@type": "Organization"'),
    hasByline: /(เขียนโดย|by|author)/i.test(html) && (/class="[^"]*byline/i.test(html) || /<span[^>]*class="[^"]*author/i.test(html)),
    hasAuthorBio: /(ประวัติ|bio|about.*author)/i.test(html) && /class="[^"]*bio/i.test(html)
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const score = (passedChecks / 4) * 100;
  
  const warnings: string[] = [];
  if (!checks.hasAuthor) warnings.push('ควาระบุชื่อผู้เขียน');
  if (!checks.hasPublisher) warnings.push('ควาระบุ Publisher/Organization');
  
  return {
    found: passedChecks >= 2,
    score,
    details: `Author: ${checks.hasAuthor ? '✓' : '✗'}, Publisher: ${checks.hasPublisher ? '✓' : '✗'}, Byline: ${checks.hasByline ? '✓' : '✗'}, Bio: ${checks.hasAuthorBio ? '✓' : '✗'}`,
    data: checks,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// คำนวณคะแนนรวม
function calculateOverallScore(checks: CheckResponse['checks']): number {
  const weights = {
    schema: 20,
    robotsTxt: 15,
    llmsTxt: 15,
    sitemap: 10,
    openGraph: 15,
    semanticHTML: 5,
    headingHierarchy: 5,
    faqBlocks: 5,
    pageSpeed: 5,
    authorAuthority: 5
  };
  
  let totalScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    const check = checks[key as keyof typeof checks];
    totalScore += (check.score || 0) * (weight / 100);
  }
  
  return Math.round(totalScore);
}

// กำหนดเกรด
function getGrade(score: number): CheckResponse['grade'] {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

// สร้างคำแนะนำ
function generateRecommendations(checks: CheckResponse['checks']): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (!checks.schema.found || checks.schema.score! < 80) {
    recommendations.push({
      priority: 'critical',
      category: 'Schema.org',
      message: 'ไม่พบ Schema.org JSON-LD หรือไม่สมบูรณ์',
      action: 'ติดตั้ง Schema.org JSON-LD (Organization, WebSite)'
    });
  }
  
  if (!checks.llmsTxt.found) {
    recommendations.push({
      priority: 'high',
      category: 'llms.txt',
      message: 'ไม่พบไฟล์ llms.txt',
      action: 'สร้างไฟล์ llms.txt ตามมาตรฐานใหม่ของ Answer.AI'
    });
  }
  
  if (!checks.robotsTxt.found) {
    recommendations.push({
      priority: 'critical',
      category: 'robots.txt',
      message: 'ไม่พบ robots.txt',
      action: 'สร้างไฟล์ robots.txt และระบุ Sitemap'
    });
  } else if (checks.robotsTxt.warnings?.some(w => w.includes('GPTBot'))) {
    recommendations.push({
      priority: 'high',
      category: 'robots.txt',
      message: 'อาจบล็อค AI crawlers',
      action: 'ตรวจสอบว่าไม่ได้บล็อค GPTBot, ChatGPT-User'
    });
  }
  
  if (!checks.sitemap.found) {
    recommendations.push({
      priority: 'high',
      category: 'Sitemap',
      message: 'ไม่พบ Sitemap.xml',
      action: 'สร้าง Sitemap.xml และระบุใน robots.txt'
    });
  }
  
  if (!checks.openGraph.found || checks.openGraph.score! < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Open Graph',
      message: 'Open Graph ไม่สมบูรณ์',
      action: 'เพิ่ม og:title, og:description, og:image, og:type'
    });
  }
  
  if (!checks.semanticHTML.found) {
    recommendations.push({
      priority: 'medium',
      category: 'Semantic HTML',
      message: 'ใช้ <div> มากเกินไป',
      action: 'ใช้ semantic elements: <header>, <main>, <article>, <section>'
    });
  }
  
  if (checks.headingHierarchy.warnings?.some(w => w.includes('H1'))) {
    recommendations.push({
      priority: 'medium',
      category: 'Headings',
      message: 'Heading Hierarchy มีปัญหา',
      action: 'ควรมี 1 H1, ตามด้วย H2, H3 ตามลำดับ'
    });
  }
  
  if (!checks.faqBlocks.found) {
    recommendations.push({
      priority: 'low',
      category: 'FAQ',
      message: 'ไม่พบ FAQ/QA blocks',
      action: 'เพิ่ม FAQ Schema และรูปแบบคำถาม-คำตอบ'
    });
  }
  
  if (checks.pageSpeed.score! < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Performance',
      message: 'เว็บไซต์โหลดช้า',
      action: 'ปรับปรุง Core Web Vitals, optimize images'
    });
  }
  
  if (!checks.authorAuthority.found) {
    recommendations.push({
      priority: 'low',
      category: 'EEAT',
      message: 'ไม่พบข้อมูลผู้เขียน',
      action: 'เพิ่ม Author meta, Publisher info ตามหลัก EEAT'
    });
  }
  
  return recommendations;
}

// API Route Handler
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'กรุณาระบุ URL' },
        { status: 400 }
      );
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    // Fetch HTML ครั้งเดียว
    const pageResponse = await fetch(normalizedUrl, { 
      method: 'GET',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
        'Accept': 'text/html'
      },
      next: { revalidate: 0 }
    });
    
    if (!pageResponse.ok) {
      return NextResponse.json(
        { error: `ไม่สามารถเข้าถึงเว็บไซต์ได้ (${pageResponse.status})` },
        { status: 400 }
      );
    }
    
    const html = await pageResponse.text();
    
    // รันทุกการตรวจสอบ
    const [
      schemaResult,
      robotsResult,
      llmsResult,
      sitemapResult,
      ogResult,
      semanticResult,
      headingResult,
      faqResult,
      speedResult,
      authorResult
    ] = await Promise.all([
      checkSchema(normalizedUrl, html),
      checkRobotsTxt(normalizedUrl),
      checkLlmsTxt(normalizedUrl),
      checkSitemap(normalizedUrl, undefined),
      Promise.resolve(checkOpenGraph(html)),
      Promise.resolve(checkSemanticHTML(html)),
      Promise.resolve(checkHeadingHierarchy(html)),
      Promise.resolve(checkFAQBlocks(html)),
      checkPageSpeed(normalizedUrl),
      Promise.resolve(checkAuthorAuthority(html))
    ]);
    
    // ถ้ามี robots.txt ให้ตรวจ sitemap อีกครั้งด้วยข้อมูลจาก robots
    if (robotsResult.found && robotsResult.data?.content) {
      const updatedSitemap = await checkSitemap(normalizedUrl, robotsResult.data.content);
      if (updatedSitemap.found) {
        sitemapResult.data = { ...sitemapResult.data, ...updatedSitemap.data };
      }
    }
    
    const checks = {
      schema: schemaResult,
      robotsTxt: robotsResult,
      llmsTxt: llmsResult,
      sitemap: sitemapResult,
      openGraph: ogResult,
      semanticHTML: semanticResult,
      headingHierarchy: headingResult,
      faqBlocks: faqResult,
      pageSpeed: speedResult,
      authorAuthority: authorResult
    };
    
    const overallScore = calculateOverallScore(checks);
    const grade = getGrade(overallScore);
    const recommendations = generateRecommendations(checks);
    
    // นับสถิติ
    const passed = Object.values(checks).filter(c => c.score! >= 70).length;
    const warning = Object.values(checks).filter(c => c.score! >= 50 && c.score! < 70).length;
    const failed = Object.values(checks).filter(c => c.score! < 50).length;
    
    const response: CheckResponse = {
      url: normalizedUrl,
      overallScore,
      grade,
      checks,
      recommendations,
      summary: {
        passed,
        warning,
        failed,
        total: 10
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
}
