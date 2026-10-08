# itsblog

💻 A Mac OS X (Aqua) style personal blog — [edgeless.me](https://edgeless.me)

## Writing posts

Add a Markdown file to `content/posts/`. The file name becomes the URL (`/posts/<file-name>`):

```markdown
---
title: 文章标题
date: 2026-10-08
category: 分类
tags: [标签一, 标签二]
summary: 一句话简介，Sherlock 和 Finder 里会用到。
---

正文……
```

## Footprints (足迹)

The 足迹 app records places you've been: a map, an album and a timeline, each place with visits, a Markdown story and photos. Data lives in Cloudflare D1, photos in R2.

To edit, set a password once: Cloudflare dashboard → Workers & Pages → `itsblog` → Settings → Variables and Secrets → add a **Secret** named `ADMIN_PASSWORD` (or `npx wrangler secret put ADMIN_PASSWORD`). Then on the site choose  → 登录… — the 足迹 window gains 新地点… / 编辑… / 删除… and photo upload.

## Development

```bash
npm ci
npm run serve   # dev server on http://localhost:9528
npm run build   # production build into ./itsblog-ui
npm run lint
```

For the API locally: create `.dev.vars` with `ADMIN_PASSWORD=something`, run `npx wrangler d1 migrations apply itsblog-db --local`, `npm run build` and `npx wrangler dev` (http://localhost:8787). `npm run serve` proxies `/api` and `/media` to it.

## Deployment

The site is deployed as a static [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) project (`wrangler.jsonc`), served at `edgeless.me`; a tiny Worker (`worker/index.js`) redirects `www.` to the apex.
Workers Builds is connected to this repository and deploys every push to `master`:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

To deploy manually: `npx wrangler login && npm run deploy`.
