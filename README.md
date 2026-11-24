# ayodeletosin.com

Personal website for Tosin Ayodele. Hosted on Cloudflare Pages; every push to `main` goes live.

## How content works
- Page text, career, photos and articles live in `content/site.json` and `content/articles.json`.
- `python3 build.py` turns those plus `templates/` into `index.html` and `ideas/*.html`.
- Tosin edits content at **/admin.html**. Saving commits the JSON (and any uploaded photos in `assets/uploads/`) to this repo, and Cloudflare rebuilds the site.
- People submit testimonials at **/testimonial.html**. They wait in Cloudflare KV until approved in the admin.

## Cloudflare Pages settings
- Build command: `python3 build.py`  ·  Build output directory: `/`
- KV namespace binding: `TESTIMONIALS`
- Environment variables (Production): `ADMIN_KEY` (secret), `GITHUB_TOKEN` (secret, fine-grained token with Contents read/write on this repo only), optional `GITHUB_REPO` (default `seunmsk/ayodeletosin`)
