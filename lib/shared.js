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
