# tiira-watcher-ui
React &amp; Typescript UI for tiira-watcher with OpenStreetMap embedding

* Using [Leaflet](https://leafletjs.com/) and [React-leaflet](https://react-leaflet.js.org/docs/start-introduction/) for map rendering
* Using [Github Actions and Google Cloud Run](https://github.com/google-github-actions/setup-gcloud/blob/main/example-workflows/cloud-run/README.md) for deployment

## GHA Setup

Env secrets:
* `FIREBASE_API_KEY` from https://console.firebase.com/ (Settings/general, web API key)
* `GCR_SA_KEY` from Google cloud platform project setup

## Misc notes

For local running, do `cp .production.env .local.env` and edit accordingly.

Needed to install(/mark as exception) autoprefixer to fix [this](https://stackoverflow.com/questions/72511039/autoprefixer-replace-color-adjust-to-print-color-adjust-the-color-adjust-short)
