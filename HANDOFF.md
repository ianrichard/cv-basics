# Session handoff — September 26, 2026

## Start here

This is Ian's standalone computer-vision demo for an H-E-B front-end service summit / expo. It deliberately stays separate from the more complicated `~/Sites/alian` app. The working directory is `~/Sites/cv-basics`.

- Public repository: https://github.com/ianrichard/cv-basics
- Live app: https://cv-basics.pages.dev/
- Latest app change: zero-count item rows fade to 50% opacity, returning to full opacity for positive counts over 250 ms. Reduced-motion preferences disable the transition.
- Corresponding immutable deployment: https://87fd803c.cv-basics.pages.dev/
- The opacity change is deployed. Local browser checks confirmed 50% opacity at zero and full opacity at positive counts; the detector still runs.
- Local deploy command: `npm run deploy`; development command: `npm start` (localhost:8000). There is no GitHub auto-deployment workflow.

## User priorities and preferences

Stability and performance first, then curation and simplification. Avoid new features, complex tracking, model swaps, framework changes or tuning without evidence. The user requested no test suite. Local browser checks are appropriate. Keep the local Wrangler deployment workflow. Do not remove all AI clips merely because real footage works: the user liked some of them and wants to choose the keepers.

## Current app

`dist/` contains source and deployable files. TensorFlow.js 4.22.0 and SSD Lite MobileNet V2 are bundled locally. There are no API keys, backend or runtime CDN dependencies.

Six separately selectable demos are currently live:

1. Expo fruit — default; Ian's actual prop fruit on a counter, compressed from `IMG_2974.MOV`.
2. Supermarket — real stock footage of shoppers, people counting only.
3. Add banana — Gemini clip.
4. Remove orange — Gemini clip.
5. Checkout belt — Gemini clip.
6. Fruit display — Gemini clip.

Each entry in `dist/config.js` has its own class list and description. Fruit demos count apples, bananas and oranges only, preventing hands classified as people from affecting the fruit total. The supermarket scene counts detected people currently in view; it is not cumulative footfall or store occupancy. Camera mode offers Fruit / People and changes class filters without reopening the camera. All displayed counts are model output, never scripted.

Keep existing model thresholds: fruit .48, people .60. Inference uses the visible centered cover crop, at most 640 px on the longest side, a single inference at once and at most 20 updates/second. Tracking uses the original 450 ms linger; box interpolation is 50 ms. WebGL uses default small CPU helper handling. Current offline cache is `cv-demo-v11` with 28 manifest entries. The app and stylesheet manifest URLs are versioned for this update.

The page has wider side padding and a single flex gap. Ready for offline use and Credits links were removed from the UI; offline caching and the separate credits document remain. Ledger fruit images are locally bundled H-E-B photos; the people icon is an original SVG.

## Actual expo fruit and observations

Source: `~/My Drive/Temp/IMG_2974.MOV`, also preserved at `reference/IMG_2974.MOV`. The roughly 13-second clip shows 1 apple, 2 bananas and 2 oranges being placed. `dist/media/expo-fruit.mp4` is silent 1280×720 H.264, 30 fps, CRF 23 with fast start and source metadata removed: 24.6 MB became 2.7 MB. The live/default scene reaches the correct 1/2/2 arrangement after placement. Occlusion while placing fruit can temporarily suppress detections.

Development-Mac browser spot checks covered repeated loops, scene switching, 390 px mobile layout and offline reload. The real fruit reached the correct five-item total on desktop, mobile and the deployed site. Median inference was roughly 33 ms in a short local run, with stable tensor counts; supermarket playback reported zero dropped frames over two loops. These observations are not a guarantee on event hardware. Physical expo camera, permissions and Safari behavior still need checking on that hardware. No test suite was added.

Recommend even lighting, fruit apart and centered, and withdrawing the hand between placements. The pretrained model has no grape, pear or lemon categories. Do not add fake labels or lower thresholds indiscriminately to make other fruit appear supported.

## Latest creative direction: seed image for Gemini people video

The user is generating a new people-counting clip in Gemini. They want sparse, believable supermarket activity in H-E-B context, different directions/depths, a cart shopper, a basket shopper and a partner greeting someone at a staffed checkout.

The latest seed and matching prompts are tracked here:

- `docs/video-seeds/heb-staffed-checkout-v3.png`
- `docs/video-seeds/heb-staffed-checkout-v3-prompt.txt`

Use **v3** as the current seed. It puts the cashier behind a staffed register and conveyor, greeting the customer, whose cart contains separate unbagged groceries. The shopper with a red basket is farther back. The generated image is a fictional store scene, not documentation of an actual location. It has not been added to the app or converted into a video.

Earlier versions are retained in the same directory for context:

- v1 (`heb-three-shoppers-v1`): user liked the framing but rejected the staged lineup.
- v2 (`heb-checkout-candid-v2`): user liked the sparse candid arrangement but correctly flagged that the partner looked like he was showcasing self-checkout and the cart already had bagged groceries.
- v3 (`heb-staffed-checkout-v3`): correction of those two retail-workflow errors; latest delivered image. Await user feedback / Gemini video.

All were made with the built-in image-generation tool. Each prompt text file includes the generation/edit prompt and a suggested Gemini animation prompt. The local copies in `reference/video-seeds/` remain too.

## Next work / unresolved choices

- Let Ian select the useful Gemini fruit clips and optionally timestamp ranges. Suggested format: “Add banana, 2–8 seconds.” We can trim and curate the media.
- Recommendation discussed: a short-video array keeps clip trimming and class selection simple. The current `DEMOS` array is a selector, **not an automatic playlist**. Automatic cycling, start/end trim configuration and a combined montage have not been implemented or requested as a final decision.
- Keep the actual expo fruit clip as a useful baseline. The user disliked the solo-shopper / “dude” footage; older solo-shopper footage remains out of the live lineup.
- Await the new Gemini people video based on the seed image. Inspect it for plausible action, separation, actual detection quality and performance before adding it. The current real supermarket scene remains available.
- Parking-lot footage was researched and downloaded, but no car mode was added. It is lower priority than the current fruit / supermarket demo.

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
