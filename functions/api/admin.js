import { json, listByPrefix, noStore } from '../../lib/shared.js';

function authorised(request, env) {
  const key = request.headers.get('x-admin-key') || '';
  return env.ADMIN_KEY && key.length > 0 && key === env.ADMIN_KEY;
}

// GET /api/admin -> pending and approved lists
export async function onRequestGet({ request, env }) {
  const missing = noStore(env); if (missing) { return missing; }
  if (!authorised(request, env)) { return json({ error: 'Wrong key.' }, 401); }
  return json({
    pending: await listByPrefix(env.TESTIMONIALS, 'pending:'),
    approved: await listByPrefix(env.TESTIMONIALS, 'approved:')
  });
}

// POST /api/admin {id, action: approve|reject|remove}
export async function onRequestPost({ request, env }) {
  const missing = noStore(env); if (missing) { return missing; }
  if (!authorised(request, env)) { return json({ error: 'Wrong key.' }, 401); }
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'Invalid request.' }, 400); }
  const id = String(body.id || '').replace(/[^a-z0-9]/gi, '');
  const kv = env.TESTIMONIALS;
  if (body.action === 'approve') {
    const item = await kv.get('pending:' + id, 'json');
    if (!item) { return json({ error: 'Not found.' }, 404); }
    item.approvedAt = new Date().toISOString();
    await kv.put('approved:' + id, JSON.stringify(item));
    await kv.delete('pending:' + id);
  } else if (body.action === 'reject') {
    await kv.delete('pending:' + id);
  } else if (body.action === 'remove') {
    await kv.delete('approved:' + id);
  } else { return json({ error: 'Unknown action.' }, 400); }
  return json({ ok: true });
}
