# Explore Computer Vision

A browser-local object detection demo: produce, people and cars recognized live on video clips or your camera. Everything runs on the device. There's no backend, API key, build step or runtime CDN, and it works offline once cached.

**Live:** https://cv-basics.pages.dev/

For what it is and how it works, open **⋮ → About** in the app. That copy, including the technical details, lives in the About section of [dist/index.html](dist/index.html). Media and software credits are in [dist/credits.html](dist/credits.html); model and runtime origins are in [SOURCES.md](SOURCES.md).

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

`npm ci` and `wrangler login` are one-time setup (Node.js 22+). `npm run deploy` uploads `dist/` and prints the deployment URL. The `cv-basics` Pages project already exists; on a new account, create it first with `npx wrangler pages project create cv-basics --production-branch=main --force`.

Any other static HTTPS host works too: upload the contents of `dist/` as-is.

When you change shipped files, bump the cache version in [dist/sw.js](dist/sw.js) and update [dist/offline-assets.json](dist/offline-assets.json) so returning devices pick up the new version.

## Where things live

- `dist/`: the whole app, edited directly. It's also exactly what gets deployed.
- [dist/config.js](dist/config.js): recognized classes (labels, colors, thresholds) and the demo playlist.
- **⋮ → Settings** in the app: detection filters, auto-rotation and display tuning. Changes aren't saved.
- [docs/video-seeds/](docs/video-seeds/README.md): seed images and prompts for the AI-generated clips.
- `reference/`: local source footage and exploration material, excluded from Git and deployment.
- [HANDOFF.md](HANDOFF.md): current state, decisions and history for anyone picking up the work.

## Limits

It uses a general-purpose pretrained detector (SSDLite MobileNet V2, COCO), so it can miss small or overlapping objects and only knows COCO classes (no grapes, pears or lemons, for example). Before presenting, check the camera, permissions and an offline reload on the actual event device.
