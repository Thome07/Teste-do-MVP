import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * SENTRY Cyber - Selective Edge Teleportation Middleware
 * 99% legitimate traffic passes with 0ms overhead (fail-open).
 * Traps, cryptographically signed honeytokens, and quarantined sessions are transparently rewritten to SENTRY Engine.
 */
const SENTRY_SITE_KEY = process.env.SENTRY_SITE_KEY || '';
const SENTRY_ENGINE_URL = process.env.SENTRY_ENGINE_URL || 'https://sentry-proxy.onrender.com';
const SENTRY_MODE = process.env.SENTRY_MODE || 'shadow';

const TRAP_ROUTES = [
  '/.env',
  '/.git',
  '/.git/config',
  '/wp-login.php',
  '/actuator',
  '/actuator/health',
  '/api/v2/internal',
  '/_s/canary',
  '/admin/config.php',
  '/eval-stdin.php'
];

// Quarentena Leve na Borda em Memória (15 minutos / 900s)
const QUARANTINE_CACHE = new Map<string, number>();
const QUARANTINE_TTL_MS = 15 * 60 * 1000;

function isQuarantinedIP(ip: string): boolean {
  if (!ip) return false;
  const exp = QUARANTINE_CACHE.get(ip);
  if (!exp) return false;
  if (Date.now() > exp) {
    QUARANTINE_CACHE.delete(ip);
    return false;
  }
  return true;
}

function recordQuarantineIP(ip: string): void {
  if (!ip) return;
  if (QUARANTINE_CACHE.size >= 5000) {
    const firstKey = QUARANTINE_CACHE.keys().next().value;
    if (firstKey) QUARANTINE_CACHE.delete(firstKey);
  }
  QUARANTINE_CACHE.set(ip, Date.now() + QUARANTINE_TTL_MS);
}

// Verificação Criptográfica de Honeytokens (HMAC-SHA256)
async function verifyHoneytokenHMAC(token: string, tenantId: string, secret: string): Promise<boolean> {
  if (!token || typeof token !== 'string' || token.length < 32 || token.length > 256) return false;
  let remainder = '';
  if (token.startsWith('snt_ht_v1_')) remainder = token.substring(10);
  else if (token.startsWith('sk_live_snt_v1_')) remainder = token.substring(15);
  else if (token.startsWith('sk_live_snt_')) return true; // Legado transitório
  else return false;

  const parts = remainder.split('_');
  if (parts.length !== 3) return false;
  const [keyVersion, tokenId, sigHex] = parts;
  if (!sigHex || sigHex.length !== 64) return false;

  try {
    const enc = new TextEncoder();
    const payload = 'v1:' + tenantId + ':' + keyVersion + ':' + tokenId;
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
    const expectedHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (sigHex.length !== expectedHex.length) return false;
    let diff = 0;
    for (let i = 0; i < sigHex.length; i++) {
      diff |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return diff === 0;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  // Preserve application availability until the server environment is configured.
  if (!SENTRY_SITE_KEY) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || (req as any).ip || '127.0.0.1';
  const cookieQuarantined = req.cookies.get('sentry_trap')?.value === '1';
  const ipQuarantined = isQuarantinedIP(clientIp);
  const isQuarantined = cookieQuarantined || ipQuarantined;

  const isTrapRoute = TRAP_ROUTES.some(trap => pathname.startsWith(trap));

  let hasHoneytoken = false;
  const authHeader = req.headers.get('authorization') || '';
  const apiKeyHeader = req.headers.get('x-api-key') || '';

  if (authHeader) {
    const candidate = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (await verifyHoneytokenHMAC(candidate, SENTRY_SITE_KEY, SENTRY_SITE_KEY)) {
      hasHoneytoken = true;
    }
  }
  if (!hasHoneytoken && apiKeyHeader) {
    if (await verifyHoneytokenHMAC(apiKeyHeader.trim(), SENTRY_SITE_KEY, SENTRY_SITE_KEY)) {
      hasHoneytoken = true;
    }
  }
  if (!hasHoneytoken && req.nextUrl.search.includes('sk_live_snt_')) {
    for (const [, val] of req.nextUrl.searchParams.entries()) {
      if (await verifyHoneytokenHMAC(val, SENTRY_SITE_KEY, SENTRY_SITE_KEY)) {
        hasHoneytoken = true;
        break;
      }
    }
  }

  // Registra quarentena se tocou em trap ou usou honeytoken
  if (isTrapRoute || hasHoneytoken) {
    recordQuarantineIP(clientIp);
  }

  // Selective Edge Teleportation to SENTRY Go Engine
  if (isTrapRoute || isQuarantined || hasHoneytoken) {
    // Em modo Shadow, não bloqueia rotas legítimas (apenas teletransporta armadilhas reais)
    if (SENTRY_MODE === 'shadow' && !isTrapRoute) {
      const shadowResp = NextResponse.next();
      shadowResp.headers.set('X-Sentry-Shadow-Observed', '1');
      return shadowResp;
    }

    try {
      const targetUrl = new URL(pathname + req.nextUrl.search, SENTRY_ENGINE_URL);

      const headers = new Headers(req.headers);
      headers.set('X-Sentry-Tenant-Key', SENTRY_SITE_KEY);
      headers.set('X-Sentry-Original-Host', req.nextUrl.host);
      headers.set('X-Sentry-Client-IP', clientIp);
      headers.set('X-Sentry-Session-Start', Date.now().toString());

      const res = await fetch(targetUrl.toString(), {
        method: req.method,
        headers,
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
        redirect: 'manual'
      });

      const responseHeaders = new Headers(res.headers);
      if (!cookieQuarantined) {
        responseHeaders.set('Set-Cookie', 'sentry_trap=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400');
      }

      return new NextResponse(res.body, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err) {
      // Fail-open: do not disrupt legitimate application on engine failure
      console.error('[SENTRY Edge Teleportation Error]:', err);
      return NextResponse.next();
    }
  }

  // Legitimate user: Injeta Canary Headers leves e script first-party
  const res = NextResponse.next();
  res.headers.set('X-Sentry-Canary-Endpoint', '/_s/canary/v1');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
