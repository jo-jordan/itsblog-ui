# CLAUDE.md

## Git workflow

- Commit and push directly to `master`. Do not create feature branches or pull requests unless asked.
- Every push to `master` is deployed to production by Cloudflare Workers Builds, so run `npm run build` (and `npm run lint`) before pushing.

## Project

Mac OS X 10.0–10.2 ("Aqua") style personal blog: Vue 2.7 + Vue CLI 4 (webpack 4), Vuex, vue-router (history mode). The Aqua look is the point of the site: new UI must keep to it (pinstripes, gel buttons, traffic lights, Lucida Grande, the original icons in `src/assets`).

- `npm ci` / `npm run serve` (dev server on port 9528) / `npm run build` / `npm run lint`
- Build output goes to `./itsblog-ui` (not `dist`); Node version is pinned in `.node-version` (22).
- Keep `package-lock.json` committed and resolved from registry.npmjs.org.

## Deployment

- Static site on Cloudflare Workers, configured in `wrangler.jsonc`, served at `edgeless.me` (and `www.edgeless.me`) via Custom Domains.
- `worker/index.js` runs before the assets only to 301 `www.` to the apex; everything else is served from the build output.
- Workers Builds: build command `npm run build`, deploy command `npx wrangler deploy`. Manual deploy: `npm run deploy`.
- `public/_headers` sets long-lived caching for the fingerprinted `/static/*` files.

## Code notes

- Posts are Markdown files in `content/posts/*.md` with front matter (`title`, `date`, `category`, `tags`, `summary`), bundled at build time by `src/utils/posts.js`; the file name is the slug and `/posts/<slug>` opens it. `welcome.md` is the desktop's "请先阅读" help document.
- Window manager: `src/store/modules/windows.js` holds every open window; `src/components/aqua/AppWindow.vue` draws the chrome (drag, resize, zoom, genie/scale minimise via `src/utils/genie.js`). Applications live in `src/apps/` and are registered in `src/apps/registry.js` (name, icon, size, `instanceKey`).
- Preferences (wallpaper, Dock magnification, minimise effect, Blue/Graphite appearance) live in `src/store/modules/system.js` and persist to localStorage; wallpapers are in `src/config/wallpapers.js`.
- Owner name, e-mail and links shown on the site are in `src/config/site.js`.
- Any Markdown rendered with `v-html` must go through `renderMarkdown` in `src/utils/markdown.js` (marked + highlight.js + DOMPurify).
- Shared Aqua styles (colours as CSS variables, buttons, fields, scrollbars, menus) are in `src/style/aqua.scss`.
