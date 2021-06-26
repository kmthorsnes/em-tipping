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
  // calcLastScore(name);
  calcLastScoreQuarter(name);
}

console.log(scores);
// turn object to array of objects and sort
const scoresArray = [];
for (let name of Object.keys(scores)) {
  const result = {
    name,
    score: scores[name].totalScore,
    lastScore: scores[name].lastScore,
    groupStage: scores[name].groupStage,
    gsStandings: scores[name].gsStandings,
    quarter: scores[name].quarter,
    semi: scores[name].semi,
    final: scores[name].final,
    champion: scores[name].champion,
    topScorers: scores[name].topScorers
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
// console.log('Getting next match stats...');
// const nextMatchStats = getNextMatchStats();
const nextMatchStats = getNextQuarterMatchStats();

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
  scores[name].groupStage = scores[name].totalScore;
}

function calcGroupStageStandings(name) {
  const standingPredictions = predictions[name].groupStageResults;
  const standingResults = results.groupStageResults;
  scores[name].gsStandings = 0;
  for (let j of Object.keys(standingPredictions)) {
    // for each group A,B,...,F
    const group = standingPredictions[j];
    for (let idx in group) {
      if (group[idx] === standingResults[j][idx]) {
        scores[name].totalScore += 3;
        scores[name].gsStandings += 3;
      }
    }
  }
}

function calcQuarterfinal(name) {
  const quarterPredictions = predictions[name].quarterfinal;
  const quarterResults = results.quarterfinal;
  scores[name].quarter = 0;
  for (let team of quarterPredictions) {
    if (quarterResults.includes(team)) {
      scores[name].totalScore += 6;
      scores[name].quarter += 6;
    }
  }
}

function calcSemifinal(name) {
  const semiPredictions = predictions[name].semifinal;
  const semiResults = results.semifinal;
  scores[name].semi = 0;
  for (let team of semiPredictions) {
    if (semiResults.includes(team)) {
      scores[name].totalScore += 8;
      scores[name].semi += 8;
    }
  }
}

function calcfinal(name) {
  const finalPredictions = predictions[name].final;
  const finalResults = results.final;
  scores[name].final = 0;
  for (let team of finalPredictions) {
    if (finalResults.includes(team)) {
      scores[name].totalScore += 12;
      scores[name].semi += 12;
    }
  }
}

function calcChampion(name) {
  const champPrediction = predictions[name].champion;
  const champResult = results.champion;
  scores[name].champion = 0;
  if (champPrediction === champResult) {
    scores[name].totalScore += 15;
    scores[name].champion += 15;
  }
}

function calcTopScorers(name) {
  const topPredictions = predictions[name].topScorers;
  const topResults = results.topScorers;
  scores[name].topScorers = 0;
  for (let team of topPredictions) {
    if (topResults.includes(team)) {
      scores[name].totalScore += 15;
      scores[name].topScorers += 15;
    }
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

function calcLastScoreQuarter(name) {
  scores[name].lastScore = 0;
  const { quarterfinal } = results;
  const currentMatchIdx = quarterfinal.findIndex((x) => !x);
  let lastMatchIdx;
  if (currentMatchIdx === 0) return;

  lastMatchIdx =
    currentMatchIdx === -1 ? quarterfinal.length - 1 : currentMatchIdx - 1;
  const lastMatchWinner = quarterfinal[lastMatchIdx];
  const predictedWinners = predictions[name].quarterfinal;
  if (predictedWinners.includes(lastMatchWinner)) scores[name].lastScore = 6;
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

function getNextQuarterMatchStats() {
  const { quarterfinal, quarterfinalMatches } = results;
  let nextMatchIdx = quarterfinal.findIndex((x) => !x);
  if (nextMatchIdx === -1) nextMatchIdx = quarterfinal.length - 1;
  const nextMatch = quarterfinalMatches[nextMatchIdx];
  nextMatch.hWin = 0;
  nextMatch.bWin = 0;
  const lastMatch = quarterfinalMatches[nextMatchIdx - 1];
  const lastMatchWinner = quarterfinal[nextMatchIdx - 1];

  // get predictions for next match
  for (let name of names) {
    const qPredictions = predictions[name].quarterfinal;
    if (qPredictions.includes(nextMatch.h)) nextMatch.hWin++;
    if (qPredictions.includes(nextMatch.b)) nextMatch.bWin++;
  }

  return {
    nextMatch,
    lastMatch,
    lastMatchWinner
  };
}
