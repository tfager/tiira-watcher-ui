# tiira-watcher-ui
React &amp; Typescript UI for tiira-watcher with OpenStreetMap embedding

* Using [Leaflet](https://leafletjs.com/) and [React-leaflet](https://react-leaflet.js.org/docs/start-introduction/) for map rendering
* Using [Github Actions and Google Cloud Run](https://github.com/google-github-actions/setup-gcloud/blob/main/example-workflows/cloud-run/README.md) for deployment

## Setup

Go to Firebase console, register an app for your project. Copy the file [template.env](template.env) into `.production.env` and/or `.dev.env`
and copy the configuration items from firebase there.

Also add API_GW_URL from the backend GCP project hosting [tiira-watcher](https://github.com/tfager/tiira-watcher).

Set the following to Github Actions for building:

Env settings:
* `GCR_PROJECT`: Name of the project to host the Google Cloud Run image

Env secrets:
* `REACT_ENV`: contents of the `.production.env` or `.dev.env` file
* `GCR_SA_KEY` contents of the service account JSON from Google cloud platform project setup

## Testing dev build

`npm run build:dev`

`npx serve -s dist`

## Testing docker

`./build.sh`

`./local-run.sh`

## Deploying

Takes place from GHA workflow: PR build builds the docker image (including nginx), which is pushed to GCP artifact registry.
Terraform in tiira-watcher project handles the deployment to cloud run. 

## Misc notes

For local running, do `cp .dev.env .local.env` and edit accordingly.

Needed to install(/mark as exception) package autoprefixer to fix [this](https://stackoverflow.com/questions/72511039/autoprefixer-replace-color-adjust-to-print-color-adjust-the-color-adjust-short)
