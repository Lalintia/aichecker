/**
 * llms.txt Checker
 * Validates llms.txt file existence per Answer.AI standard
 * Weight: 15%
 */

import type { CheckResult } from './base';
import { createSuccessResult, createFailureResult } from './base';

export async function checkLlmsTxt(url: string): Promise<CheckResult> {
  try {
    const urlObj = new URL(url);
    const llmsUrl = `${urlObj.protocol}//${urlObj.host}/llms.txt`;

    const response = await fetch(llmsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AISearchChecker/1.0)',
        Accept: 'text/plain',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return createFailureResult('llms.txt not found (HTTP 404)', {
          url: llmsUrl,
          status: response.status,
        });
      }
      return createFailureResult(`llms.txt returned HTTP ${response.status}`, {
        url: llmsUrl,
        status: response.status,
      });
    }

    const content = await response.text();

    // Basic validation of llms.txt format per Answer.AI standard
    const hasTitle = /^#\s+/m.test(content);
    const hasSections = /##\s+/m.test(content);
    const hasMarkdownLinks = /\[.+\]\(.+\)/.test(content);

    // Check for key sections
    const sections = {
      overview: /^#\s+Overview/im.test(content) || content.toLowerCase().includes('overview'),
      sections: content.match(/^##\s+(.+)$/gm)?.length || 0,
    };

    const data: Record<string, unknown> = {
      url: llmsUrl,
      contentLength: content.length,
      hasTitle,
      hasSections,
      hasMarkdownLinks,
      sections,
      preview: content.substring(0, 500),
    };

    // Score based on content quality
    let score = 100;
    if (!hasTitle) score -= 20;
    if (!hasSections) score -= 20;
    if (!hasMarkdownLinks) score -= 10;
    if (content.length < 100) score -= 20;

    score = Math.max(0, score);

    if (score >= 80) {
      return createSuccessResult('llms.txt found and properly formatted', score, data);
    }

    return createSuccessResult('llms.txt found but could be improved', score, data);
  } catch (error) {
    return createFailureResult('Unable to check llms.txt', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
