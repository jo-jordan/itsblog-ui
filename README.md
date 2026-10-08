# itsblog

💻 A Mac OS X style personal blog website

## Development

```bash
npm ci
npm run serve   # dev server on http://localhost:9528
npm run build   # production build into ./itsblog-ui
```

## Deployment

The site is deployed as a static [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) project (`wrangler.jsonc`).
Workers Builds is connected to this repository and deploys every push to `master`:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

To deploy manually: `npx wrangler login && npm run deploy`.
