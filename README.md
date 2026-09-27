# Retail CV Demo

Browser-based object detection for an introductory retail showcase. The app has two curated scenes: expo fruit (apples, bananas and oranges) and supermarket people. Both work with Camera / Demo modes and offline caching. [Retail footage shortlist](docs/retail-video-options.html) surveys candidate scenes; it does not add those extra classes to the app.


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

The model is TensorFlow's SSD Lite MobileNet V2. TensorFlow.js 4.22.0 uses the WebGL backend with its default handling of small CPU helper operations. There is no full CPU inference fallback. Lightweight JavaScript postprocessing handles class filtering, NMS and tracking. Video fills the stage with a centered cover crop. Inference uses the exact visible crop, capped at 640 pixels on its longest side; only one inference runs at once, targeting at most 20 updates per second. Video plays independently. Tracks linger up to 450 ms through missed detections. DOM boxes interpolate positions over 50 ms.

Demo mode starts with Ian's actual expo fruit, filmed on a counter. The second scene shows shoppers inside a supermarket. Choose **Fruit** or **People**, then **Camera** to use the same class selection live. Fruit mode ignores person detections, including hands sometimes mistaken for people. People mode shows only the current detected people count, not cumulative visitors or store occupancy. All counts come from the model, never scripted.

The two silent MP4s use 1280×720 H.264 at 30 fps with fast-start metadata. The 13-second expo MOV was compressed from 24.6 MB to 2.7 MB; audio and source metadata were stripped. Original footage and retired demo media are preserved locally in the ignored `reference/` directory, outside deployments. Sources and media licenses are in [dist/credits.html](dist/credits.html).

For the expo, start with one apple, two bananas and two oranges. Place them one at a time, visibly apart, near the center of the camera view, with even lighting. Pull your hand away and allow the count to settle. The current [COCO category list](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts) does not include grapes, pears or lemons; adding those accurately would require a different or custom model.

## Validation and limits

Browser spot checks on the development Mac covered repeated fruit and supermarket playback, rapid scene changes, a 390 px mobile layout and offline reload with both scenes. The completed fruit arrangement reached 1 apple, 2 bananas and 2 oranges on desktop and mobile. Median inference was about 33 ms in this local run; supermarket playback reported no dropped frames over two loops, with tensor counts returning to the same baseline. These are development-device observations, not a guarantee for the event hardware. No test suite was added.

A general-purpose pretrained detector can miss small or occluded objects, briefly double-count movement, or misclassify unusual angles. Verify the physical camera, browser permissions and offline reload on the actual event device before presenting. Keep fruit visibly apart and large in the frame.

Model source: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
Runtime: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js
