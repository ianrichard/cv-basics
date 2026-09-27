# Bundled assets and upstream sources

Everything required to run the demo is already in `dist/`. The links below are for replacing assets or tracing their origin; the app does not fetch them at runtime.

## Larger files

| Bundled path | Size | Upstream / notes |
|---|---:|---|
| `dist/model/` (graph + 5 shards) | 17.7 MB | [TensorFlow SSD Lite MobileNet V2 graph](https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json). The graph manifest references `group1-shard1of5` through `group1-shard5of5` in the same upstream directory. Keep them together. |
| `dist/vendor/tf.min.js` | 1.4 MB | [TensorFlow.js 4.22.0 distribution](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js), Apache 2.0. Included locally for offline operation. |
| `dist/media/produce.mp4` | 1.4 MB | [Original source](https://www.pexels.com/video/man-shopping-fruits-in-a-grocery-store-8466804/). Produce shopper; 960×540 H.264, silent, trimmed to 18 s. |
| `dist/media/checkout.mp4` | 1.5 MB | [Original source](https://www.pexels.com/video/people-paying-at-the-counter-in-the-supermarket-4249560/). Wide checkout with people; 960×540 H.264, silent. |
| `dist/media/conveyor.mp4` | 2.0 MB | [Original source](https://www.pexels.com/video/couple-paying-at-the-counter-in-the-grocery-4121754/). Close checkout conveyor; 960×540 H.264, silent. |
| `dist/media/demo.mp4` | 2.3 MB | [Original source](https://commons.wikimedia.org/wiki/File:Sabana_Grande_Caracas._People_walking_on_the_Boulevard_of_Sabana_Grande,_famous_in_Caracas,_Venezuela.webm). People walking; source WebM converted to 960×540 H.264, silent. |

The app also includes posters and four thumbnails in `dist/media/`. Exact titles, creators, licenses and transformations for every media asset are in [`dist/credits.html`](dist/credits.html). The footage shortlist in [`docs/retail-video-options.html`](docs/retail-video-options.html) embeds its preview thumbnails but links online to the candidate videos; those candidate videos are not bundled.

## Run and publish

- From the extracted project folder: `python3 -m http.server 8000 --directory dist`, then open `http://localhost:8000`.
- For static hosting, publish the **contents** of `dist/` at the web root over HTTPS. No build or backend is needed.
- Camera access needs HTTPS or localhost. Detection requires WebGL; it will show an error instead of silently falling back to CPU.
- Keep `model/`, `vendor/`, `media/`, `sw.js` and `offline-assets.json` together. Allow the first load to finish caching, then reload with networking off on the actual event device.
- To change recognized classes and thresholds, edit `dist/config.js`. Recheck the offline service-worker cache version in `dist/sw.js` when republishing changed assets.

## Scope of source

`dist/app.js`, `dist/config.js`, `dist/geometry.js`, `dist/style.css`, `dist/index.html` and the service worker are the editable app source. `dist/vendor/tf.min.js` and `dist/model/` are locally bundled third-party runtime/model artifacts. No credentials, employer systems, site deployment metadata, or private repository history are in this archive.

## User-provided Gemini clips

`dist/media/checkout-belt.mp4` and `dist/media/fruit-display.mp4` are the original 10-second, 1280×720 Gemini-generated videos supplied by Ian Smith. The source files remain in the Git-ignored `reference/` folder.
