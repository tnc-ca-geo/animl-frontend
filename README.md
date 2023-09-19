# Animl Frontend
A frontend web app for viewing & labeling camera trap data by 
[The Nature Conservancy](https://www.nature.org/).

![Animl screenshot](screenshots/animl-frontend-v0.1.0.jpg)

## `Related repos`

- Animl API               http://github.com/tnc-ca-geo/animl-api
- Animl base program      http://github.com/tnc-ca-geo/animl-base
- Animl ingest function   http://github.com/tnc-ca-geo/animl-ingest
- Animl ML resources      http://github.com/tnc-ca-geo/animl-ml
- Animl desktop app       https://github.com/tnc-ca-geo/animl-desktop

## `Overview`

Animl is an open, extensible, cloud-based platform for managing camera trap data.
We are developing this platform because there currently are no software tools that allow 
organizations using camera traps to:

- ingest data from a variety of camera trap types (wireless, SD card based, IP, etc.)
- systematically store and manage images in a single centralized, cloud-based repository
- upload custom object detection and species clasification ML models and configure 
automated assisted-labeling pipelines
- Offer frontend web application to view images, review ML-assisted labels, 
perform manual labeling
- Offer an API for advanced querying and analysis of camera trap data
- Offer tools for exporting ML model training data

This repository contains the frontend web application for viewing and 
interacting with the camera trap data. It is a React app, using [Redux](https://redux.js.org/) (specifically [Redux Toolkit](https://redux-toolkit.js.org/)) for state management and [Vite](https://vitejs.dev/) for tooling.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `npm run build:staging`

Builds the app for deployment to the staging environment.<br />
It will request backend resources that are also in their respective staging environments.

### `npm run deploy-dev` &  `npm run deploy-prod` 

Builds the app for deployment and deploys it to dev/production environment.<br />

## Prod deployment
Use caution when deploying to production, as the application involves multiple stacks (animl-ingest, animl-api, animl-frontend), and often the deployments need to be synchronized. For major deployments to prod in which there are breaking changes that affect the other components of the stack, follow these steps:

1. Set the frontend `IN_MAINTENANCE_MODE` to `true` (in `animl-frontend/src/config.js`), deploy to prod, then invalidate its cloudfront cache. This will temporarily prevent users from interacting with the frontend (editing labels, bulk uploading images, etc.) while the rest of the updates are being deployed.

2. Set ingest-image's `IN_MAINTENANCE_MODE` to `true` (in `animl-ingest/ingest-image/task.js`) and deploy to prod. This will temporarily route any images from wireless cameras that happen to get send to the ingestion bucket to the `animl-images-parkinglot-prod` bucket so that Animl isn't trying to process new images while the updates are being deployed.

3. Backup prod DB by running `npm run export-db-prod` from the `animl-api` project root.

4. Deploy animl-api to prod. 

5. Turn off `IN_MAINTENANCE_MODE` in animl-frontend and animl-ingest, and deploy both to prod

6. Copy any image that happened to land in `animl-images-parkinglot-prod` while the stacks were being deployed to `animl-images-ingestion-prod`
