# Working on cv-basics

Read `HANDOFF.md` first for current state, pending decisions and media locations, then `README.md` for run/deploy instructions.

- Priority: stability and performance, then curation and simplification. Keep changes small; preserve the existing detector unless a concrete issue requires a change.
- The user requested no test suite. Use focused browser spot checks when useful; do not add tests or a testing framework.
- `dist/` is the editable static app and deployment output. No build step, backend, API keys or runtime CDN is needed.
- `npm start` serves locally; `npm run deploy` publishes directly to Cloudflare Pages. Git push alone does not deploy. Keep this simple workflow.
- Bump the service-worker cache version and update `dist/offline-assets.json` when changing shipped assets.
- `reference/` contains source footage and exploration material; keep it out of Git and deployment. Curated seed images and prompts are tracked in `docs/video-seeds/`.
- Keep credentials, environment files, raw phone metadata and large source videos out of the public repository.
- Update `HANDOFF.md` when the current direction or a pending decision changes.
