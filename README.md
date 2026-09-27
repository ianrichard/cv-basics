# Retail CV Demo

New session: read [HANDOFF.md](HANDOFF.md) for current state, pending decisions and local reference locations. The latest [Gemini video seed and prompts](docs/video-seeds/README.md) are tracked in this repository.

Browser-based object detection for an introductory retail showcase. The app cycles through five Gemini demos: H-E-B people, H-E-B produce, Add banana, Remove orange and Checkout belt. The scenes work with Camera / Demo modes and offline caching. [Retail footage shortlist](docs/retail-video-options.html) surveys candidate scenes; it does not add those extra classes to the app.


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

Edit dist/config.js: each class has its COCO category ID, display label, color, image and confidence threshold. ENABLED chooses the available classes and ledger order. Each DEMOS entry selects the active classes for that scene, in both Demo and Camera modes. Scene changes clear previous detections; changing scene while using Camera keeps its existing stream.

The model is TensorFlow's SSD Lite MobileNet V2. TensorFlow.js 4.22.0 uses the WebGL backend with its default handling of small CPU helper operations. There is no full CPU inference fallback. Lightweight JavaScript postprocessing handles class filtering, NMS and tracking. Video fills the stage with a centered cover crop. Inference uses the exact visible crop, capped at 640 pixels on its longest side; only one inference runs at once, targeting at most 20 updates per second. Video plays independently. New tracks keep the original confidence thresholds (fruit .48, people .60). Existing tracks can continue on weaker matching detections (fruit .32, people .40); new people need two consecutive detections above .60. Fresh detections remove unmatched old boxes of the same class to prevent duplicate counts. Only when a class has no accepted detections do its confirmed tracks linger briefly: 180 ms for fruit, 250 ms for people. Matching uses the last detected box, separate from visual smoothing. DOM boxes interpolate positions over 50 ms, with a subtle 5% white fill and H-E-B red people outlines. The bundled model internally resizes to 300×300; feeding a larger preprocessing crop did not materially improve sampled people detections.

Demo mode automatically cycles through `DEMOS` in order, beginning with H-E-B people and wrapping from Checkout belt back to H-E-B people. Each switch fades the video and detection boxes out over 320 ms, loads the next clip, then fades in over 320 ms. Reduced-motion preferences disable the fades. Selecting a demo starts it and continues the playlist from there; camera mode does not auto-cycle. Scene switches clear detections, and later selections cancel a pending fade. Camera mode offers **Fruit** and **People** and keeps the selected class group live. Fruit mode ignores person detections, including hands sometimes mistaken for people. People mode shows only the current detected people count, not cumulative visitors or store occupancy. All counts come from the model, never scripted.

Checkout belt is slowed in the source file to half speed (about 20 seconds), with motion-interpolated 30 fps playback and no audio. Add banana and Remove orange remain unchanged. H-E-B people (8.5 seconds, 2.69 MB) and produce (4.2 seconds, 0.83 MB) use silent 1280×720 H.264 at 24 fps with fast start and source metadata removed. Expo fruit, Supermarket and Fruit display are retired from the app and offline cache. Zero-count item rows fade to 25% opacity over 250 ms and return to full opacity when their counts rise. Original footage and retired demo media are preserved locally in the ignored `reference/` directory, outside deployments. Sources and media licenses are in [dist/credits.html](dist/credits.html).

For the expo, start with one apple, two bananas and two oranges. Place them one at a time, visibly apart, near the center of the camera view, with even lighting. Pull your hand away and allow the count to settle. The current [COCO category list](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts) does not include grapes, pears or lemons; adding those accurately would require a different or custom model.

## Validation and limits

Browser spot checks on the development Mac covered repeated fruit and supermarket playback, rapid scene changes, a 390 px mobile layout and offline reload with both scenes. The completed fruit arrangement reached 1 apple, 2 bananas and 2 oranges on desktop and mobile. Median inference was about 33 ms in this local run; supermarket playback reported no dropped frames over two loops, with tensor counts returning to the same baseline. These are development-device observations, not a guarantee for the event hardware. No test suite was added.

A general-purpose pretrained detector can miss small or occluded objects, briefly double-count movement, or misclassify unusual angles. Verify the physical camera, browser permissions and offline reload on the actual event device before presenting. Keep fruit visibly apart and large in the frame.

Model source: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
Runtime: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js
