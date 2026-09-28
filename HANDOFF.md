# Handoff

Current state, decisions and open items for anyone continuing this work. Commands are in [README.md](README.md), working rules in [AGENTS.md](AGENTS.md), asset provenance in [SOURCES.md](SOURCES.md). Change history is in Git; don't log iterations here.

## Context

Ian's standalone computer-vision demo for an H-E-B front-end service summit / expo. It deliberately stays separate from the more complex `~/Sites/alian` app.

- Repository: https://github.com/ianrichard/cv-basics
- Live: https://cv-basics.pages.dev/

## Current app

**Playlist.** Five Gemini clips auto-rotate in `DEMOS` order (`dist/config.js`), wrapping around:

1. Produce at Checkout — “Computers can see produce.”
2. Checkout belt — “Even on the move.” (half speed, about 20 s)
3. People in Store — “Recognize service with a smile.” (people only)
4. Curbside — “And learn how to improve operations.” (cars and people; also opens with `/?sample=curbside`, and the old `curbside-photo` link still resolves)
5. Produce at Home — “Bringing bold promises home.”

Clip changes fade out fully over 500 ms, then swap the source, then fade in over 500 ms. Selecting a thumbnail continues the playlist from that clip. The current clip loops while Settings/About is open. Camera mode never auto-rotates and has its own Produce / People filters (both on). Cars are never offered in camera mode.

**Detection.** SSDLite MobileNet V2 on TensorFlow.js WebGL (no CPU fallback). Inference runs on the visible cover crop, capped at 640 px, one pass at a time, 8/s by default (2–20 adjustable). Thresholds for starting a new track: fruit .48, people and cars .60. A track can continue at .32 / .40. New people need two consecutive detections. A class lingers 180 ms (fruit) or 250 ms (people, cars) only when it has no current detections, and fresh detections replace stale same-class boxes. These values came from focused spot checks; change them only with evidence.

**Presentation.**
- Boxes are DOM elements that interpolate linearly between detections (125 ms at 8/s).
- In demos, boxes stay hidden for the first second of each clip. After that, each newly shown box plays the tile reveal (`dist/tile-reveal.js`: a temporary canvas and one shared animation loop that runs only while reveals are active).
- Revealed boxes then settle to a solid 18% fill with a 90% opacity border. Camera mode and reduced motion skip the reveal.
- The recognition list shows presence, not counts: items brighten when detected and dim to 25% otherwise.
- Titles use bundled Montserrat.

**Status messages.** No routine status text. A centered message appears only for:
- a first-time model download still running after 0.8 s, or a cached load not ready after 5 s;
- camera permission;
- errors, with Try again.

A `play()` refused by the browser (hidden tab power saving, autoplay rules) leaves the source paused rather than erroring, and it resumes on visibility or interaction.

**Layout.**
- Mobile layout runs through 1100 px: header, video, story, a single vertical item stack, and a fixed bottom picker with thumbnails plus a separate Camera button.
- Desktop puts the video on the left, with identity, the thumbnail carousel, Camera and ⋮ beneath it, and story/items on the right.
- Settings and About open in a solid right-side drawer.

**Settings defaults** (not persisted): auto-rotate on, glow off, 8/s, background on at 18%, playback delay 0.20 s.

**Service worker.** Cache-first from `dist/offline-assets.json`. Cloudflare's extensionless `/credits` maps to the cached credits page, and cached redirected responses are rebuilt so navigation works offline.

## Decisions to keep

- No new frameworks, runtime dependencies, model swaps or tracker rewrites without a concrete problem (priorities are in AGENTS.md).
- Keep some AI clips even though real footage works; Ian chooses the keepers. Expo fruit, Supermarket, Fruit display and Remove orange were retired at Ian's request.
- All recognition is live model output, never scripted.
- Rejected directions:
  - item thumbnail tags inside boxes (too heavy-handed);
  - a lingering tile grid as the settled box background;
  - a separate top bar with a permanent thumbnail strip;
  - numeric counts and totals;
  - Detecting text or status dots during normal playback.
- Items stay in one vertical stack even where a mockup showed columns.
- About copy is Ian's supplied text (“A demo of what’s possible”). Edit it only when asked.
- Don't add fake labels or lower thresholds to make unsupported fruit appear. COCO has no grapes, pears or lemons.

## Open items

- Check the actual event device: physical camera, permission prompts, Safari behavior and an offline reload.
- Ian may pick trims or keepers among the Gemini clips (for example “Add banana, 2–8 seconds”). Per-clip trims aren't implemented.
- Watch whether boxes that drop out and come back re-reveal too often on busy clips such as Checkout belt. If so, only replay the reveal after an object has been gone for a while.

## Local-only material

The ignored `reference/` folder holds original footage, retired media, footage candidates, tuning captures and exploration (see [SOURCES.md](SOURCES.md) for what came from where). A fresh clone won't have it, but has everything needed to run and deploy. New media from Ian usually arrives in `~/My Drive/Temp`.
