# CLAUDE.md

## Git workflow

- Commit and push directly to `master`. Do not create feature branches or pull requests unless asked.
- Every push to `master` is deployed to production by Cloudflare Workers Builds, so run `npm run build` (and `npm run lint`) before pushing.

## Project

Mac OS X style personal blog: Vue 2.7 + Vue CLI 4 (webpack 4), Vuex, vue-router (hash mode).

- `npm ci` / `npm run serve` (dev server on port 9528) / `npm run build` / `npm run lint`
- Build output goes to `./itsblog-ui` (not `dist`); Node version is pinned in `.node-version` (22).
- Keep `package-lock.json` committed and resolved from registry.npmjs.org.

## Deployment

- Static site on Cloudflare Workers, configured in `wrangler.jsonc`, served at `edgeless.me` (and `www.edgeless.me`) via Custom Domains.
- `worker/index.js` runs before the assets only to 301 `www.` to the apex; everything else is served from the build output.
- Workers Builds: build command `npm run build`, deploy command `npx wrangler deploy`. Manual deploy: `npm run deploy`.
- `public/_headers` sets long-lived caching for the fingerprinted `/static/*` files.
- `.github/workflows/main.yml` is the old AWS S3/CloudFront pipeline and is obsolete.

## Code notes

- Desktop "windows" (`src/components/*Window`) are mounted imperatively via `Vue.extend` and share behaviour from `src/common/Window.js`; register global listeners with `attachWindowEvents` and remove them in `beforeDestroy`.
- Any Markdown rendered with `v-html` must go through `renderMarkdown` in `src/utils/markdown.js` (marked + DOMPurify).
- Blog data comes from `VUE_APP_BASE_API` (`.env.*`); the site must still load when that API is unavailable.
