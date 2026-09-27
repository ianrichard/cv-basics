# Retail CV Demo

New session: read [HANDOFF.md](HANDOFF.md) for current state, pending decisions and local reference locations. The latest [Gemini video seed and prompts](docs/video-seeds/README.md) are tracked in this repository.

Browser-based object detection for an introductory retail showcase. The app cycles through five Gemini demos: Produce at Checkout, Checkout belt, People in Store, Curbside and Produce at Home. Curbside recognizes Cars + People and replaces the earlier static photo. The scenes work with Camera / Demo modes and offline caching. [Retail footage shortlist](docs/retail-video-options.html) surveys candidate scenes; it does not add those extra classes to the app.


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

Edit dist/config.js: each class has its COCO category ID, display label, color, image and confidence threshold. ENABLED chooses the available classes and recognition-list order. Each DEMOS entry presets the active classes for that sample. The Settings detection checkboxes select Produce, People and Cars; each sample remembers changes until reload. Camera has independent Produce and People checkboxes, both enabled by default, and never enables Cars. Filter changes clear previous detections without reopening the camera.

The model is TensorFlow's SSD Lite MobileNet V2. TensorFlow.js 4.22.0 uses the WebGL backend with its default handling of small CPU helper operations. There is no full CPU inference fallback. Lightweight JavaScript postprocessing handles class filtering, NMS and tracking. Video fills the stage with a centered cover crop. Inference uses the exact visible crop, capped at 640 pixels on its longest side; only one inference runs at once, targeting at most 20 updates per second. Video plays independently. New tracks keep the original confidence thresholds (fruit .48, people .60). Existing tracks can continue on weaker matching detections (fruit .32, people .40); new people need two consecutive detections above .60. Fresh detections remove unmatched old boxes of the same class to prevent duplicate counts. Only when a class has no accepted detections do its confirmed tracks linger briefly: 180 ms for fruit, 250 ms for people. Matching uses the last detected box, separate from visual smoothing. DOM boxes interpolate positions linearly over one selected detection interval (125 ms at the default 8 FPS), with a 40% class-color fill and H-E-B red people outlines. Object glow defaults off. Matching allows the previous observation to remain eligible across slow detection intervals; unmatched boxes retain their original linger. The bundled model internally resizes to 300×300; feeding a larger preprocessing crop did not materially improve sampled people detections.

Demo mode automatically cycles through `DEMOS` in order, beginning with Produce at Checkout, then Checkout belt, People in Store, Curbside and Produce at Home, before wrapping back to Produce at Checkout. Each switch fades the video and detection boxes out over 320 ms, loads the next clip, then fades in over 320 ms. Reduced-motion preferences disable the fades. Selecting a demo starts it and continues the playlist from there; camera mode does not auto-cycle. Scene switches clear detections, and later selections cancel a pending fade. Camera mode offers **Produce** and **People** checkboxes. Uncheck People to recognize only the three produce classes. Auto-rotate videos is checked by default and only shown in Demo mode; uncheck it to loop the selected clip. The sidebar emphasizes recognition rather than quantity: larger item images and labels brighten when that class is detected. Individual counts, the total and scene captions are removed. Presence comes from confirmed model detections, never scripted.

Checkout belt is slowed in the source file to half speed (about 20 seconds), with motion-interpolated 30 fps playback and no audio. Produce at Checkout remains unchanged. People in Store (8.5 seconds, 2.69 MB) and produce (4.2 seconds, 0.83 MB) use silent 1280×720 H.264 at 24 fps with fast start and source metadata removed. Remove orange, Expo fruit, Supermarket and Fruit display are retired from the app and offline cache. Unrecognized item rows stay at 25% opacity; recognition changes fade between 25% and full opacity over 500 ms. Images are 72 px on desktop (80 px on wide screens) and 64 px on smaller screens, with 23–29 px labels. Original footage and retired demo media are preserved locally in the ignored `reference/` directory, outside deployments. Sources and media licenses are in [dist/credits.html](dist/credits.html).

For the expo, start with one apple, two bananas and two oranges. Place them one at a time, visibly apart, near the center of the camera view, with even lighting. Pull your hand away and allow the count to settle. The current [COCO category list](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts) does not include grapes, pears or lemons; adding those accurately would require a different or custom model.

The bottom navigation is one segment: **Demos / Camera / Settings / About**, with icons above labels and a subtle lighter fill on the active tab, without border outlines. Settings and About replace the entire main presentation with a quick opacity fade. All settings are expanded. Video playback, inference and delayed frame copying pause in these views, then resume when returning to the source. Camera is retained while adjusting its settings. About explains sample footage, live on-device computation and how to try recognition.

On mobile, the video sticks to the top inside an opaque wrapper with 24 px top/side padding. Both video-to-title and title-to-recognized-items gaps are 32 px. Navigation stays visible above the bottom safe area and fits 320 px screens. The status H1 has a larger .8em dot and a stable one-line minimum area. The approved story follows the playlist: “Computers with vision” → “Scan produce on the move” → “Notice our heart for people” → “And ways to serve better” → “To deliver on our promises”. Camera uses “Searching for life.” The status heading scales with its column width (18–28 px) so these lines fit at 320 px without shortening the wording. Between demo clips its text fades to blank without collapsing. Blue loading dots pulse inward, active green dots outward, and red error dots stay steady. Errors take priority over loading/transition/active states. Reduced-motion preferences disable fades and pulses.

The favicon and installable app icon use Ian’s supplied artwork, bundled at 32, 180, 192 and 512 px with source metadata stripped.

Fruit, person and car recognition rows use photographic images on white tiles. Person/car thumbnails were supplied by Ian through Drive Temp, resized to at most 256 px with metadata stripped. Lucide SVGs remain only for interface controls.

Open **Curbside** directly with `/?sample=curbside`; the old `/?sample=curbside-photo` link opens the replacement video too. The 6.83-second clip is silent 1280×720 H.264, 686 KB, with metadata removed, and participates in normal automatic rotation. Uncheck Auto-rotate videos to loop it.

Generic still-image support remains available through `type: 'image'` in `DEMOS`, but no static samples currently ship. The retired curbside photo remains in ignored `reference/curbside/`.

Open **Settings** for scene selection, detection filters, auto-rotation and **Display tuning**: Object glow, Detection FPS (2–20, with 20 labeled Max), Overlay background, Background opacity (0–100%), and Playback delay (0.00–0.50 seconds, in 0.01 steps). Defaults are glow off, 8 FPS, background on at 40%, and playback delay 0.20 s. These choices apply immediately and are not saved to storage. At 4 FPS, position/size transitions take 250 ms; at 2 FPS, 500 ms. This controls detection frequency, not video speed or browser rendering FPS. Lower detection FPS reduces model work, but animated glow can still incur rendering cost. Mobile padding and the video/content gap are 24 px.

Playback delay holds back displayed video/camera frames while inference keeps reading the original feed. Playback speed stays at 1×. At 0.00 s there is no buffering; enabling it uses a bounded canvas queue (at most 18 queued frames, at most 30 captures/sec, up to 1280×720), adding rendering work. Source changes clear the queue; clip endings drain the delayed tail before switching or restarting. The slider is a manual alignment adjustment, not a promise of exact frame synchronization. Image inference stays on demand.

Loading, detection and error text appear only in the H1 beside the colored dot. Loading labels include Loading Computer Vision, Loading Demo and Allow Camera Access; active titles add scene context without repeating the recognition labels. Errors use the same heading, with a steady red dot and a sad emoji. There is no text overlay on the video canvas; the retry button appears beneath the status label when needed.

## Validation and limits

Browser spot checks on the development Mac covered repeated fruit and supermarket playback, rapid scene changes, a 390 px mobile layout and offline reload with both scenes. The completed fruit arrangement reached 1 apple, 2 bananas and 2 oranges on desktop and mobile. Median inference was about 33 ms in this local run; supermarket playback reported no dropped frames over two loops, with tensor counts returning to the same baseline. These are development-device observations, not a guarantee for the event hardware. No test suite was added.

A general-purpose pretrained detector can miss small or occluded objects, briefly double-count movement, or misclassify unusual angles. Verify the physical camera, browser permissions and offline reload on the actual event device before presenting. Keep fruit visibly apart and large in the frame.

Model source: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
Runtime: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js
