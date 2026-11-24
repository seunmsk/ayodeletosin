#!/usr/bin/env python3
"""Builds index.html and ideas/*.html from content/*.json and templates/.
Run: python3 build.py   (Cloudflare Pages runs this on every deploy)."""
import json, re, html, hashlib, os, glob

ROOT = os.path.dirname(os.path.abspath(__file__))
def p(*a): return os.path.join(ROOT, *a)
def e(x): return html.escape(str(x or ''), quote=True)

site = json.load(open(p('content/site.json'), encoding='utf-8'))
arts = json.load(open(p('content/articles.json'), encoding='utf-8'))['articles']
V = hashlib.md5(open(p('styles.css'), 'rb').read() + open(p('script.js'), 'rb').read()).hexdigest()[:8]

TAGS = {'measured': 'tag-measured', 'realised': 'tag-realised', 'realized': 'tag-realised', 'calculated': 'tag-calculated',
        'projected': 'tag-projected', 'observed': 'tag-observed', 'proposed': 'tag-proposed'}
def tagclass(t):
    k = (t or '').strip().lower()
    return TAGS.get(k, 'tag-verified' if 'academic' in k or 'record' in k or 'verified' in k else 'tag-observed')

ICONS = [
 '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 10h.01M15 10h.01"/></svg>',
 '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 12-4 16-9 16z"/><path d="M4 20l8-8"/></svg>',
 '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M15 15.5c2.8-.6 6 1 6 4.5"/></svg>']

def number_html(n):
    n = str(n or '').strip()
    m = re.match(r'^(\d+)(%|\s*(?:months?|yrs?|years?|x))?$', n)
    if m:
        return f'<span class="ev-num" data-count="{m.group(1)}" data-suffix="{e(m.group(2) or "")}">{e(n)}</span>'
    m = re.match(r'^([\d.,$€£₦]+)\s*(/.*|of .*)$', n)
    if m:
        rest = m.group(2); rest = rest if rest.startswith('/') else ' ' + rest
        return f'<span class="ev-num">{e(m.group(1))}<small>{e(rest)}</small></span>'
    return f'<span class="ev-num">{e(n)}</span>'

def big_html(b):
    m = re.match(r'^([\d.]+)(/.*)$', str(b or ''))
    return f'{e(m.group(1))}<small>{e(m.group(2))}</small>' if m else e(b)

def inline(t):
    t = e(t)
    t = re.sub(r'\[([^\]]+)\]\((https?://[^)\s]+)\)', lambda m: (
        f'<a class="src" href="{m.group(2)}" target="_blank" rel="noopener">{m.group(1)}</a>' if (' ' not in m.group(1) and '.' in m.group(1))
        else f'<a href="{m.group(2)}" target="_blank" rel="noopener">{m.group(1)}</a>'), t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', t)
    return t

def md(body):
    out = []
    for block in re.split(r'\n\s*\n', (body or '').strip()):
        b = block.strip()
        if not b: continue
        if b.startswith('## '): out.append(f'<h2>{inline(b[3:].strip())}</h2>')
        elif b.startswith('> '): out.append(f'<p class="pull">{inline(b[2:].strip())}</p>')
        else: out.append(f'<p>{inline(" ".join(l.strip() for l in b.splitlines()))}</p>')
    return '\n'.join(out)

def words(body): return len(re.sub(r'[#>*\[\]()]', ' ', body or '').split())

# ---------- HOME ----------
h = site['hero']
HERO_TOP = (f'<p class="kicker">{e(h["kicker"])}</p>\n      <h1>{e(h["name"])}</h1>\n'
            f'      <p class="lead">{e(h["lead"])}</p>')
HERO_BOTTOM = (f'<p class="creds">{e(h["credentials"])}</p>\n' + (f'      <p class="now">{e(h["currentRole"])}</p>\n' if h.get('currentRole') else '')
               + '    </div>')
HERO_PHOTO = f'<img src="{e(h["photo"])}" alt="Portrait of {e(h["name"])}" width="896" height="1075">'

EVIDENCE = ''.join(f'\n      <div class="ev">\n        {number_html(x["number"])}\n        <span class="ev-label">{e(x["label"])}</span>\n'
                   + (f'        <span class="tag {tagclass(x.get("tag"))}">{e(x["tag"])}</span>\n' if x.get('tag') else '') + '      </div>'
                   for x in site['evidence']) + '\n    '

PILLARS = ''.join(f'\n    <article class="pillar reveal">\n      {ICONS[i % 3]}\n      <h2>{e(x["title"])}</h2>\n      <p>{e(x["text"])}</p>\n    </article>'
                  for i, x in enumerate(site['pillars'])) + '\n  '

def media_html(m):
    cap = f'<figcaption>{e(m.get("caption"))}</figcaption>' if m.get('caption') else ''
    if m.get('type') == 'video':
        return (f'<figure class="vid{" vid-wide" if m.get("wide") else ""}"><video src="{e(m["src"])}" poster="{e(m.get("poster"))}" muted loop playsinline preload="metadata" aria-label="{e(m.get("alt"))}"></video>'
                f'<button type="button" class="vid-btn" aria-label="Pause video"><span aria-hidden="true">❚❚</span></button>{cap}</figure>')
    return f'<figure><img src="{e(m["src"])}" alt="{e(m.get("alt"))}" width="1050" height="1400" loading="lazy">{cap}</figure>'

st = site['story']
parts = []
media_done = False
for para in st['paragraphs']:
    style = para.get('style', 'normal')
    if style == 'media':
        if st.get('media'):
            parts.append('      <div class="story-photos hs" data-hs-label="Story photos and videos">\n        ' + '\n        '.join(media_html(m) for m in st['media']) + '\n      </div>')
        media_done = True; continue
    cls = {'intro': ' class="story-lead"', 'turn': ' class="story-break"'}.get(style, '')
    parts.append(f'      <p{cls}>{e(para["text"])}</p>')
if not media_done and st.get('media'):
    parts.append('      <div class="story-photos hs" data-hs-label="Story photos and videos">\n        ' + '\n        '.join(media_html(m) for m in st['media']) + '\n      </div>')
STORY = (f'    <div class="sec-head">\n      <p class="eyebrow">{e(st.get("eyebrow") or "My Story")}</p>\n      <h2>{e(st["title"])}</h2>\n    </div>\n'
         f'    <div class="story-body">\n' + '\n'.join(parts) + '\n    </div>')

EXPERIENCE = ''.join(f'<li class="tl reveal{" current" if r.get("current") else ""}"><span class="tl-date">{e(r["dates"])}</span><h4>{e(r["title"])}</h4>'
                     f'<span class="tl-org">{e(r["organisation"])}</span><p>{e(r["text"])}</p></li>' for r in site['experience'])

ed = site['education']
EDUCATION = (f'<article class="edu-card reveal">\n        <p class="edu-school">{e(ed["school"])}</p>\n        <h3>{e(ed["degree"])}</h3>\n        <div class="edu-facts">\n'
             + ''.join(f'          <div><span class="big">{big_html(f["big"])}</span><span>{e(f["small"])}</span></div>\n' for f in ed['facts'])
             + f'        </div>\n        <p>{e(ed["text"])}</p>\n      </article>')

CERTS = ''.join(f'\n      <div class="cert reveal"><span class="cert-code">{e(c["code"])}</span><div><strong>{e(c["name"])}</strong><span>{e(c["detail"])}</span></div></div>'
                for c in site['certifications']) + '\n    '

g = site['gallery']
GALLERY = (f'<div class="community">\n      <div class="community-head">\n        <h3 class="sub-h">{e(g["title"])}</h3>\n        <p>{e(g["intro"])}</p>\n      </div>\n'
           '      <div class="gallery hs" data-hs-label="Gallery photos">\n'
           + ''.join(f'        <figure class="{"g-wide " if x.get("wide") else ""}reveal"><img src="{e(x["src"])}" alt="{e(x.get("alt"))}" width="1400" height="1050" loading="lazy"><figcaption>{e(x.get("caption"))}</figcaption></figure>\n' for x in g['photos'])
           + '      </div>\n    </div>')

CARDS = []
for i, a in enumerate(arts):
    mins = max(1, round(words(a['body']) / 220))
    cls = 'idea reveal' + (' idea-feature' if i == 0 else '')
    CARDS.append(f'\n      <a class="{cls}" href="ideas/{e(a["slug"])}.html">\n        <span class="idea-status">Article {i+1} · {mins} min read</span>\n'
                 f'        <h3>{e(a["title"])}</h3>\n        <p>{e(a["standfirst"])}</p>\n        <span class="idea-read">Read article <span aria-hidden="true">→</span></span>\n      </a>')
ARTICLE_CARDS = ''.join(CARDS) + '\n    '

c = site['contact']
wa_digits = re.sub(r'\D', '', c.get('whatsapp', ''))
CONTACT = (f'      <p>{e(c["intro"])}</p>\n      <ul class="contact-list">\n'
           + (f'        <li><a href="https://wa.me/{wa_digits}" target="_blank" rel="noopener">WhatsApp: {e(c["whatsapp"])}</a></li>\n' if wa_digits else '')
           + (f'        <li><a href="{e(c["linkedin"])}" target="_blank" rel="noopener">LinkedIn: {e(h["name"])}</a></li>\n' if c.get('linkedin') else '')
           + (f'        <li>{e(c["location"])}</li>\n' if c.get('location') else '') + '      </ul>')

T = json.dumps([{k: t.get(k, '') for k in ('quote', 'name', 'role')} for t in site.get('testimonials', [])], ensure_ascii=False).replace('</', '<\\/')

page = open(p('templates/index.html'), encoding='utf-8').read()
for k, v in {'HERO_TOP': HERO_TOP, 'HERO_BOTTOM': HERO_BOTTOM, 'HERO_PHOTO': HERO_PHOTO, 'EVIDENCE': EVIDENCE, 'EVIDENCE_NOTE': e(site.get('evidenceNote')),
             'PILLARS': PILLARS, 'STORY': STORY, 'EXPERIENCE': EXPERIENCE, 'EDUCATION': EDUCATION, 'CERTS': CERTS, 'GALLERY': GALLERY,
             'ARTICLE_CARDS': ARTICLE_CARDS, 'CONTACT': CONTACT, 'TESTIMONIALS_JSON': T, 'WA': wa_digits, 'V': V}.items():
    page = page.replace('{{' + k + '}}', v)
assert '{{' not in page, re.findall(r'\{\{[A-Z_]+\}\}', page)
open(p('index.html'), 'w', encoding='utf-8').write(page)

# ---------- ARTICLES ----------
tpl = open(p('templates/article.html'), encoding='utf-8').read()
os.makedirs(p('ideas'), exist_ok=True)
keep = set()
n = len(arts)
for i, a in enumerate(arts):
    prev = arts[i - 1] if i > 0 else None; nxt = arts[i + 1] if i < n - 1 else None
    nav = (f'<a class="art-nav prev" href="{e(prev["slug"])}.html"><span>Previous</span>{e(prev["title"])}</a>' if prev else '<span></span>')
    if nxt: nav += f'<a class="art-nav next" href="{e(nxt["slug"])}.html"><span>Next</span>{e(nxt["title"])}</a>'
    hero = ''
    if a.get('image'):
        cls = {'wide': 'art-hero art-hero-wide', 'portrait': 'art-hero art-hero-portrait'}.get(a.get('imageStyle'), 'art-hero')
        cap = f'<figcaption>{e(a["imageCaption"])}</figcaption>' if a.get('imageCaption') else ''
        hero = f'<figure class="{cls}"><img src="../{e(a["image"])}" alt="" width="1600" height="686">{cap}</figure>'
    out = tpl
    for k, v in {'TITLE': e(a['title']), 'STAND': e(a['standfirst']), 'MINS': str(max(1, round(words(a['body']) / 220))), 'BODY': md(a['body']),
                 'NAV': nav, 'SLUG': e(a['slug']), 'HERO': hero, 'NUM': str(i + 1), 'TOTAL': str(n), 'V': V}.items():
        out = out.replace('{{' + k + '}}', v)
    open(p('ideas', a['slug'] + '.html'), 'w', encoding='utf-8').write(out)
    keep.add(a['slug'] + '.html')
for f in glob.glob(p('ideas', '*.html')):
    if os.path.basename(f) not in keep: os.remove(f)

for f in ['testimonial.html', 'admin.html']:
    if os.path.exists(p(f)):
        t = open(p(f), encoding='utf-8').read(); t2 = re.sub(r'styles\.css\?v=[a-z0-9]+', 'styles.css?v=' + V, t)
        if t2 != t: open(p(f), 'w', encoding='utf-8').write(t2)
print(f'Built index.html and {n} articles (v={V})')
