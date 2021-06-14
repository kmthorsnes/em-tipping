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
  calcLastScore(name);
}

console.log(scores);
// turn object to array of objects and sort
const scoresArray = [];
for (let name of Object.keys(scores)) {
  const result = {
    name,
    score: scores[name].totalScore,
    lastScore: scores[name].lastScore
  };
  scoresArray.push(result);
}
scoresArray.sort((a, b) => {
  if (a.score < b.score) return 1;
  else if (a.score > b.score) return -1;
  else return 0;
});

// Add ranking to scoresArray
let ranking = 1;
let counter = 0;
scoresArray.forEach((s, idx) => {
  if (idx !== 0 && s.score !== scoresArray[idx - 1].score) {
    ranking += counter;
    counter = 1;
  } else counter++;
  s.ranking = ranking;
});

// get next match stats
console.log('Getting next match stats...');
const nextMatchStats = getNextMatchStats();

// write file in json format
console.log('Writing to file scores.json ...');
const jsonData = JSON.stringify({
  scores: scoresArray,
  nextMatchStats,
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
  if (!scores[name]) {
    scores[name] = {
      totalScore: 0
    };
  }
}

function calcGroupStageMatches(name) {
  const matchPredictions = predictions[name].groupStageMatches;
  const matchResults = results.groupStageMatches;
  for (let j in matchPredictions) {
    if (matchPredictions[j].hub === matchResults[j].hub)
      scores[name].totalScore++;
    if (matchPredictions[j].result === matchResults[j].result)
      scores[name].totalScore += 2;
  }
}

function calcGroupStageStandings(name) {
  const standingPredictions = predictions[name].groupStageResults;
  const standingResults = results.groupStageResults;
  for (let j of Object.keys(standingPredictions)) {
    // for each group A,B,...,F
    const group = standingPredictions[j];
    for (let idx in group) {
      if (group[idx] === standingResults[j][idx]) scores[name].totalScore += 3;
    }
  }
}

function calcQuarterfinal(name) {
  const quarterPredictions = predictions[name].quarterfinal;
  const quarterResults = results.quarterfinal;
  for (let team of quarterPredictions) {
    if (quarterResults.includes(team)) scores[name].totalScore += 6;
  }
}

function calcSemifinal(name) {
  const semiPredictions = predictions[name].semifinal;
  const semiResults = results.semifinal;
  for (let team of semiPredictions) {
    if (semiResults.includes(team)) scores[name].totalScore += 8;
  }
}

function calcfinal(name) {
  const finalPredictions = predictions[name].final;
  const finalResults = results.final;
  for (let team of finalPredictions) {
    if (finalResults.includes(team)) scores[name].totalScore += 12;
  }
}

function calcChampion(name) {
  const champPrediction = predictions[name].champion;
  const champResult = results.champion;
  if (champPrediction === champResult) scores[name].totalScore += 15;
}

function calcTopScorers(name) {
  const topPredictions = predictions[name].topScorers;
  const topResults = results.topScorers;
  for (let team of topPredictions) {
    if (topResults.includes(team)) scores[name].totalScore += 15;
  }
}

function calcLastScore(name) {
  const gsm = predictions[name].groupStageMatches;
  const gsmResults = results.groupStageMatches;
  // get last match
  const lastMatchIdx = gsmResults.findIndex((x) => !x.result) - 1;
  const lastMatch = gsmResults[lastMatchIdx];
  if (gsm[lastMatchIdx].result === lastMatch.result) {
    scores[name].lastScore = 3;
  } else if (gsm[lastMatchIdx].hub === lastMatch.hub) {
    scores[name].lastScore = 1;
  } else {
    scores[name].lastScore = 0;
  }
}

function getNextMatchStats() {
  const statsObj = {};
  const stats = [];
  const gsmResults = results.groupStageMatches;
  // next match with empty result
  const nextMatchIdx = gsmResults.findIndex((x) => !x.result);
  const nextMatch = gsmResults[nextMatchIdx].match;
  const lastMatch = gsmResults[nextMatchIdx - 1].match;
  const lastMatchResult = gsmResults[nextMatchIdx - 1].result;

  // get predictions for next match
  for (let name of names) {
    const prediction = predictions[name].groupStageMatches.find(
      (x) => x.match === nextMatch
    ).result;
    if (statsObj[prediction]) statsObj[prediction]++;
    else statsObj[prediction] = 1;
  }

  // turn object to array of objects and sort
  for (let stat of Object.keys(statsObj)) {
    const result = { stat, freq: statsObj[stat] };
    stats.push(result);
  }
  stats.sort((a, b) => {
    if (a.freq < b.freq) return 1;
    else if (a.freq > b.freq) return -1;
    else return 0;
  });

  return {
    nextMatch,
    stats,
    lastMatch,
    lastMatchResult
  };
}
