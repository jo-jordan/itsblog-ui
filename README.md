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

## Development

```bash
npm ci
npm run serve   # dev server on http://localhost:9528
npm run build   # production build into ./itsblog-ui
npm run lint
```

## Deployment

The site is deployed as a static [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) project (`wrangler.jsonc`), served at `edgeless.me`; a tiny Worker (`worker/index.js`) redirects `www.` to the apex.
Workers Builds is connected to this repository and deploys every push to `master`:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

To deploy manually: `npx wrangler login && npm run deploy`.
