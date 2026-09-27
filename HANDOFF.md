# Session handoff — September 27, 2026

## Start here

This is Ian's standalone computer-vision demo for an H-E-B front-end service summit / expo. It deliberately stays separate from the more complicated `~/Sites/alian` app. The working directory is `~/Sites/cv-basics`.

- Public repository: https://github.com/ianrichard/cv-basics
- Live app: https://cv-basics.pages.dev/
- Latest direction: support still-image evaluation before generating more footage, alongside simple animated status, sticky mobile video, and debugging controls below the first mobile screen. Detection groups are per-sample presets; live camera independently defaults to People + Produce. Cars is available for sample footage, off by default. Auto-rotate is checked by default; uncheck to loop the current clip. Recognition remains presence-only.
- Current immutable deployment: https://4a313825.cv-basics.pages.dev/ (app commit `0b97e65`). Published with `npm run deploy`; production asset contents match the working tree, and browser verification confirmed active detection, outward green pulse, default auto-rotate on / Cars off and no console errors.
- Publish with `npm run deploy`. Status/mobile controls checked locally at desktop, 390 px and 320 px widths: active detection, no overflow, debug controls below the first mobile viewport, sticky video, per-sample filter retention and independent camera controls. Auto-rotation advanced through clips; disabling it enabled native single-video looping. Deliberately missing model/video assets confirmed error priority and a steady red dot. No console errors during normal playback. Physical camera capture remains to be checked on the event device.
- Local deploy command: `npm run deploy`; development command: `npm start` (localhost:8000). There is no GitHub auto-deployment workflow.

## User priorities and preferences

Stability and performance first, then curation and simplification. Avoid new features, complex tracking, model swaps, framework changes or tuning without evidence. The user requested no test suite. Local browser checks are appropriate. Keep the local Wrangler deployment workflow. Do not remove all AI clips merely because real footage works: the user liked some of them and wants to choose the keepers.

## Current app

`dist/` contains source and deployable files. TensorFlow.js 4.22.0 and SSD Lite MobileNet V2 are bundled locally. There are no API keys, backend or runtime CDN dependencies.

Five demos now form an automatic repeating playlist:

1. H-E-B people — default; Gemini checkout scene, people counting only.
2. H-E-B produce — Gemini fruit-on-table scene.
3. Add banana — Gemini clip.
4. Remove orange — Gemini clip.
5. Checkout belt — Gemini clip, now half speed in the source (about 20 seconds).

Expo fruit, Supermarket and Fruit display were removed from the app and offline cache at Ian's request. Their media and posters are preserved locally under ignored `reference/retired-sep27/`.

At each clip's end the video and boxes fade out over 320 ms, the next clip loads with detections cleared, then fades in over 320 ms. The playlist wraps to H-E-B people. Manual selection switches gracefully and continues the playlist from the selected clip. Generation tokens cancel superseded transitions. Reduced-motion preferences disable fades. Camera mode now has independent People / Produce checkboxes, both on by default, and does not auto-cycle. No second decoder, framework or runtime dependency was added. Local browser spot checks confirmed automatic advancement and wraparound, opacity fading from 0 back to 1, rapid selection cancellation, and live detection resuming after transitions. Checkout belt reported 19.966667 seconds at playbackRate 1; console checks showed no errors.

Each entry in `dist/config.js` has its own class list. Fruit demos recognize apples, bananas and oranges only; people mode recognizes people. The sidebar now shows presence rather than counts: images and labels brighten to full opacity for confirmed detections and dim to 25% otherwise, over 500 ms. Images are 72 px desktop / 80 px wide / 64 px small, and labels are 23–29 px. Numeric counts, total, row dividers and scene captions are removed to keep the summit presentation focused on recognition. Accessible item labels also indicate detected/not currently detected. Camera mode offers independent Produce / People checkboxes and changes class filters without reopening the camera. All recognition is model output, never scripted.

New-track confidence thresholds remain fruit .48, people .60. Existing tracks can continue at fruit .32 / people .40; new people require two consecutive above-threshold detections. Inference uses the visible centered cover crop, at most 640 px on the longest side, a single inference at once and at most 20 updates/second. Fresh detections discard unmatched older boxes of the same class, preventing echo counts. When an entire class has no accepted detections, linger is 180 ms for fruit and 250 ms for people. Association uses unsmoothed detection boxes; visual position weight is .85 fruit / .65 people, with 50 ms CSS interpolation. WebGL uses default small CPU helper handling. Current offline cache is `cv-demo-v17` with 29 manifest entries, including both new clips and posters.

The page has wider side padding and a single flex gap. Ready for offline use and Credits links were removed from the UI; offline caching and the separate credits document remain. Recognition-list fruit images are locally bundled H-E-B photos; the people icon is an original SVG.

## September 27 curbside image evaluation

Drive Temp `IMG_2986.JPG` is a 1920×1280 curbside photo showing two cars and one person. The original stays in ignored `reference/curbside/`; the shipped `media/curbside.jpg` is a 187,474-byte JPEG re-encoded without source metadata. Provenance is user-supplied; do not describe this photo as AI-generated.

“Curbside photo” is a manual sample with `type:'image'`, preset to Cars + People. Open it directly with `/?sample=curbside-photo`. Images display fully using contain, with detection boxes mapped to the letterboxed image. The existing model analyzes the whole image once at the existing 640 px preprocessing cap; it reruns only when source, filters, visible layout or page visibility changes. Image results remain displayed without continuous inference. Still people use the same .60 entry threshold in one pass; the two-frame video confirmation rule does not apply to an unchanging image. Status is blue “Analyzing sample image” during work, then steady green “Sample image analyzed.” Loading failures use “Couldn’t load sample image.”

The photo remains selected for inspection and never enters automatic video rotation. Auto-rotate videos is hidden while a photo is selected, and its previous checked state is retained when returning to a video. The five-video playlist still wraps from Checkout belt to H-E-B people. New image samples can be configured with the same type field. No upload UI or new detector was added.

Local browser checks at 1280×720 and 390×844 detected both cars and the person, with no extra boxes. The white car box includes part of the adjacent cart: localization is loose, so this is a promising static recognition check, not a guarantee for animated footage. Filters correctly rerun/clear results, and image boxes remain aligned after viewport changes. No detector thresholds changed.

## September 27 status and controls

The status has one text node: fade out for 250 ms, swap to the current highest-priority message, fade in for 250 ms. Priority is model failure, detection failure, source failure, model preparation, source loading, then active detection. The muted-blue dot has a subtle inward wave while loading; green has an outward wave only during active detection; red errors have no pulse. Reduced-motion preferences disable these animations. Active text is “Detecting in sample video” or “Detecting from camera,” with no suffix. Startup overlay says “Loading superpowers…” and “This may take a bit.” Recognition boxes use the Claude reference's 7% class-color fill and faint steady glow.

On phones, the video is sticky at the top. Recognition fills the remainder of the first viewport and the Camera / Demo toggle sits at its bottom. Below that screen are the sample selector, detection-group checkboxes and Auto-rotate videos checkbox. On desktop these controls remain in the right column. Sample presets are separate arrays stored in memory per clip; edits persist through switching/rotation until reload. People and Produce are independently enabled for the camera by default, with Cars hidden. Sample mode additionally offers Cars, initially off for all existing clips. Car thresholds are .60 entry / .40 continuation and 250 ms linger, with the existing model and tracker unchanged. The new car icon is local SVG. Auto-rotate starts checked; unchecking uses native video looping. No new footage was added.

## September 27 half-speed Checkout belt

The original 10-second clip is preserved at `reference/slow-checkout/original.mp4`. The shipped `dist/media/checkout-belt.mp4` is 19.97 seconds, silent 1280×720 H.264/yuv420p, approximately 30 fps, CRF 22, fast start, source metadata stripped; 2,001,893 bytes. FFmpeg `setpts=2*(PTS-STARTPTS)` plus motion-compensated `minterpolate` creates intermediate frames offline, so runtime playback stays at rate 1. Sampled interpolated fruit/bottle frames showed no obvious warping. Contact sheets and the intermediate render remain ignored under `reference/slow-checkout/`.

## September 27 tracking adjustments

Ian reported people misses/false positives, an orange box hanging mid-air, and duplicate echoes when a new ID replaced an old one. Keep changes in the existing detector/tracker, with no new runtime infrastructure or model. New people boxes require confirmation; lower continuation thresholds reduce flicker; current detections take priority over linger. Boxes have a subtle 5% white fill, and people use `#e1251b` red. Unrecognized item rows remain at 25% opacity; the later display simplification removes numeric counts and uses 500 ms fades.

A local frame inspection compared the 640 px preprocessing cap against the full visible crop (about 967×720 in the desktop check). Sampled people detections were nearly unchanged. The bundled graph internally resizes both inputs to 300×300, verified from its resize constant. Keep the 640 px cap. The orange coming from the bag had low-confidence detections around .34–.36 after placement, so do not promise perfect tracking through the hand occlusion. In separate 180-update desktop playback checks, the people baseline had stale tracks alongside fresh detections in 108 updates; the tuned version had zero. Early-scene transient fourth-person counts disappeared in the tuned sample. The final 180-update produce check also had zero stale boxes alongside fresh detections of the same class. The orange box disappears during low-confidence rapid movement instead of hanging mid-air; it is not continuously detected throughout placement. This is a focused spot check, not a general accuracy benchmark; small/occluded people remain imperfect. Temporary inspection pages and frame captures stay ignored in `reference/tuning/`; no diagnostic code ships.

## New H-E-B demos

Sources supplied in Drive Temp: `gemini_generated_video_6989CEE7.mov` (people, 8.5 seconds) and `gemini_generated_video_7A4F5B78.mov` (produce, 4.2 seconds). Original copies and contact sheets stay in ignored `reference/new-demos/`. Compressed to silent 1280×720 H.264/yuv420p at 24 fps, CRF 23, fast start, with source metadata removed. People: 6,661,319 → 2,694,637 bytes (59.5% smaller). Produce: 3,556,905 → 828,721 bytes (76.7% smaller). Posters come from the compressed clips. Local browser checks observed three people near the start and 1 apple / 2 bananas / 1 orange after placement. Counts vary with occlusion and framing; thresholds and detector behavior were not changed.

## Retired expo fruit and historical observations

Source: `~/My Drive/Temp/IMG_2974.MOV`, also preserved at `reference/IMG_2974.MOV`. The roughly 13-second clip shows 1 apple, 2 bananas and 2 oranges being placed. The retired `reference/retired-sep27/expo-fruit.mp4` is silent 1280×720 H.264, 30 fps, CRF 23 with fast start and source metadata removed: 24.6 MB became 2.7 MB. Before retirement, this scene reached the correct 1/2/2 arrangement after placement. Occlusion while placing fruit can temporarily suppress detections.

Development-Mac browser spot checks covered repeated loops, scene switching, 390 px mobile layout and offline reload. The real fruit reached the correct five-item total on desktop, mobile and the deployed site. Median inference was roughly 33 ms in a short local run, with stable tensor counts; supermarket playback reported zero dropped frames over two loops. These observations are not a guarantee on event hardware. Physical expo camera, permissions and Safari behavior still need checking on that hardware. No test suite was added.

Recommend even lighting, fruit apart and centered, and withdrawing the hand between placements. The pretrained model has no grape, pear or lemon categories. Do not add fake labels or lower thresholds indiscriminately to make other fruit appear supported.

## Latest creative direction: seed image for Gemini people video

The user is generating a new people-counting clip in Gemini. They want sparse, believable supermarket activity in H-E-B context, different directions/depths, a cart shopper, a basket shopper and a partner greeting someone at a staffed checkout.

The latest seed and matching prompts are tracked here:

- `docs/video-seeds/heb-staffed-checkout-v3.png`
- `docs/video-seeds/heb-staffed-checkout-v3-prompt.txt`

Use **v3** as the current seed. It puts the cashier behind a staffed register and conveyor, greeting the customer, whose cart contains separate unbagged groceries. The shopper with a red basket is farther back. The generated image is a fictional store scene, not documentation of an actual location. The supplied H-E-B people video is now in the app; its exact seed lineage is unconfirmed.

Earlier versions are retained in the same directory for context:

- v1 (`heb-three-shoppers-v1`): user liked the framing but rejected the staged lineup.
- v2 (`heb-checkout-candid-v2`): user liked the sparse candid arrangement but correctly flagged that the partner looked like he was showcasing self-checkout and the cart already had bagged groceries.
- v3 (`heb-staffed-checkout-v3`): correction of those two retail-workflow errors; latest delivered image. Ian subsequently supplied the H-E-B people clip.

All were made with the built-in image-generation tool. Each prompt text file includes the generation/edit prompt and a suggested Gemini animation prompt. The local copies in `reference/video-seeds/` remain too.

## Next work / unresolved choices

- Let Ian select the useful Gemini fruit clips and optionally timestamp ranges. Suggested format: “Add banana, 2–8 seconds.” We can trim and curate the media.
- Automatic cycling with fades is now implemented using the existing `DEMOS` order. Per-clip trims and a combined montage are not implemented.
- Expo fruit, Supermarket and Fruit display are retired at Ian’s request. Original/retired media remain local-only. Older solo-shopper footage also remains out of the lineup.
- The new H-E-B people and produce videos are added; keep them available for curation. The real supermarket scene is now retired.
- Car detection is configured (COCO class 3). The manual Curbside photo sample enables Cars + People; the five videos still do not enable Cars. Ian is evaluating the photo before generating curbside footage. Camera mode deliberately excludes Cars.

## Files and local-only references

Everything needed to run/deploy, plus the seed images/prompts and handoff, is tracked in Git. These source/exploration files are intentionally local-only under ignored `reference/`:

- Original Drive archives and model/demo exploration, including Claude and Gemini alternatives.
- `IMG_2974.MOV`: original phone footage; contains source metadata. Do not publish it as-is.
- `previous-demo-media/`: retired videos, posters and older icons. Four Gemini clips were copied back into `dist/media/` unchanged.
- `footage-candidates/`: five downloaded Pexels store/parking clips, contact sheets, sources.json and a comparison index.html. Sources for published footage are in `SOURCES.md` and `dist/credits.html`.
- `video-seeds/`: local originals of the tracked seed versions.

Drive intake folder on this Mac: `~/My Drive/Temp`. A fresh Git clone will not include ignored reference material, but has all runtime assets and the seed images. Do not depend on previous browser tabs, Python server processes or temporary ffmpeg paths surviving a new session.

For video conversion, an ffmpeg binary was available through `uv run --with imageio-ffmpeg python ...` and `imageio_ffmpeg.get_ffmpeg_exe()`. It is not an app dependency. Keep outputs H.264/yuv420p MP4, silent, fast-start, metadata stripped; all deployed individual files must stay below Cloudflare Pages' 25 MiB limit.

## Publish workflow

1. Make focused changes inside this repository; keep `reference/`, `.env*`, `node_modules/` and `.wrangler/` ignored.
2. For app/media changes, sync `dist/offline-assets.json` and bump the cache version in `dist/sw.js`.
3. Use focused browser checks as needed. Verify the model still runs and controls switch cleanly; no test-suite work.
4. Commit and push to `main`, then use `npm run deploy` for actual app changes. Documentation/seed-only commits do not require redeploying unchanged `dist/`.
5. Check the live app after deployment; the main alias can take a moment to update.

Wrangler credentials are local, outside the repository. If login expires, use `npx wrangler login`. The Pages project already exists. README has initial creation details; no hosting migration or GitHub Actions setup is needed.
