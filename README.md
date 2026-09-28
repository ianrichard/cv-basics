# Explore Computer Vision

A browser-local object detection demo: produce, people and cars recognized live on video clips or your camera. Everything runs on the device. There's no backend, API key, build step or runtime CDN, and it works offline once cached.

**Live:** https://cv-basics.pages.dev/

For what it is and how it works, open **⋮ → About** in the app. That copy, including the technical details, lives in [public/index.html](public/index.html). Media and software credits are in [public/credits.html](public/credits.html).

## Run locally

```bash
npm start
```

Then open http://localhost:8000. This needs Python 3. Camera access needs localhost or HTTPS, so don't open `index.html` directly from disk.

## Deploy

Cloudflare Pages. Git push alone does not deploy.

```bash
npm ci
npx wrangler login
npm run deploy
```

`npm ci` and `wrangler login` are one-time setup (Node.js 22+). `npm run deploy` uploads `public/` and prints the deployment URL. The `cv-basics` Pages project already exists; on a new account, create it first with `npx wrangler pages project create cv-basics --production-branch=main --force`.

Any other static HTTPS host works too: upload the contents of `public/` as-is.

When you change files in `public/`, bump the cache version in [public/sw.js](public/sw.js) and keep [public/offline-assets.json](public/offline-assets.json) in sync, so returning devices pick up the new version.

## Structure

`public/` is the whole app, edited directly and deployed as-is. [public/config.js](public/config.js) holds the recognized classes (labels, colors, thresholds) and the demo playlist.

It uses a general-purpose pretrained detector (SSDLite MobileNet V2, COCO), so it can miss small or overlapping objects and only knows COCO classes (no grapes, pears or lemons, for example).
