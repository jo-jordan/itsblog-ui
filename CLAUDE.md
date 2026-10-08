# CLAUDE.md

## Git workflow

- Commit and push directly to `master`. Do not create feature branches or pull requests unless asked.
- Every push to `master` is deployed to production by Cloudflare Workers Builds, so run `npm run build` (and `npm run lint`) before pushing.

## Project

Mac OS X 10.0–10.2 ("Aqua") style personal blog: Vue 2.7 + Vue CLI 4 (webpack 4), Vuex, vue-router (history mode). The Aqua look is the point of the site: new UI must keep to it (pinstripes, gel buttons, traffic lights, Lucida Grande, the original icons in `src/assets`).

- `npm ci` / `npm run serve` (dev server on port 9528) / `npm run build` / `npm run lint`
- Build output goes to `./itsblog-ui` (not `dist`); Node version is pinned in `.node-version` (22).
- Keep `package-lock.json` committed and resolved from registry.npmjs.org. Workers Builds installs with `npm ci`, so after any dependency change confirm `npm ci` succeeds in a clean checkout (a stale `node_modules` hides an out-of-sync lockfile).

## Deployment

- Static site on Cloudflare Workers, configured in `wrangler.jsonc`, served at `edgeless.me` (and `www.edgeless.me`) via Custom Domains.
- `worker/index.js` (Hono) runs before the assets: 301s `www.` to the apex, serves the Footprints API under `/api` (`worker/api.js`) and photos under `/media` from R2, and hands everything else to the build output.
- Bindings: D1 `itsblog-db` as `DB` (schema in `migrations/`, apply new files with `npx wrangler d1 migrations apply itsblog-db --remote`), R2 bucket `itsblog-media` as `MEDIA`. The admin password is the Worker secret `ADMIN_PASSWORD`; sessions are cookies signed with a key derived from it.
- Local API: put `ADMIN_PASSWORD=...` in `.dev.vars` (git-ignored), run `npx wrangler d1 migrations apply itsblog-db --local`, then `npx wrangler dev` (site + API on :8787, restart it after each `npm run build`); `npm run serve` proxies `/api` and `/media` to it.
- Workers Builds: build command `npm run build`, deploy command `npx wrangler deploy`. Manual deploy: `npm run deploy`.
- `public/_headers` sets long-lived caching for the fingerprinted `/static/*` files.

## Code notes

- Posts are Markdown files in `content/posts/*.md` with front matter (`title`, `date`, `category`, `tags`, `summary`), bundled at build time by `src/utils/posts.js`; the file name is the slug and `/posts/<slug>` opens it. `welcome.md` is the desktop's "请先阅读" help document.
- Window manager: `src/store/modules/windows.js` holds every open window; `src/components/aqua/AppWindow.vue` draws the chrome (drag, resize, zoom, genie/scale minimise via `src/utils/genie.js`; the genie warps an html-to-image snapshot of the window on a canvas and falls back to a white silhouette when no snapshot is ready). Applications live in `src/apps/` and are registered in `src/apps/registry.js` (name, icon, size, `instanceKey`).
- Preferences (wallpaper, Dock magnification, minimise effect, Blue/Graphite appearance) live in `src/store/modules/system.js` and persist to localStorage; wallpapers are in `src/config/wallpapers.js`.
- Owner name, e-mail and links shown on the site are in `src/config/site.js`.
- Any Markdown rendered with `v-html` must go through `renderMarkdown` in `src/utils/markdown.js` (marked + highlight.js + DOMPurify).
- Footprints (`src/apps/Footprints.vue`, `src/apps/footprints/`): Leaflet map (tiles in `src/config/map.js`), cards and timeline of places from the API; when signed in (Apple menu > 登录…, `src/apps/Login.vue`, `src/store/modules/session.js`) the same window edits places in `AquaSheet`s. Photos are resized in the browser (`src/utils/images.js`) before upload. `/places/<id>` opens a place. All API calls go through `src/api/client.js`, which adds the `X-Requested-With` header the Worker requires for admin writes. Leaflet uses z-indexes up to 1000, so the window body is `isolation: isolate` and its overlays sit above 1000.
- Shared Aqua styles (colours as CSS variables, buttons, fields, scrollbars, menus) are in `src/style/aqua.scss`.
