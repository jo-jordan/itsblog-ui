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

## 实用工具

A toolbox of calendar and time utilities in the Dock: 黄历, 万年历 (with official holidays and 调休), 农历公历互转, 二十四节气, 法定节假日, date differences and shifting (incl. working days), countdowns, age and 八字, ISO weeks, timestamps, world clock and time-zone conversion, durations, cron expressions, and a stopwatch / timer / 番茄钟. Lunar data comes from [lunar-javascript](https://github.com/6tail/lunar-javascript); bump it each year for the new holiday arrangement.

## Footprints (足迹)

The 足迹 app records places you've been: a map, an album and a timeline, each place with visits, a Markdown story and photos. Data lives in Cloudflare D1, photos in R2.

The map uses OpenStreetMap's tiles, which need no key. For CARTO's Voyager style instead, request a free key at <https://carto.com/basemaps/apikey> and add it as the build variable `VUE_APP_CARTO_KEY` (Workers & Pages → `itsblog` → Settings → Build → Variables and secrets), then redeploy. Place search in the editor uses OpenStreetMap Nominatim (no key).

To edit, set a password once: Cloudflare dashboard → Workers & Pages → `itsblog` → Settings → Variables and Secrets → add a **Secret** named `ADMIN_PASSWORD` (or `npx wrangler secret put ADMIN_PASSWORD`). Then on the site choose  → 登录… — the 足迹 window gains 新地点… / 编辑… / 删除… and photo upload.

## Development

Vue 3 + Vite, with Pinia, vue-router and vue-i18n (简体中文 / English); needs Node 22.

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
