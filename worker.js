/** Cloudflare Worker: browser-safe proxy to the existing Apps Script JSON API.
 * Configure Worker variables:
 *   APPS_SCRIPT_URL = the deployed Apps Script /exec URL
 *   ALLOWED_ORIGIN  = exactly https://<github-owner>.github.io
 *                     (or the repository's project Pages origin)
 */
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '';
    const cors = {
      'Access-Control-Allow-Origin': origin && origin === allowedOrigin ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin'
    };
    if (origin !== allowedOrigin || !allowedOrigin) return new Response('Origin tidak diizinkan.', { status: 403, headers: cors });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return new Response('Method tidak diizinkan.', { status: 405, headers: cors });
    if (!env.APPS_SCRIPT_URL || !env.APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/')) {
      return Response.json({ ok: false, error: 'URL Apps Script belum dikonfigurasi.' }, { status: 500, headers: cors });
    }
    try {
      const upstream = await fetch(env.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: await request.text(),
        redirect: 'follow'
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.ok ? 200 : upstream.status,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
      });
    } catch (_) {
      return Response.json({ ok: false, error: 'Tidak dapat menghubungi Apps Script.' }, { status: 502, headers: cors });
    }
  }
};
