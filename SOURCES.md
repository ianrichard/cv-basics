# Bundled assets and upstream sources

Everything needed at runtime is in `dist/`; the app makes no runtime CDN requests.

| Asset | Source / notes |
|---|---|
| `dist/model/` | [TensorFlow SSD Lite MobileNet V2](https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json), graph and five shards, 17.7 MB. |
| `dist/vendor/tf.min.js` | [TensorFlow.js 4.22.0](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js), Apache 2.0. |
| `dist/media/*-poster.jpg` | Still frames from the corresponding bundled footage. |
| `dist/media/heb-apple.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000466634-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/heb-banana.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000377497-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/heb-orange.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000375168-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/people.svg` | Original two-person silhouette drawn for this app. |

The original MOV, downloaded footage candidates and retired demo media remain in the ignored `reference/` directory. Six Gemini clips ship and cache offline: H-E-B people, H-E-B produce, Add banana, Remove orange, Checkout belt and Curbside. Expo fruit, Supermarket and Fruit display were removed from the app on September 27 and retained locally in `reference/retired-sep27/`. The historical research page in `docs/retail-video-options.html` is reference material, not the current demo lineup.

`dist/app.js`, `dist/config.js`, `dist/geometry.js`, `dist/style.css`, `dist/index.html` and the service worker are editable source. No API key or backend is needed. `npm start` serves the app locally; `npm run deploy` publishes `dist/` to Cloudflare Pages. Bump the cache version in `dist/sw.js` when changing bundled assets and keep `offline-assets.json` in sync.

## Restored Gemini footage

These 1280×720 clips were supplied by Ian and generated with Gemini. Add banana and Remove orange retain their original 10-second timing. Checkout belt is now roughly 20 seconds at half speed: FFmpeg motion-compensated interpolation to 30 fps, H.264/yuv420p CRF 22, silent, fast start, source metadata stripped. The slow file is 2,001,893 bytes; its original is retained in `reference/slow-checkout/original.mp4`.

- `media/add-banana.mp4` — `gemini_generated_video_6F23B4FE.MP4`
- `media/remove-orange.mp4` — `gemini_generated_video_D06CC2AD.MP4`
- `media/checkout-belt.mp4` — `gemini_generated_video_128CF9EF.mp4`
- Retired Fruit display — `gemini_generated_video_76AE4569.mp4`, now local-only.

## New H-E-B Gemini footage

Supplied by Ian in Google Drive Temp. Fictional AI-generated scenes, compressed to silent 1280×720 H.264/yuv420p at 24 fps, CRF 23, fast start, with source metadata removed. Original files remain in ignored `reference/new-demos/`.

- `media/heb-people.mp4` — `gemini_generated_video_6989CEE7.mov`, 8.5 seconds, 2,694,637 bytes (59.5% smaller).
- `media/heb-produce.mp4` — `gemini_generated_video_7A4F5B78.mov`, 4.2 seconds, 828,721 bytes (76.7% smaller).
- Matching `*-poster.jpg` files are still frames from these clips.

## Retired curbside image evaluation

The former `media/curbside.jpg` came from Ian's supplied Drive Temp `IMG_2986.JPG`. The original stays in ignored `reference/curbside/`. The shipped 1920×1280 JPEG is 187,474 bytes, re-encoded without source metadata. It was a manual Cars + People detection sample and is now retired to ignored `reference/curbside/curbside-evaluation.jpg`, outside deployment. No claim is made about the photo being AI-generated.

## Curbside video

`media/curbside.mp4` replaces the photo, from Ian’s Drive Temp `gemini_generated_video_B7C6C377.mov` (Gemini-generated). Silent 1280×720 H.264/yuv420p, 6.83 seconds, CRF 23, fast start, source metadata removed. Compressed from 2,004,601 to 685,538 bytes (65.8% smaller). `media/curbside-poster.jpg` is an extracted frame. Original media remains in ignored `reference/curbside/`.
