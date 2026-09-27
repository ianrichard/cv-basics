# Retail CV Demo

New session: read [HANDOFF.md](HANDOFF.md) for current state, pending decisions and local reference locations. The latest [Gemini video seed and prompts](docs/video-seeds/README.md) are tracked in this repository.

Browser-based object detection for an introductory retail showcase. The app cycles through five Gemini demos: H-E-B people, H-E-B produce, Add banana, Remove orange and Checkout belt. A manual Curbside photo sample is also available to evaluate Cars + People before generating video. The scenes work with Camera / Demo modes and offline caching. [Retail footage shortlist](docs/retail-video-options.html) surveys candidate scenes; it does not add those extra classes to the app.


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

Edit dist/config.js: each class has its COCO category ID, display label, color, image and confidence threshold. ENABLED chooses the available classes and recognition-list order. Each DEMOS entry presets the active classes for that sample. The below-screen detection checkboxes select Produce, People and Cars; each sample remembers changes until reload. Camera has independent Produce and People checkboxes, both enabled by default, and never enables Cars. Filter changes clear previous detections without reopening the camera.

The model is TensorFlow's SSD Lite MobileNet V2. TensorFlow.js 4.22.0 uses the WebGL backend with its default handling of small CPU helper operations. There is no full CPU inference fallback. Lightweight JavaScript postprocessing handles class filtering, NMS and tracking. Video fills the stage with a centered cover crop. Inference uses the exact visible crop, capped at 640 pixels on its longest side; only one inference runs at once, targeting at most 20 updates per second. Video plays independently. New tracks keep the original confidence thresholds (fruit .48, people .60). Existing tracks can continue on weaker matching detections (fruit .32, people .40); new people need two consecutive detections above .60. Fresh detections remove unmatched old boxes of the same class to prevent duplicate counts. Only when a class has no accepted detections do its confirmed tracks linger briefly: 180 ms for fruit, 250 ms for people. Matching uses the last detected box, separate from visual smoothing. DOM boxes interpolate positions linearly over one selected detection interval (50 ms at the default 20 FPS), with a subtle 7% class-color fill and H-E-B red people outlines. Object glow defaults off. Matching allows the previous observation to remain eligible across slow detection intervals; unmatched boxes retain their original linger. The bundled model internally resizes to 300×300; feeding a larger preprocessing crop did not materially improve sampled people detections.

Demo mode automatically cycles through `DEMOS` in order, beginning with H-E-B people and wrapping from Checkout belt back to H-E-B people. Each switch fades the video and detection boxes out over 320 ms, loads the next clip, then fades in over 320 ms. Reduced-motion preferences disable the fades. Selecting a demo starts it and continues the playlist from there; camera mode does not auto-cycle. Scene switches clear detections, and later selections cancel a pending fade. Camera mode offers **Produce** and **People** checkboxes. Uncheck People to recognize only the three produce classes. Auto-rotate videos is checked by default and only shown in Demo mode; uncheck it to loop the selected clip. The sidebar emphasizes recognition rather than quantity: larger item images and labels brighten when that class is detected. Individual counts, the total and scene captions are removed. Presence comes from confirmed model detections, never scripted.

Checkout belt is slowed in the source file to half speed (about 20 seconds), with motion-interpolated 30 fps playback and no audio. Add banana and Remove orange remain unchanged. H-E-B people (8.5 seconds, 2.69 MB) and produce (4.2 seconds, 0.83 MB) use silent 1280×720 H.264 at 24 fps with fast start and source metadata removed. Expo fruit, Supermarket and Fruit display are retired from the app and offline cache. Unrecognized item rows stay at 25% opacity; recognition changes fade between 25% and full opacity over 500 ms. Images are 72 px on desktop (80 px on wide screens) and 64 px on smaller screens, with 23–29 px labels. Original footage and retired demo media are preserved locally in the ignored `reference/` directory, outside deployments. Sources and media licenses are in [dist/credits.html](dist/credits.html).

For the expo, start with one apple, two bananas and two oranges. Place them one at a time, visibly apart, near the center of the camera view, with even lighting. Pull your hand away and allow the count to settle. The current [COCO category list](https://github.com/tensorflow/tfjs-models/blob/master/coco-ssd/src/classes.ts) does not include grapes, pears or lemons; adding those accurately would require a different or custom model.

On mobile, the video sticks to the top while scrolling. The main presentation and source toggle fill the first viewport; sample selection and detection/rotation controls sit below it. The status fades out, swaps one text node, then fades in (250 ms each). Blue loading dots pulse inward, active green dots outward, and red error dots remain steady. Errors take priority over loading and active states; source and model readiness are tracked independently. Motion is disabled for reduced-motion preferences.

Still samples use `type: 'image'` in `DEMOS` and are excluded from automatic video rotation. Select **Curbside photo**, or open `/?sample=curbside-photo` directly. The full photo is shown without cropping and analyzed once using the existing detector; changing filters or resizing reruns analysis. Boxes are mapped to the contained image rather than the stage's letterboxing. A steady green **Sample image analyzed** status means the results are held; no continuous GPU inference runs on an unchanged photo. Live video and camera retain their existing tracking behavior.

Expand **Display tuning** below the debugging controls for temporary native inputs: Object glow, Detection FPS (2–20, with 20 labeled Max), Overlay background, and Background opacity (0–100%). Defaults are glow off, 20 FPS, background on at 7%. These choices apply immediately and are not saved to storage. At 4 FPS, position/size transitions take 250 ms; at 2 FPS, 500 ms. This controls detection frequency, not video speed or browser rendering FPS. Lower detection FPS reduces model work, but animated glow can still incur rendering cost. Mobile padding and the video/content gap are 24 px.

## Validation and limits

Browser spot checks on the development Mac covered repeated fruit and supermarket playback, rapid scene changes, a 390 px mobile layout and offline reload with both scenes. The completed fruit arrangement reached 1 apple, 2 bananas and 2 oranges on desktop and mobile. Median inference was about 33 ms in this local run; supermarket playback reported no dropped frames over two loops, with tensor counts returning to the same baseline. These are development-device observations, not a guarantee for the event hardware. No test suite was added.

A general-purpose pretrained detector can miss small or occluded objects, briefly double-count movement, or misclassify unusual angles. Verify the physical camera, browser permissions and offline reload on the actual event device before presenting. Keep fruit visibly apart and large in the frame.

Model source: https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json
Runtime: https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js
