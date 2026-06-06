// Cloudflare Pages advanced mode Worker — per-request CSP nonce injection.
//
// The current Cloudflare deployment serves site/ as the published output and
// does not invoke Pages Functions. Advanced mode runs from the output directory
// and proxies static assets through env.ASSETS.

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

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
  },
};
