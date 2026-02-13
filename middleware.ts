import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter, RATE_LIMIT } from './lib/rate-limiter';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Remove X-Powered-By header
  response.headers.delete('X-Powered-By');

  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Get client IP - prefer connection info over headers (prevents spoofing)
    // In production with trusted reverse proxy, use x-forwarded-for
    // For now, use a combination approach that's safer
    const ip = getClientIp(request);

    // Skip per-IP rate limiting when the client IP cannot be determined.
    // In this case, rely on infrastructure-level rate limiting (Nginx/Cloudflare).
    // Keying on 'unknown' would unfairly throttle all such clients with one shared bucket.
    if (ip === 'unknown') {
      return response;
    }

    const result = rateLimiter.check(ip);

    if (!result.allowed) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  }

  return response;
}

/**
 * Get client IP with spoofing protection.
 * Uses x-forwarded-for last entry — the IP appended by the closest trusted reverse proxy
 * (Nginx/Cloudflare). The last entry is the least spoofable since it is added by
 * the server-side proxy, not the client.
 *
 * NOTE: Do NOT trust x-real-ip — it can be freely set by any client.
 */
function getClientIp(request: NextRequest): string {
  // Use x-forwarded-for last entry (appended by trusted reverse proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map((ip) => ip.trim()).filter(isValidIpFormat);
    if (ips.length > 0) {
      return ips[ips.length - 1];
    }
  }

  return 'unknown';
}

/**
 * Basic IP format validation
 */
function isValidIpFormat(ip: string): boolean {
  // Basic validation - reject empty, localhost, or obviously fake values
  if (!ip || ip === 'unknown') return false;
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') return false;
  
  // Check for valid IPv4 or IPv6 format
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^[0-9a-fA-F:]+$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

export const config = {
  matcher: ['/api/:path*', '/'],
};
