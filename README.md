
# EM-tippekonkurranse

## Setup

`npm install`

## Updating scores

1. Update game scores, game results (H, U, B), etc. in `/data/results.json`
2. From the project root folder run: `npm run calculate`

## Importing Excel files

In case there are new Excel files, add them with the current naming convention: `EURO 2021 TIL UTFYLLING + " " + [player name].xlsx`

Also add `[player name]` to the `names` array in `/helpers/converter.js`

Then, from the project root folder run: `npm run convert`

## Live version
When `main` branch is updated and pushed live version is available at [
[omega-em-konkurranse.netlify.app](https://omega-em-konkurranse.netlify.app/) - hosted by Netlify. 

[![Netlify Status](https://api.netlify.com/api/v1/badges/4d8117ff-f7b8-445f-8295-03f532639572/deploy-status)](https://app.netlify.com/sites/omega-em-konkurranse/deploys)

<a href="https://gitmoji.dev">
  <img src="https://img.shields.io/badge/gitmoji-%20😜%20😍-FFDD67.svg?style=flat-square" alt="Gitmoji">
</a>

