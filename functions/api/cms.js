import { json, isAdmin, gh } from '../../lib/shared.js';

const FILES = { site: 'content/site.json', articles: 'content/articles.json' };

function ready(env) {
  if (!env.ADMIN_KEY) { return 'ADMIN_KEY is not set in Cloudflare.'; }
  if (!env.GITHUB_TOKEN) { return 'GITHUB_TOKEN is not set in Cloudflare, so changes cannot be saved yet.'; }
  return null;
}

// GET /api/cms -> current site.json and articles.json
export async function onRequestGet({ request, env }) {
  if (!isAdmin(request, env)) { return json({ error: 'Wrong key.' }, 401); }
  const nr = ready(env); if (nr) { return json({ error: nr }, 503); }
  try {
    const g = gh(env);
    const [s, a] = await Promise.all([g.get(FILES.site), g.get(FILES.articles)]);
    return json({ site: JSON.parse(s.text), articles: JSON.parse(a.text) });
  } catch (e) { return json({ error: e.message }, 502); }
}

// POST /api/cms  { action: 'save', file: 'site'|'articles', data }  or  { action: 'upload', name, base64 }
export async function onRequestPost({ request, env }) {
  if (!isAdmin(request, env)) { return json({ error: 'Wrong key.' }, 401); }
  const nr = ready(env); if (nr) { return json({ error: nr }, 503); }
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'Invalid request.' }, 400); }
  const g = gh(env);
  try {
    if (body.action === 'save') {
      const path = FILES[body.file];
      if (!path || typeof body.data !== 'object') { return json({ error: 'Nothing to save.' }, 400); }
      const text = JSON.stringify(body.data, null, 2) + '\n';
      if (text.length > 900000) { return json({ error: 'Content is too large.' }, 413); }
      await g.put(path, { text }, 'Admin: update ' + body.file + (body.note ? ' (' + String(body.note).slice(0, 60) + ')' : ''));
      return json({ ok: true });
    }
    if (body.action === 'upload') {
      const ext = /\.png$/i.test(body.name || '') ? 'png' : 'jpg';
      const slug = String(body.name || 'photo').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'photo';
      const path = `assets/uploads/${Date.now().toString(36)}-${slug}.${ext}`;
      const b64 = String(body.base64 || '').replace(/^data:[^,]+,/, '');
      if (!b64 || b64.length > 6000000) { return json({ error: 'Image missing or larger than 4 MB.' }, 413); }
      await g.put(path, { base64: b64 }, 'Admin: upload ' + path);
      return json({ ok: true, path });
    }
    return json({ error: 'Unknown action.' }, 400);
  } catch (e) { return json({ error: e.message }, 502); }
}
