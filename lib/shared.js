export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export async function listByPrefix(kv, prefix) {
  const out = []; let cursor;
  do {
    const page = await kv.list({ prefix, cursor });
    for (const k of page.keys) { const v = await kv.get(k.name, 'json'); if (v) { out.push(v); } }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return out.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function noStore(env) {
  return !env.TESTIMONIALS ? json({ error: 'Storage is not connected yet.' }, 503) : null;
}

export function isAdmin(request, env) {
  const key = request.headers.get('x-admin-key') || '';
  return !!env.ADMIN_KEY && key.length > 0 && key === env.ADMIN_KEY;
}

// ---- GitHub contents API (content is saved to the repo; Cloudflare rebuilds the site) ----
const b64enc = (str) => { const bytes = new TextEncoder().encode(str); let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) { bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); } return btoa(bin); };
const b64dec = (b64) => { const bin = atob(b64.replace(/\n/g, '')); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) { bytes[i] = bin.charCodeAt(i); } return new TextDecoder().decode(bytes); };

function gh(env) {
  const api = env.GITHUB_API || 'https://api.github.com';
  const repo = env.GITHUB_REPO || 'seunmsk/ayodeletosin';
  const branch = env.GITHUB_BRANCH || 'main';
  const headers = { 'authorization': 'Bearer ' + env.GITHUB_TOKEN, 'accept': 'application/vnd.github+json', 'user-agent': 'ayodeletosin-admin', 'x-github-api-version': '2022-11-28' };
  const url = (path) => `${api}/repos/${repo}/contents/${path}`;
  return {
    async get(path) {
      const r = await fetch(url(path) + '?ref=' + branch, { headers });
      if (r.status === 404) { return null; }
      if (!r.ok) { throw new Error('GitHub read failed (' + r.status + ')'); }
      const j = await r.json();
      return { sha: j.sha, text: j.content ? b64dec(j.content) : '' };
    },
    async put(path, { text, base64 }, message) {
      const cur = await this.get(path);
      const body = { message, branch, content: base64 || b64enc(text) };
      if (cur) { body.sha = cur.sha; }
      const r = await fetch(url(path), { method: 'PUT', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) { throw new Error('GitHub save failed (' + r.status + '): ' + (await r.text()).slice(0, 200)); }
      return true;
    }
  };
}
export { gh };
