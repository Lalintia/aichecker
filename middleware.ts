import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
// For production with multiple instances, use Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 10; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Remove X-Powered-By header
  response.headers.delete('X-Powered-By');

  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      ?? request.headers.get('x-real-ip') 
      ?? 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip);

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + RATE_WINDOW,
      });
    } else {
      // Increment counter
      record.count++;

      if (record.count > RATE_LIMIT) {
        // Rate limit exceeded
        return NextResponse.json(
          {
            error: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
            },
          }
        );
      }
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT));
    response.headers.set(
      'X-RateLimit-Remaining',
      String(Math.max(0, RATE_LIMIT - (record?.count ?? 1)))
    );
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/'],
};
