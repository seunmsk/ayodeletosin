import { json, clean, listByPrefix, noStore } from '../../lib/shared.js';

// GET /api/testimonials  -> approved testimonials (public)
export async function onRequestGet({ env }) {
  if (!env.TESTIMONIALS) { return json({ testimonials: [] }); }
  const items = await listByPrefix(env.TESTIMONIALS, 'approved:');
  return json({ testimonials: items.map(({ id, quote, name, role }) => ({ id, quote, name, role })) });
}

// POST /api/testimonials  -> new submission, stored as pending until approved
export async function onRequestPost({ request, env }) {
  const missing = noStore(env); if (missing) { return missing; }
  let body;
  try { body = await request.json(); } catch (e) { return json({ error: 'Invalid request.' }, 400); }
  if (body.website) { return json({ ok: true }); } // honeypot: silently drop bots
  const name = clean(body.name, 80);
  const title = clean(body.title, 80);
  const organisation = clean(body.organisation, 100);
  const relationship = clean(body.relationship, 120);
  const quote = clean(body.quote, 700);
  const email = clean(body.email, 120);
  if (name.length < 2 || quote.length < 20 || !body.consent) {
    return json({ error: 'Please add your name, a testimonial of at least 20 characters, and tick the consent box.' }, 400);
  }
  // basic rate limit: 3 submissions per IP per day
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rlKey = 'rl:' + ip + ':' + new Date().toISOString().slice(0, 10);
  const count = parseInt((await env.TESTIMONIALS.get(rlKey)) || '0', 10);
  if (count >= 3) { return json({ error: 'Thank you. We have already received your submission today.' }, 429); }
  await env.TESTIMONIALS.put(rlKey, String(count + 1), { expirationTtl: 86400 });

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const role = [title, organisation].filter(Boolean).join(', ');
  const item = { id, name, title, organisation, role, relationship, quote, email, createdAt: new Date().toISOString() };
  await env.TESTIMONIALS.put('pending:' + id, JSON.stringify(item));
  return json({ ok: true });
}
