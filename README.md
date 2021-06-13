# EM-tippekonkurranse

## Setup

`npm install`

## Updating scores

1. Update game scores, game results (H, U, B), etc. in `/data/results.json`
2. From the project root folder run: `npm run calculate`

## Importing Excel files

In case there are new Excel files, add them with the current naming convention: `EURO 2021 TIL UTFYLLING + " " + [player name].xlsx`

Then, from the project root folder run: `npm run convert`
