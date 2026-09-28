# Asset sources and processing

Where each shipped file in `dist/` came from and how it was prepared. The public attribution page is [dist/credits.html](dist/credits.html); keep the two consistent when assets change.

## Runtime and model

| Asset | Source |
|---|---|
| `dist/vendor/tf.min.js` | [TensorFlow.js 4.22.0](https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js), Apache 2.0. |
| `dist/model/` | [TensorFlow SSDLite MobileNet V2](https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json) (COCO), graph plus five weight shards, 18.6 MB. Internally resizes input to 300×300. |
| `dist/vendor/montserrat-latin-wght-normal.woff2` | Montserrat Latin variable font from [Fontsource](https://fontsource.org/fonts/montserrat) 5.3.0, SIL OFL 1.1 (`dist/vendor/montserrat-OFL.txt`). Used for titles. |
| Inline SVG icons in `dist/index.html` | [Tabler Icons](https://tabler.io/icons), MIT (`dist/vendor/tabler-LICENSE.txt`). |

## Images

| Asset | Source |
|---|---|
| `dist/media/heb-apple.jpg`, `heb-banana.jpg`, `heb-orange.jpg` | H-E-B product images, URLs supplied by Ian: [apple](https://images.heb.com/is/image/HEBGrocery/000466634-1?hei=360&wid=360), [banana](https://images.heb.com/is/image/HEBGrocery/000377497-1?hei=360&wid=360), [orange](https://images.heb.com/is/image/HEBGrocery/000375168-1?hei=360&wid=360). |
| `dist/media/person.png`, `car.png` | Photographic cutouts supplied by Ian (Drive Temp), resized to at most 256 px, metadata stripped. |
| `dist/icon-32.png`, `icon-180.png`, `icon-192.png`, `icon-512.png` | App icon artwork supplied by Ian, metadata stripped. |
| `dist/media/*-poster.jpg`, `*-thumb.jpg` | Frames extracted from the matching bundled clip. |

## Video

All clips are Gemini-generated, fictional scenes supplied by Ian. Each is silent 1280×720 H.264/yuv420p MP4 with fast start and source metadata removed. Originals are kept locally in the ignored `reference/` folder.

| Clip | Source file | Processing |
|---|---|---|
| `add-banana.mp4` (Produce at Checkout) | `gemini_generated_video_6F23B4FE.MP4` | Original 10-second timing. |
| `checkout-belt.mp4` (Checkout belt) | `gemini_generated_video_128CF9EF.mp4` | Slowed to half speed (about 20 s) with FFmpeg `setpts=2*(PTS-STARTPTS)` and motion-compensated `minterpolate` to 30 fps, CRF 22; 2,001,893 bytes. Original in `reference/slow-checkout/`. |
| `heb-people.mp4` (People in Store) | `gemini_generated_video_6989CEE7.mov` | 8.5 s, 24 fps, CRF 23; 2,694,637 bytes. Original in `reference/new-demos/`. |
| `curbside.mp4` (Curbside) | `gemini_generated_video_B7C6C377.mov` | 6.83 s, CRF 23; 685,538 bytes. Original in `reference/curbside/`. |
| `heb-produce.mp4` (Produce at Home) | `gemini_generated_video_7A4F5B78.mov` | 4.2 s, 24 fps, CRF 23; 828,721 bytes. Original in `reference/new-demos/`. |

To process new footage, an FFmpeg binary is available without installing anything via `uv run --with imageio-ffmpeg python` and `imageio_ffmpeg.get_ffmpeg_exe()`. Keep the same output format, and keep every deployed file under Cloudflare Pages' 25 MiB limit.

## Retired

Retired media is kept locally, outside Git and deployment: Expo fruit (from phone footage `IMG_2974.MOV`, which contains source metadata and must not be published as-is), Supermarket, Fruit display and Remove orange in `reference/retired-sep27/`, and the earlier curbside photo (`IMG_2986.JPG`, user-supplied, not AI-generated) in `reference/curbside/`. [docs/retail-video-options.html](docs/retail-video-options.html) is an old footage survey, not the current lineup.
