// Cloudflare Pages Function — per-request CSP nonce injection.
//
// Google AdSense 공식 CSP 안내는 도메인 allowlist 대신 nonce 기반 strict CSP를 요구한다.
// 정적 _headers 파일만으로는 요청별 nonce를 만들 수 없으므로, HTML 응답에서만
// CSP 헤더와 모든 <script> 태그에 동일한 nonce를 주입한다.

export async function onRequest(context) {
  const response = await context.next();

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const nonce = btoa(binary);

  const csp = [
    "default-src 'self'",
    `script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https:`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https: data:",
    "connect-src 'self' https:",
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const headers = new Headers(response.headers);
  headers.set("content-security-policy", csp);

  return new HTMLRewriter()
    .on("script", {
      element(el) {
        el.setAttribute("nonce", nonce);
      },
    })
    .transform(
      new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    );
}
