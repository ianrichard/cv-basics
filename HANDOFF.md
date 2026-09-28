# Session handoff — September 28, 2026

## Start here

This is Ian's standalone computer-vision demo for an H-E-B front-end service summit / expo. It deliberately stays separate from the more complicated `~/Sites/alian` app. The working directory is `~/Sites/cv-basics`.

- Public repository: https://github.com/ianrichard/cv-basics
- Live app: https://cv-basics.pages.dev/
- Latest direction: follow the latest Drive Temp mockup. Mobile header is Explore Computer Vision + ⋮ only; video, story and single vertical item stack follow. Bottom source picker has overflowing thumbnails and a separate fixed Camera button on the right. Desktop follows the September 28 browser mockup: video above a two-line identity, scrolling carousel, Camera and ⋮ row. The right column holds only story/items, centered against the video with a small optical offset. Compact desktop widths put thumbnails on a second footer row. No Detecting text/dot; centered padded messages only for model startup, camera permission and errors. Settings/About open in a dark frosted desktop modal/mobile sheet; ⋮ has no active appearance. About uses the complete supplied Google Doc copy, with wrapping technical details. Detector and mobile video proportions remain unchanged.
- Current immutable deployment: https://d863328a.cv-basics.pages.dev/ (app commit `3e5564c`). Published with `npm run deploy`. Immutable and production CSS/service-worker/offline manifest match the working tree.
- Latest checks: 1280×859 desktop, 900×720 compact desktop and 390×844 mobile for the footer mockup update. Verified story alignment, scrolling thumbnails with fixed buttons, menu opening/closing with focus restored, unchanged mobile video/dock geometry, no horizontal page overflow or console errors. Prior checks cover full modal/About content, camera permission/error/retry fixture flows and scene transitions. Physical camera/touch still need event-device checks; no test suite added.
- Local deploy command: `npm run deploy`; development command: `npm start` (localhost:8000). There is no GitHub auto-deployment workflow.

## User priorities and preferences

Stability and performance first, then curation and simplification. Avoid new features, complex tracking, model swaps, framework changes or tuning without evidence. The user requested no test suite. Local browser checks are appropriate. Keep the local Wrangler deployment workflow. Do not remove all AI clips merely because real footage works: the user liked some of them and wants to choose the keepers.

## Current app

`dist/` contains source and deployable files. TensorFlow.js 4.22.0 and SSD Lite MobileNet V2 are bundled locally. There are no API keys, backend or runtime CDN dependencies.

Five demos now form an automatic repeating playlist:

1. Produce at Checkout — default; “Computers can see produce.”
2. Checkout belt — “Even on the move.”; half-speed source, about 20 seconds.
3. People in Store — “Recognize service with a smile.”; people detection only.
4. Curbside — “And learn how to improve operations.”; cars and people, 6.83 seconds.
5. Produce at Home — “Bringing bold promises home.”; fruit-on-table scene.

Expo fruit, Supermarket and Fruit display were removed from the app and offline cache at Ian's request. Their media and posters are preserved locally under ignored `reference/retired-sep27/`.

At each clip's end the video and boxes fade out over 500 ms, the next clip loads with detections cleared, then fades in over 500 ms. The playlist wraps from Produce at Home to Produce at Checkout. Manual selection switches gracefully and continues the playlist from the selected clip. Generation tokens cancel superseded transitions. Reduced-motion preferences disable fades. Camera mode now has independent People / Produce checkboxes, both on by default, and does not auto-cycle. No second decoder, framework or runtime dependency was added. Local browser spot checks confirmed automatic advancement and wraparound, opacity fading from 0 back to 1, rapid selection cancellation, and live detection resuming after transitions. Checkout belt reported 19.966667 seconds at playbackRate 1; console checks showed no errors.

Each entry in `dist/config.js` has its own class list. Fruit demos recognize apples, bananas and oranges only; people mode recognizes people. The sidebar now shows presence rather than counts: images and labels brighten to full opacity for confirmed detections and dim to 25% otherwise, over 500 ms. Images are 64 px desktop / 56 px mobile, with 24 px desktop / 23 px mobile labels. Numeric counts, total, row dividers and scene captions are removed to keep the summit presentation focused on recognition. Accessible item labels also indicate detected/not currently detected. Camera mode offers independent Produce / People checkboxes and changes class filters without reopening the camera. All recognition is model output, never scripted.

New-track confidence thresholds remain fruit .48, people .60. Existing tracks can continue at fruit .32 / people .40; new people require two consecutive above-threshold detections. Inference uses the visible centered cover crop, at most 640 px on the longest side, a single inference at once and at most 20 updates/second. Fresh detections discard unmatched older boxes of the same class, preventing echo counts. When an entire class has no accepted detections, linger is 180 ms for fruit and 250 ms for people. Association uses unsmoothed detection boxes; visual position weight is .85 fruit / .65 people, with CSS interpolation over the selected detection interval (125 ms at the 8 FPS default). WebGL uses default small CPU helper handling. Current offline cache is `cv-demo-v47` with 39 manifest entries, including five small scene thumbnails.

The page has wider side padding and a single flex gap. Ready for offline use and Credits links were removed from the UI; offline caching and the separate credits document remain. Recognition-list fruit images are locally bundled H-E-B photos; people and car images are supplied photographic cutouts.

## September 28 desktop identity and controls under the video (current)

Ian supplied a browser-edited screenshot with no top-right header. Desktop now uses one CSS grid to place the video beside story/items, then a left-column control row: two-line Explore / Computer Vision, 96×64 scene thumbnails, Camera and ⋮. The buttons remain fixed while thumbnails overflow; the camera divider is removed on desktop. The grid uses existing elements via display:contents; no duplicated controls or resize JavaScript. Footer spacing is 24 px and bottom page padding is 32 px. Desktop item tiles are 64 px with 20 px gaps and 24 px labels; the narrative is 34–42 px. The story gets a 12 px optical offset through 24 px top padding. At 721–1000 px the thumbnails occupy a separate footer row. Mobile CSS and video geometry are unchanged.

Focused checks at 1280×859, 900×720 and 390×844 verified the mockup layout, compact footer, fixed controls, modal open/close/focus restoration, no page overflow and clean console. Mobile video remains 342×256.5 and its source dock stays at the viewport bottom. Cache v47 ships CSS; v46 was local refinement. No detector/runtime changes or test suite.

## September 27 desktop spacing and narrative refinement (previous iteration)

People in Store now reads “Recognize service with a smile.” and Curbside reads “And learn how to improve operations.” Desktop source controls move underneath the video at full left-column width, with a 24 px gap; the video reserves 88 px for that row and gap so both fit within the existing outer padding. The right header gains 24 px top/bottom padding, and the narrative/items center together in its remaining height. Mobile layout and video proportions are unchanged, including its fixed bottom picker.

Focused local checks at 1280×720 confirmed all five thumbnails fit without horizontal overflow, equal vertical space around the narrative/items, both new titles and a clean console. At 390×844 the video remains 342×256.5, the dock stays fixed at the viewport bottom, and the page has no horizontal overflow. Cache v45 updates HTML/CSS/config; no detector changes or test suite.

## September 27 Drive mockup and supplied About content (previous iteration)

Drive Temp `BE036398-64B8-4C88-969A-2512372E7112.jpg` provides the latest mobile reference. Ian explicitly kept items in one vertical stack even though the sketch uses columns. `About section.gdoc` supplies all About prose and the technical table. Local reference copies are ignored under `reference/sep27-mockup/`.

The header is now title + ⋮; the play/Camera segment was removed. Desktop layout uses the full-height left canvas, with the header at the right top and a 48 px gap before story/items. The source dock sits at the bottom of the right column. Mobile keeps the header/video/story/items order and a fixed bottom dock. Thumbnails retain readable widths and overflow horizontally, with progress clipped inside their radii. A divided Camera button stays at the dock’s right and inverts in Camera mode. Thumbnails remain available in Camera mode so selecting one returns to demos. Scene switches center the active thumbnail without changing vertical page position.

The Detecting indicator/dot and normal status states are removed. A padded center-aligned message appears only for model loading, camera permission or errors; errors provide retry. Browser permission-query fallback keeps the request understandable on browsers lacking that query. Normal playback clears messages. Existing 500 ms full-out/full-in scene fades remain. During this revision Ian moved Settings/About into a modal/sheet to give the content more space. A native dialog supplies focus containment and background inertness. Desktop uses a centered frosted dark modal with two-column Settings; mobile uses a tall bottom sheet. Tabs and the close button stay fixed, the body scrolls, and Escape/outside click/close dismiss with focus restored to ⋮. The menu button has no active background. Playback continues under the frosted layer, looping the current scene. Tabs retain sequential fades. The long About copy is preserved, with its technical table converted to a wrapping definition list and the credits link retained.

Local desktop/390 px/320 px browser checks covered fit, overflow, picker navigation, vertical items, full About copy/technical rows and internal scrolling with continuing playback. A real-model local fixture covered permission pending/success and missing-camera/retry; the message center matches the canvas center. Final modal checks covered desktop/390 px/320 px sheet sizing, two-column Settings, About scroll, background playback, plain ⋮ appearance and Escape restoring focus/unlocking page scroll. Cache v44 includes revised HTML/CSS/JS; v42/v43 were local development. No detector/tuning changes or test suite.

## September 27 top header, Tabler controls and fixed carousel (previous iteration)

Ian asked to move the source/menu controls to the top, away from native mobile bottom controls. The shared header now reads Explore Computer Vision with a Demos/Camera segment and ⋮. Alian uses `@tabler/icons-react`; its shared action styles provided the 44 px button sizing and restrained surface/selected treatment. This app bundles the installed Tabler SVG geometry inline (filled play/camera, outlined camera-rotate and dots-vertical), with the MIT license, without adding React or another runtime. Header controls are consistently 44×44 px with 24 px glyphs; a quiet sliding segment background identifies selection. The menu inverts when open. Explore wraps separately at 320 px and stays on one line at 390 px.

The carousel is fixed at the bottom in Demo mode, five thumbnails always visible. Each image clips its playback-progress bar inside its radius. Active state uses full versus subdued opacity, without an outline. Camera mode hides the carousel. The old stage hit target, hover/tap tray handlers and styles, obsolete status state variables and Lucide license were removed. Settings/About keep the existing sequential fades and scrolling in the story area while video plays. Camera flip/status share a vertical centerline and symmetric optical edge spacing. Mobile video size is unchanged; header/video remain pinned during content scrolling. Desktop keeps the story adjacent, with height reserved for header and carousel.

Browser checks covered desktop, 390×844 and 320×568, thumbnail selection, Settings/About, internal scrolling and source retention, real-model Camera fixture switching, precise control/overlay alignment and clean console output. Model/tuning unchanged. Cache v41 ships updated HTML/CSS/JS, credits and Tabler license; v40 was local styling work.

## September 27 compact footer and story-area preferences (previous iteration)

The footer now holds Computer Vision, a Demos/Camera icon segment and ⋮. It stays at the bottom of the right column on desktop and is fixed above the mobile safe area, with space below the story so the last item can scroll clear. The menu is background-free when closed and white/inverted when open. Settings/About replace the narrative and rows, using a 250 ms full fade-out before swapping content and a separate fade-in. Tabs support arrow keys, Home/End and Escape. Their scroll area is bounded to the remaining viewport on mobile; the video retains its prior size and position.

Playback and inference continue while preferences are open. The current demo loops to keep its settings context stable, then resumes automatic rotation after closing. Camera remains acquired and playing. The top carousel is now flush to the video edge, thumbnails/progress only; the title and Camera tile are removed. Tap/hover/keyboard reveal behavior remains. Detecting is plain matching green text/dot with subtle text shadow, no panel background, and does not flicker to Loading on every scene. Loading is reserved for model startup. Errors, permissions and disabled-filter guidance remain. Camera flip is the only bottom-right canvas control.

Focused browser checks covered desktop, 390×844 and 320×568 mobile layouts, internal scrolling, source segment selection, live Camera retention using the local real-model fixture, keyboard tabs/Escape, and source fades. A trace measured the source swap at picture/story opacity 0 with approximately 500 ms outgoing/incoming transitions. Final CSS removes an unnecessary minimum panel height on short screens and preserves pointer access to the desktop flip control. Offline cache v39 includes the revised HTML/CSS/JS; v38 was local development. Detector/model/tuning unchanged.

## September 27 hover/tap carousel and video-scoped panels (previous iteration)

Ian rejected the separate top bar / permanent thumbnail-strip mockup in `reference/layout-proposal/`. The implemented direction puts the controls over the video. A frosted tray at its top appears on mouse hover, keyboard focus, or a touch tap on the picture. A second touch tap, outside touch, Escape, or mouse leave dismisses it (keyboard focus keeps it available). Five 192×108 JPEG thumbnails come from the actual clips, with a thin active-scene progress bar based on media time. Camera is the last carousel choice, never included in automatic rotation. Small screens scroll the tray horizontally. It centers the selected scene only on opening, avoiding focus-induced scroll jumps during selection.

The right column is only the narrative and recognized-item rows, vertically centered on desktop and directly below the unchanged mobile video. Explore Computer Vision remains in the tray and browser title. Bottom-left status has a steady minimum width and lightly tinted, blurred background. Bottom-right tools open Settings / Info as full-video frosted dialogs. Settings uses a container-query two-column layout at video widths of 540 px or more; smaller panels and Info scroll inside the video. Dialog headers/close buttons stay fixed within the panel. Keyboard focus is contained/restored and Escape closes. The source, displayed frame and story stay present; inference/buffering and automatic rotation pause while a panel is open, then resume without reacquiring Camera.

Scene transitions now freeze the outgoing media, boxes and story, await the actual 500 ms CSS fade-out completion, then change the source/title/items at zero opacity. A separate 500 ms fade-in follows readiness. This fixes early text/box changes and avoids a source swap before the fade has fully finished. Reduced motion disables fades; generation tokens still cancel stale source requests. Camera's detection-driven wording and model/tracking thresholds are unchanged.

Focused local browser checks covered desktop, 390 px and 320 px: hidden/revealed tray, camera last, source selection at both ends of the scrolling tray, status/tool separation, Settings columns, internal Info/Settings scrolling with page scroll unchanged, keyboard focus trapping/Escape, retained Camera source and story, and live recognition. A local-only fixture used actual model inference on a canvas MediaStream; synthetic touch clicks checked reveal/dismiss. A temporary transition observer recorded both picture and story at exactly zero opacity at source swaps and separate approximately 500 ms outgoing/incoming transitions. Automatic final-demo → first-demo wraparound was observed. No test suite added; hardware touch/camera checks remain for the event device. Offline cache v37 includes HTML/CSS/JS/config and five thumbnails; v35/v36 were local development.

## September 27 heading, underline navigation and video status (previous iteration)

The shared header now leads the recognition column: a single-line “Explore Computer Vision” scales 22–34 px to fit, followed by contiguous white underline navigation with inline Lucide icons. Native navigation buttons retain pressed state, keyboard access and focus when the shared header moves into Settings/About. Hero narratives use weight 800 at 34–44 px desktop and 34–40 px mobile, retaining balanced wrapping and a 32 px gap to the items. Header-to-story spacing is 40 px desktop / 32 px mobile. Mobile video remains 4:3, capped at 38svh; navigation now scrolls with the content instead of fixing to the bottom.

The video status is a compact translucent bottom-right overlay. Dot and text fade together and share their color; pulse animations are removed. Loading, permission, pause, no-filter and error priorities remain, with retry inside the overlay. The flip-camera control moved bottom-left to avoid overlap. Camera narrative uses existing confirmed tracks without changing detection behavior: person presence takes priority over produce; a cleared frame returns to “Looking…”.

Focused browser checks covered desktop, 390 px and 320 px layouts, one-line header/navigation fit, matched dot/text colors, normal model inference, Settings/About switching and retained keyboard focus. A local-only camera fixture fed blank frames, the people clip and the produce clip through a canvas MediaStream into the real detector, verifying all three Camera titles and return to Looking. A missing-camera fixture verified the red error/retry overlay and recovery. Fixture code stays ignored under reference/ and does not ship. Physical camera hardware still needs checking on the event device. No test suite or new runtime dependency was added. Offline cache v34 ships HTML/CSS/JS; v33 was a local styling iteration.

## September 27 narrative first, identity/status at the bottom (previous iteration)

Ian rejected the shortened mobile video and asked for: video → larger narrative (no divider) → items → flexible space → Explore Computer Vision → status → navigation. The existing Demos / Camera / Settings / About navigation stays available.

The recognition column and its content are flex columns. Narrative and rows come first in the DOM; `.explore-footer` uses `margin-top:auto` with a 40 px minimum gap after the items. Its heading is one line, scaling 18–22 px by column width. The old divider and forced Explore line break are gone. Desktop gutter still equals page padding; desktop narrative size remains 30–40 px. Mobile narratives increase to 34–40 px (39 px at 390 px, 34 px at 320 px), with balanced wrapping. Mobile video is restored exactly to `min(38svh, (100vw - 48px) * .75)`.

Status dot and text share a state-driven color through `currentColor`: blue loading, green detecting/complete, gray idle, red error. The shared color transition keeps them matched throughout changes. Flex `align-items:center` replaces the dot’s old top offset. Measured centers differ by less than .01 px. Detection/status logic is unchanged.

Focused browser checks passed at 390×844, 320×568 and 1280×800: video restored to 342×256.5 at 390 px, narrative/rows precede footer, identity stays on one line, all five narratives fit without horizontal overflow, short-screen scrolling reaches footer/navigation, and footer clears navigation. At 390 px fewer-item scenes use the available flex space to keep identity/status near the bottom. Active status colors match exactly, and normal playback reports no console errors. No detector changes or tests added. Offline cache v32 updates HTML/CSS.

## September 27 roomier layout and natural wrapping (previous iteration)

Ian supplied a visual mockup and explicitly relaxed the one-line narrative constraint. Desktop video-to-content gutter now equals responsive page padding (55.04 px at 1280 px). Content starts 16 px below the video top. “Explore” has its own line above “Computer Vision”; the learning-demo subline is removed. About still provides the educational framing. Header-to-divider padding is 28 px, divider-to-story spacing is 32 px, and story-to-items remains 32 px.

Narratives now use 30–40 px, weight 750 and 1.15 line-height, with 30 px on mobile. `text-wrap: balance` distributes short heading lines; `pretty` is the fallback for browsers supporting it without balance. A local pretty-only check still left a lone final word in the opening heading, so balance is preferred. No new JS, forced story breaks or text shortening. The story may occupy one or two lines; no empty second line is reserved.

Mobile video now uses native 16:9 proportions, capped at 30svh, freeing room for larger text. At 390×844 the default three-item view fits above navigation (last item bottom about 705 px, nav top 755 px). At 320×568 the page scrolls; all rows remain reachable between sticky video and fixed navigation, and the final row clears navigation by about 37 px at the bottom. All five story lines checked at 320 px without horizontal overflow; desktop gutter and typography checked at 1280×800. Normal playback logged no errors. Offline cache v31 includes updated HTML and CSS; v29/v30 were local layout iterations only.

## September 27 educational framing and independent status (previous iteration)

The live content column now begins with “Explore Computer Vision” (H2), “A learning demo”, and a small dot with a single changing status label. A subtle divider precedes the narrative H1 and item list. The browser title is Explore Computer Vision. About explicitly describes illustrative possibilities, not an announced project or deployed service.

The updated five story lines are listed in the current playlist above. “Recognize service with a smile.” avoids adjacent uses of “serve” and fits one line at 320 px. All story lines retain terminal periods. Camera retains “Searching for life.” The existing order, detector, media and tuning remain unchanged.

Loading / Detecting now occupy their own 14 px status line. Permission, pause, no-filter and error messages keep their priorities and retry behavior there. Story text persists during loading/errors and fades independently when selecting a new scene; it no longer shares the status live region. Its responsive 18–28 px size and one-line minimum remain, with a 32 px gap before the item list. Intro divider has 24 px spacing on both sides.

Focused browser checks: all final story lines fit at 320 px; mobile/desktop hierarchy and active detection checked; Settings scene changes preserve separate status and title; a deliberately unavailable model shows the error/retry above an intact story title. No test suite added. Offline cache v28 updates HTML, config, app and CSS (v27 was a local intermediate only).

## September 27 approved narrative and sequence (previous iteration)

Ian approved the exact five lines listed above. Preserve their wording and order. The opening now uses Produce at Checkout, followed by belt / people / curbside / home, then repeats. Existing sample keys and deep links still work. Camera retains “Searching for life.”

The recognition column is an inline-size container; its status heading scales with available width (18–28 px, 7cqw). This keeps all five approved lines on one line at 320 px without shortening the copy. The title measures about 19 px at 320 px and 24 px at 390 px. Dot and gap scale with it. Loading and error text may wrap as needed; the one-line minimum and matching 32 px mobile gaps remain. Other page headings retain their existing size.

Focused browser checks verified every story line at 320 px, 390 px and desktop presentation, scene selection, live detection and automatic wraparound from the closing home clip to the opening checkout clip. No detector or media changes; no test suite added. Offline cache v26 updates config and CSS.

## September 27 story titles, balanced spacing and supplied icon (previous iteration)

The active H1 follows each scene’s human context, independently of its detection filters: People in Store → “Crossing paths.”; Produce at Home → “Fresh for later.”; Produce at Checkout → “Checking out.”; Checkout belt → “Dinner in motion.”; Curbside → “Heading home.” Camera uses “Searching for life.” Item names remain in the recognition rows. Loading, pause, empty-filter and error states keep their existing priority and text.

Removed the two-line minimum from the status heading and text. A one-line minimum keeps blank transitions stable without leaving an invisible extra line beneath short titles. Mobile video-to-heading and heading-to-items gaps both measure 32 px. All five scene titles and camera copy fit a single line at 320 px with no horizontal overflow; desktop rendering also checked. Scene selection, live recognition and normal-playback error logs passed focused browser checks. The camera phrase was checked in a temporary layout preview; physical camera hardware was not exercised. No detector changes or test suite.

Ian’s Drive Temp `F966BBB8-567E-48AC-A228-8E530E998C72.PNG` supplies the icon. Its original and the previous SVG stay ignored under `reference/app-icon/`. The unchanged artwork is exported at 32 px (favicon), 180 px (Apple touch icon), and 192/512 px (manifest), with source metadata stripped. Offline cache v25 includes all four exports.

This section supersedes earlier title-height and pending-icon directions below.

## September 27 lighter controls and title wrapping (previous iteration)

Active titles no longer have forced line breaks. “Looking for fruit” fits on one line at 320 px; a nonbreaking space keeps “Looking for” together. Longer titles wrap naturally, and the existing two-line minimum height still keeps transitions stable. Navigation has no outer/active borders; the active tab uses a subtle lighter fill. The flip-camera FAB has no border. Keyboard focus outlines remain for accessibility.

## September 27 navigation, contextual titles and images (previous iteration)

Demos / Camera / Settings / About is one full-width segmented control, with Lucide icons above labels. It remains at the right-column bottom on desktop and fixed above the safe area on mobile. All four fit at 320 px width. Settings and About are ordinary sections replacing the full live presentation with 250 ms opacity-out / swap / opacity-in. Only one section is exposed at a time; the fading main is temporarily inert. Rapid navigation uses a generation guard. No dialog, close button, backdrop, drawer CSS or modal focus handling remains.

Settings retains all expanded controls. Opening Settings/About pauses video playback, model inference and delayed frame copies; returning to the same source resumes playback (or restarts an ended clip). Camera source is retained to avoid reopening it just to adjust settings. Choosing a scene in Settings selects it without leaving Settings; Demos reveals it. Auto-rotation runs only in the live view. About explains recorded samples with live, local computation; camera usage; and the limits of object recognition.

The active H1 depends on enabled groups, not frame-by-frame detections: Looking for / fruit, Detecting / people, Detecting / cars, Detecting / people and cars, etc. Two deliberate lines reserve stable height while demo transitions fade the text to blank. Loading/errors retain the single heading and priority. The dot is .8em (roughly 22–29 px vs the former 10 px); animations/colors remain. Mobile video-to-title and title-to-items layout gaps are both 32 px; row padding was replaced with grid gaps to make them match visually.

Drive Temp File_001.png (person) and IMG_2988.PNG (car) replace the mismatched row SVGs. Originals stay in ignored reference/recognition-images/, along with retired SVGs. Shipped thumbnails are media/person.png (56,804 bytes) and media/car.png (43,118 bytes), cropped/resized to at most 256 px, preserving alpha and stripping EXIF/text metadata. The person uses a closer top-aligned crop in its white tile; car/fruit use contain. No AI image generation was needed. Lucide remains for interface controls only.

Local browser checks passed at desktop, 390 px and 320 px: the four icon/label segments fit without horizontal overflow; mobile video-to-title and title-to-items gaps each measured 32 px; fruit and combined fruit/people/cars titles kept the two-line title height (67.2 px at mobile size). Settings/About replace the full view, pause playback, retain settings, and return to live detection; rapid navigation settles on only the last selected view. Playback delay changed to 0.21 s and remained applied after return. Rotation continued and normal playback logged no errors. Physical camera hardware was not tested.

Ian will supply an app icon later. Do not generate or change it until supplied.

This section supersedes earlier layout/title/icon notes below.

## September 27 presentation simplification (historical)

The single H1 now carries status text and the existing dot. Normal labels: Loading Computer Vision (download + warmup), Loading Demo, Detecting, Allow Camera Access, and Loading Camera during startup. Errors include Model didn’t load 😕, No camera detected 😕, Sample video didn’t load 😕, Camera access declined 😕, Camera unavailable 😕, and Detection stopped 😕. Existing paused/no-filter states and error priority remain accurate; no status text appears on the canvas. The status text inside H1 is the only live status region, with the existing 250 ms out/swap/250 ms in transition. Header-to-items spacing is 40 px desktop / 32 px mobile.

All controls moved into an accessible native dialog, opened from a flat sliders icon beside the source segment. Desktop uses a right drawer; mobile uses a bottom sheet, max 85dvh. All sections are expanded, with internal scrolling. Native dialog handles focus containment and Escape; close button and backdrop clicks dismiss it, returning focus to Settings. Body scroll is locked only while open. Camera mode hides demo scene/rotation and Cars controls. No Tailwind or runtime icon library was introduced: shared CSS styles native controls, and the seven used Lucide SVGs are bundled inline or locally, with vendor/lucide-LICENSE.txt and credits.

The mobile sticky wrapper has app-background fill and 24 px top/side padding plus a 16 px lower buffer; it prevents content showing above/around the video when scrolling. Desktop keeps one outer padding. Video shadows are very faint without the old 8 px spread. CSS was consolidated to remove layered overrides. Default playback delay is now 0.20 s; 8 FPS, 40% fill and glow off remain. Detector code is unchanged.

Scene keys/media paths stay stable for existing links, but labels are People in Store, Produce at Home and Produce at Checkout. Remove orange's shipped MP4 is retired to ignored reference/retired-sep27/remove-orange.mp4 and removed from the manifest. Checkout belt and Curbside names are unchanged.

Local checks passed for active detection, scene selection, default 0.20 s delay and 0.01 s slider steps, expanded settings, Escape/backdrop dismissal with focus restoration, desktop layout, 390 px mobile sheet and 320 px sticky scrolling with all five item rows enabled. No horizontal overflow or normal-playback console errors. A deliberately unavailable model confirmed the single red error heading, retry action and no canvas status text. Physical camera was not exercised.

The app icon is still pending discussion: recommended four white detection corners around a green dot on the dark background. No new icon has been generated or shipped.

Earlier dated sections below describe historical iterations; this section supersedes their layout, labels and defaults.

## September 27 timing and single-label status

Ian selected 8 FPS and 40% background opacity as the defaults. The box movement transition is therefore 125 ms linear by default. The status overlay was removed from the video area entirely, including startup and errors. Only the existing single dot label carries status text; a Try again button appears beneath that label when needed. Existing status priority and fade-out/swap/fade-in behavior remain.

**Playback delay** is a tuning slider from 0.00 to 0.50 seconds in 0.01-second steps, formatted to two decimals. Default 0.00 uses the original native video directly with no frame buffering. When enabled, `playback-delay.js` holds back the displayed frames while inference continues on the original video/camera. One decoder is retained; a bounded/reused canvas queue captures at most 30 frames/second, capped at 1280×720 and 18 queued frames. This adds copy/render work only when enabled; memory is freed at zero, on source changes and when hidden. Video speed remains 1×. It is manual timing compensation, not prediction or a guarantee of exact synchronization: sampling, model latency and CSS interpolation vary.

The delayed tail is allowed to finish before automatic scene changes or single-clip restarts. Nonzero-delay single-video mode restarts through the existing fade after draining; zero-delay looping uses the original native loop. Source/seek/visibility changes reset the buffer. Reduced-motion still disables CSS movement fades independently of playback delay. Browser checks passed for 0.20 s looping, 0.50 s automatic rotation, mobile buffered presentation and zero-delay cleanup (presentation canvas reset to 0×0 and native video restored). A deliberate model-load failure confirmed exactly one status label, no stage text and a retry button in the header. Normal playback logged no errors.

## September 27 display tuning

Ian perceived a performance hit from object glow. Glow now defaults off; the status-dot animation is unchanged. Mobile page padding and the video/content gap are restored to 24 px (from 16/20 px). Desktop page padding remains the existing responsive 24–68 px.

A collapsed **Display tuning** section at the bottom of the debugging controls contains plain native inputs: Object glow on/off, Detection FPS 2–20 (20 labeled Max), Overlay background on/off, and Background opacity 0–100%. Defaults are now glow off, 8 FPS, background on at 40%, and playback delay 0.00 s. Values are page-local, not saved to storage. Opacity is disabled when the background is off. Settings apply immediately without restarting the source or model; playback delay is for video/camera, while images remain on-demand.

The FPS slider caps video/camera inference scheduling, not video playback speed or the browser's animation frame rate. Each box's linear position/size transition is one selected detection interval: 2 FPS → 500 ms, 4 FPS → 250 ms, 20 FPS → 50 ms. Reduced-motion overrides still disable movement transitions. Image analysis remains one pass on demand. Lower inference FPS does not eliminate the paint cost of animated glow.

Track matching now allows the immediately preceding observation across the actual interval between detection updates. This prevents low FPS from expiring an unconfirmed person before its second observation. Unmatched tracks still use their original linger, and current detections still remove stale same-class echoes. Entry/continuation thresholds, model and input resolution are unchanged. Browser spot checks verified 4 FPS with 250 ms transitions, 2 FPS with 500 ms transitions and confirmed people, glow switching, fill/opacity switching, and 24 px padding with no horizontal overflow at 390 px and 320 px. Normal playback produced no console errors.

## September 27 curbside video replacement

Drive Temp `gemini_generated_video_B7C6C377.mov` replaces the static Curbside photo. Its original stays in ignored `reference/curbside/`. The shipped silent 1280×720 H.264/yuv420p MP4 is 6.83 seconds, 685,538 bytes (65.8% smaller than the 2,004,601-byte source), CRF 23, fast start and source metadata removed. Its poster is extracted at 0.1 seconds, 74,294 bytes.

The final playlist entry is now **Curbside**, preset to Cars + People, with ordinary autoplay/loop behavior. Open `/?sample=curbside`; the old `/?sample=curbside-photo` link aliases to this video. It advances back to H-E-B people when auto-rotate is checked; unchecking loops Curbside. The old shipped photo moved to ignored `reference/curbside/curbside-evaluation.jpg` and is removed from deployment/offline cache. Generic image support remains for future evaluation. No detector or display settings changed.

Local desktop and 390 px mobile checks recognized cars and the person during playback, with no console errors. Boxes remain approximate during motion/occlusion. The compressed media decoded successfully.

## Historical September 27 curbside image evaluation

The following describes the earlier photo check; the video above now replaces it in the app.

Drive Temp `IMG_2986.JPG` is a 1920×1280 curbside photo showing two cars and one person. The original stays in ignored `reference/curbside/`; the shipped `media/curbside.jpg` is a 187,474-byte JPEG re-encoded without source metadata. Provenance is user-supplied; do not describe this photo as AI-generated.

“Curbside photo” is a manual sample with `type:'image'`, preset to Cars + People. Open it directly with `/?sample=curbside-photo`. Images display fully using contain, with detection boxes mapped to the letterboxed image. The existing model analyzes the whole image once at the existing 640 px preprocessing cap; it reruns only when source, filters, visible layout or page visibility changes. Image results remain displayed without continuous inference. Still people use the same .60 entry threshold in one pass; the two-frame video confirmation rule does not apply to an unchanging image. Status is blue “Analyzing sample image” during work, then steady green “Sample image analyzed.” Loading failures use “Couldn’t load sample image.”

The photo remains selected for inspection and never enters automatic video rotation. Auto-rotate videos is hidden while a photo is selected, and its previous checked state is retained when returning to a video. The five-video playlist still wraps from Checkout belt to H-E-B people. New image samples can be configured with the same type field. No upload UI or new detector was added.

Local browser checks at 1280×720 and 390×844 detected both cars and the person, with no extra boxes. The white car box includes part of the adjacent cart: localization is loose, so this is a promising static recognition check, not a guarantee for animated footage. Filters correctly rerun/clear results, and image boxes remain aligned after viewport changes. No detector thresholds changed.

## September 27 status and controls

The status has one text node: fade out for 250 ms, swap to the current highest-priority message, fade in for 250 ms. Priority is model failure, detection failure, source failure, model preparation, source loading, then active detection. The muted-blue dot has a subtle inward wave while loading; green has an outward wave only during active detection; red errors have no pulse. Reduced-motion preferences disable these animations. Active text is “Detecting in sample video” or “Detecting from camera,” with no suffix. There is no canvas status overlay. Loading/errors use only the dot label; the retry action sits underneath it when needed. Recognition boxes default to 40% class-color fill, with glow off. Display tuning can enable glow or change/disable the fill.

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
- Curbside video is now in the five-clip playlist with Cars + People enabled. The static photo is retired locally. Camera mode deliberately excludes Cars.

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
