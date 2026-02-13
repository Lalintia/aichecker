import type { CheckResponse, CheckType, GradeInfo, StatusInfo, CheckLabel } from '@/lib/types/checker';

export type { CheckType, CheckLabel } from '@/lib/types/checker';

export const checkLabels: Record<CheckType, CheckLabel> = {
  schema: {
    title: 'Schema.org (JSON-LD)',
    description: 'Structured data for AI to understand content',
    weight: 25,
  },
  robotsTxt: {
    title: 'robots.txt',
    description: 'Tells AI which pages to access',
    weight: 20,
  },
  llmsTxt: {
    title: 'llms.txt',
    description: 'Data usage policy for AI',
    weight: 5,
  },
  sitemap: {
    title: 'Sitemap.xml',
    description: 'Site map for AI discovery',
    weight: 15,
  },
  openGraph: {
    title: 'Open Graph & Twitter Cards',
    description: 'Meta tags for preview display (social only)',
    weight: 0,
  },
  semanticHTML: {
    title: 'Semantic HTML',
    description: 'Meaningful HTML structure',
    weight: 10,
  },
  headingHierarchy: {
    title: 'Heading Hierarchy',
    description: 'Clear H1 → H2 → H3 order',
    weight: 10,
  },
  faqBlocks: {
    title: 'FAQ/QA Blocks',
    description: 'Question-answer format for AI',
    weight: 3,
  },
  pageSpeed: {
    title: 'Page Speed',
    description: 'Page loading performance',
    weight: 10,
  },
  authorAuthority: {
    title: 'Author Authority (EEAT)',
    description: 'Author info and credibility',
    weight: 2,
  },
};

export function getGradeLabel(grade: CheckResponse['grade']): GradeInfo {
  switch (grade) {
    case 'excellent':
      return { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-50' };
    case 'good':
      return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    case 'fair':
      return { label: 'Fair', color: 'text-amber-600', bgColor: 'bg-amber-50' };
    case 'poor':
      return { label: 'Needs Work', color: 'text-rose-600', bgColor: 'bg-rose-50' };
  }
}

export function getStatusInfo(score: number, found: boolean): StatusInfo {
  if (score >= 80) {
    return { status: 'good', label: 'Present', icon: '✓' };
  } else if (score >= 50 || found) {
    return { status: 'partial', label: 'Partial', icon: '~' };
  } else {
    return { status: 'missing', label: 'Missing', icon: '×' };
  }
}

export function getPriorityColor(priority: 'critical' | 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'critical':
      return 'bg-rose-100 text-rose-700';
    case 'high':
      return 'bg-orange-100 text-orange-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'low':
      return 'bg-blue-100 text-blue-700';
  }
}

export function getPriorityLabel(priority: 'critical' | 'high' | 'medium' | 'low'): string {
  const labels: Record<typeof priority, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };
  return labels[priority];
}
