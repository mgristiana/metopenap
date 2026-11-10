# METOPENAP PWA

Static PWA page based on the current METOPENAP WebApp interface. The Google Sheets database remains behind the existing Apps Script API. The page calls `gas(action, ...args)` through a small Cloudflare Worker because GitHub Pages cannot use Apps Script's `google.script.run` bridge directly and the Apps Script JSON endpoint does not provide browser CORS headers.

## Before publishing

1. Update and deploy the spreadsheet-bound Apps Script with `outputs/Code.gs` so `Poster` is an accepted proposal part. The poster link is stored in the existing submission content and `fieldData` columns; no new sheet column is needed.
2. Create a Cloudflare Worker from `worker.js`. Set Worker variables `APPS_SCRIPT_URL` to the deployed Apps Script `/exec` URL and `ALLOWED_ORIGIN` to the exact GitHub Pages origin for this repository. For project Pages the origin is still `https://<owner>.github.io`; do not add a trailing slash.
3. In `index.html`, replace `https://SET_CLOUDFLARE_WORKER_URL` with the Worker URL (`https://…workers.dev`).
4. Publish this folder as the root of a GitHub Pages repository. For a project site, `manifest.webmanifest` and service-worker paths are relative so they work under `/repository-name/`.
5. Open the GitHub Pages HTTPS URL on iPhone/iPad and use Share → Add to Home Screen.

The service worker caches only the app shell. Sign-in, proposal submissions, review actions, notifications, and all Sheets data still require an internet connection.
