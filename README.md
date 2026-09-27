# Retail CV Demo

Browser-based object detection for an introductory retail showcase. The bundled app has four enabled classes—people, apples, bananas and oranges—and offline Camera / Demo modes. [Retail footage shortlist](docs/retail-video-options.html) surveys candidate scenes; it does not add those extra classes to the app.


Static, browser-local COCO object detection. No API key, build, backend, or runtime CDN needed.

## Run

Run `python3 -m http.server 8000 --directory dist` and visit http://localhost:8000. Camera access requires localhost or HTTPS. Do not open index.html via file://.

For another static host (including here.now), upload the contents of `dist`. Keep all paths together. The runtime, five model shards, video and images are bundled. Use HTTPS and serve sw.js with revalidation/no-cache. Allow the first load to finish caching, then reload once offline to confirm on the event device. Browser cache eviction can remove offline assets; a downloaded copy served on localhost is the most dependable event fallback.

Camera mode has a flip button that requests the opposite facing camera, with another available camera as fallback. A device with only one camera keeps its current feed.

## Deploy to Cloudflare Pages

Live site: https://cv-basics.pages.dev/

Install Node.js 22 or newer, then run `npm ci`. Sign in once with `npx wrangler login`.
The `cv-basics` Pages project is already created. For a new account only, create it with `npx wrangler pages project create cv-basics --production-branch=main --force` (`--force` keeps initial setup on Pages instead of redirecting it to Workers).
Publish the current local app with `npm run deploy`. This uploads only `dist/`, including the bundled model and videos; there is no build step or GitHub deployment workflow.
Wrangler prints the deployment URL when it finishes. Credentials stay in Wrangler's local configuration, outside this repository.

For local use, `npm start` serves the app at http://localhost:8000 (Python 3 required).
The `reference/` folder contains local exploration material and is excluded from Git and deployment.

## Configure

Edit dist/config.js: each class has its COCO category ID, display label, color, image and confidence threshold. ENABLED chooses classes and ledger order. Add other COCO categories there if needed.

The model is TensorFlow's SSD Lite MobileNet V2. TensorFlow.js 4.22.0 uses the WebGL backend with its default handling of small CPU helper operations. There is no full CPU inference fallback. Lightweight JavaScript postprocessing handles class filtering, NMS and tracking. Video fills the stage with a centered cover crop. Inference uses the exact visible crop, capped at 640 pixels on its longest side; only one inference runs at once, targeting at most 20 updates per second. Video plays independently. Tracks linger up to 450 ms through missed detections. Boxes use the latest detected positions without an extra animation delay.

Demo mode starts with the Gemini-generated Checkout belt clip, with Fruit display and the original Produce, Checkout, Conveyor and People stock footage also available. All clips run the same model as Camera. The conveyor close-up mainly contains packaged products outside the enabled classes, so low or zero counts can be expected. Fruit can be tested through Camera. All counts are model output, never scripted. Sources and media licenses are in [dist/credits.html](dist/credits.html).

## Validation and limits

Source syntax, asset completeness and model shard sizes were checked. Physical GPU performance, webcam permissions, Safari behavior, and offline browser reload must be checked on the actual event device. This environment did not provide browser QA. A general-purpose pretrained detector can miss small fruit, occluded objects and unusual angles; use good lighting and hold fruit visibly apart.

Model source: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
Runtime: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js
