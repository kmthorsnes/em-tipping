const fs = require('fs');

// initial scores object
const scores = {};

// read prediction and result files
const results = JSON.parse(fs.readFileSync('data/results.json'));
const predictions = JSON.parse(fs.readFileSync('data/predictions.json'));

const names = Object.keys(predictions);

// calculate results for each player
console.log('Calculating scores...');

for (let name of names) {
  initializeScore(name);
  calcGroupStageMatches(name);
  calcGroupStageStandings(name);
  calcQuarterfinal(name);
  calcSemifinal(name);
  calcfinal(name);
  calcChampion(name);
  calcTopScorers(name);
}

// turn object to array of objects and sort
const scoresArray = [];
for (let name of Object.keys(scores)) {
  const result = { name, score: scores[name] };
  scoresArray.push(result);
}
scoresArray.sort((a, b) => {
  if (a.score < b.score) return 1;
  else if (a.score > b.score) return -1;
  else return 0;
});

// write file in json format
console.log('Writing to file scores.json ...');
const jsonData = JSON.stringify({
  scores: scoresArray,
  lastUpdate: new Date()
});
fs.writeFileSync('./data/scores.json', jsonData);

console.log(scoresArray);
console.log('Done!\n');

/**
 * HELPER FUNCTIONS
 */
// ///////////

function initializeScore(name) {
  if (!scores[name]) scores[name] = 0;
}

function calcGroupStageMatches(name) {
  const matchPredictions = predictions[name].groupStageMatches;
  const matchResults = results.groupStageMatches;
  for (let j in matchPredictions) {
    if (matchPredictions[j].hub === matchResults[j].hub) scores[name]++;
    if (matchPredictions[j].result === matchResults[j].result)
      scores[name] += 2;
  }
}

function calcGroupStageStandings(name) {
  const standingPredictions = predictions[name].groupStageResults;
  const standingResults = results.groupStageResults;
  for (let j of Object.keys(standingPredictions)) {
    // for each group A,B,...,F
    const group = standingPredictions[j];
    for (let idx in group) {
      if (group[idx] === standingResults[j][idx]) scores[name] += 3;
    }
  }
}

function calcQuarterfinal(name) {
  const quarterPredictions = predictions[name].quarterfinal;
  const quarterResults = results.quarterfinal;
  for (let team of quarterPredictions) {
    if (quarterResults.includes(team)) scores[name] += 6;
  }
}

function calcSemifinal(name) {
  const semiPredictions = predictions[name].semifinal;
  const semiResults = results.semifinal;
  for (let team of semiPredictions) {
    if (semiResults.includes(team)) scores[name] += 8;
  }
}

function calcfinal(name) {
  const finalPredictions = predictions[name].final;
  const finalResults = results.final;
  for (let team of finalPredictions) {
    if (finalResults.includes(team)) scores[name] += 12;
  }
}

function calcChampion(name) {
  const champPrediction = predictions[name].champion;
  const champResult = results.champion;
  if (champPrediction === champResult) scores[name] += 15;
}

function calcTopScorers(name) {
  const topPredictions = predictions[name].topScorers;
  const topResults = results.topScorers;
  for (let team of topPredictions) {
    if (topResults.includes(team)) scores[name] += 15;
  }
}
