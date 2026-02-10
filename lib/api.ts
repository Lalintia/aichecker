// API Client สำหรับ AI Search Checker

export interface CheckResult {
  found: boolean;
  details: string;
  count?: number;
  score?: number;
  data?: any;
  warnings?: string[];
}

export interface Recommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  action: string;
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

export type CheckType = keyof CheckResponse['checks'];

// ชื่อแสดงผลสำหรับแต่ละ check
export const checkLabels: Record<CheckType, { title: string; description: string; weight: number }> = {
  schema: {
    title: 'Schema.org (JSON-LD)',
    description: 'โครงสร้างข้อมูลสำหรับ AI เข้าใจเนื้อหา',
    weight: 20
  },
  robotsTxt: {
    title: 'robots.txt',
    description: 'บอก AI ว่าเข้าถึงหน้าไหนได้บ้าง',
    weight: 15
  },
  llmsTxt: {
    title: 'llms.txt',
    description: 'นโยบายการใช้ข้อมูลกับ AI',
    weight: 15
  },
  sitemap: {
    title: 'Sitemap.xml',
    description: 'แผนผังเว็บไซต์สำหรับ AI ค้นหา',
    weight: 10
  },
  openGraph: {
    title: 'Open Graph & Twitter Cards',
    description: 'Meta tags สำหรับแสดงตัวอย่าง',
    weight: 15
  },
  semanticHTML: {
    title: 'Semantic HTML',
    description: 'โครงสร้าง HTML ที่มีความหมาย',
    weight: 5
  },
  headingHierarchy: {
    title: 'Heading Hierarchy',
    description: 'ลำดับ H1 → H2 → H3 ที่ชัดเจน',
    weight: 5
  },
  faqBlocks: {
    title: 'FAQ/QA Blocks',
    description: 'รูปแบบคำถาม-คำตอบสำหรับ AI',
    weight: 5
  },
  pageSpeed: {
    title: 'Page Speed',
    description: 'ความเร็วในการโหลดหน้าเว็บ',
    weight: 5
  },
  authorAuthority: {
    title: 'Author Authority (EEAT)',
    description: 'ข้อมูลผู้เขียนและความน่าเชื่อถือ',
    weight: 5
  }
};

// สีและไอคอนสำหรับแต่ละระดับ
export const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

export const getScoreBg = (score: number): string => {
  if (score >= 80) return 'bg-green-500/20';
  if (score >= 60) return 'bg-yellow-500/20';
  if (score >= 40) return 'bg-orange-500/20';
  return 'bg-red-500/20';
};

export const getGradeLabel = (grade: CheckResponse['grade']): { label: string; color: string } => {
  switch (grade) {
    case 'excellent':
      return { label: 'ยอดเยี่ยม', color: 'text-green-400' };
    case 'good':
      return { label: 'ดี', color: 'text-blue-400' };
    case 'fair':
      return { label: 'พอใช้', color: 'text-yellow-400' };
    case 'poor':
      return { label: 'ต้องปรับปรุง', color: 'text-red-400' };
  }
};

export const getPriorityColor = (priority: Recommendation['priority']): string => {
  switch (priority) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'low':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
};

/**
 * ตรวจสอบเว็บไซต์ว่าพร้อมสำหรับ AI Search หรือไม่
 */
export async function analyzeWebsite(url: string): Promise<CheckResponse> {
  const response = await fetch('/api/check', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'เกิดข้อผิดพลาดในการตรวจสอบ');
  }

  return response.json();
}
