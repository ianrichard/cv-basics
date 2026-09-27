# Bundled assets and upstream sources

Everything needed at runtime is in `dist/`; the app makes no runtime CDN requests.

| Asset | Source / notes |
|---|---|
| `dist/model/` | [TensorFlow SSD Lite MobileNet V2](https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json), graph and five shards, 17.7 MB. |
| `dist/vendor/tf.min.js` | [TensorFlow.js 4.22.0](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js), Apache 2.0. |
| `dist/media/expo-fruit.mp4` | Ian's `IMG_2974.MOV` from Google Drive Temp. Actual expo prop fruit placed on a counter. Compressed to silent 1280×720 H.264, 30 fps, CRF 23, fast start; source metadata removed. 2.7 MB, about 13 seconds. |
| `dist/media/store-people.mp4` | [Customers Shopping at Supermarket](https://www.pexels.com/video/customers-shopping-at-supermarket-10901926/) by Suika Chan, [Pexels License](https://www.pexels.com/license/). Compressed to silent 1280×720 H.264, 30 fps, CRF 23, fast start; metadata removed. 4.3 MB, about 11 seconds. |
| `dist/media/*-poster.jpg` | Still frames from the corresponding bundled footage. |
| `dist/media/heb-apple.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000466634-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/heb-banana.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000377497-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/heb-orange.jpg` | [H-E-B product image](https://images.heb.com/is/image/HEBGrocery/000375168-1?hei=360&wid=360), URL supplied by Ian. |
| `dist/media/people.svg` | Original two-person silhouette drawn for this app. |

The original MOV, downloaded footage candidates and retired demo media remain in the ignored `reference/` directory. Only the two curated clips ship or cache offline. The historical research page in `docs/retail-video-options.html` is reference material, not the current demo lineup.

`dist/app.js`, `dist/config.js`, `dist/geometry.js`, `dist/style.css`, `dist/index.html` and the service worker are editable source. No API key or backend is needed. `npm start` serves the app locally; `npm run deploy` publishes `dist/` to Cloudflare Pages. Bump the cache version in `dist/sw.js` when changing bundled assets and keep `offline-assets.json` in sync.
