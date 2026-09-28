# Working on cv-basics

Read [HANDOFF.md](HANDOFF.md) first for current state, decisions and open items. Commands are in [README.md](README.md).

- Priority: stability and performance, then curation and simplification. Keep changes small; preserve the existing detector unless a concrete issue requires a change.
- No test suite or testing framework. Use focused browser spot checks when useful.
- `dist/` is both the editable app and the deployment output: no build step, backend, API keys or runtime CDN.
- Deploying and the offline cache-version bump are covered in README's Deploy section; follow it for any change to `dist/`.
- When adding or replacing assets, update [SOURCES.md](SOURCES.md) and `dist/credits.html`.
- Keep `reference/`, credentials, environment files, raw phone metadata and large source videos out of Git and deployment.
- Update HANDOFF.md when the current state, a decision or an open item changes. It describes the present; Git holds the history.
