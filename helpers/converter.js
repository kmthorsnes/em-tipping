const fs = require('fs');
const XLSX = require('xlsx');

const DIR = './data/predictions';
const filePrefix = 'EURO 2021 TIL UTFYLLING';
const sheetName = 'Utfylles';

const predictionData = {};

let names = [
  'Anders',
  'Bahador',
  'Caroline',
  'Christina',
  'Elin',
  'Francois',
  'Joakim',
  'Kalle',
  'Karoline',
  'Kristian',
  'Louise',
  'Stian',
  'Tormod',
  'Lars'
];

const translation = {
  Tyrkia: 'Turkey',
  Italia: 'Italy',
  Wales: 'Wales',
  Sveits: 'Switzerland',
  Danmark: 'Denmark',
  Finland: 'Finland',
  Belgia: 'Belgium',
  Russland: 'Russia',
  England: 'England',
  Kroatia: 'Croatia',
  Østerrike: 'Austria',
  'Nord-Makedonia': 'North Macedonia',
  Nederland: 'Netherlands',
  Ukraina: 'Ukraine',
  Skottland: 'Scotland',
  Tsjekkia: 'Czechia',
  Polen: 'Poland',
  Slovakia: 'Slovakia',
  Spania: 'Spain',
  Sverige: 'Sweden',
  Ungarn: 'Hungary',
  Portugal: 'Portugal',
  Frankrike: 'France',
  Tyskland: 'Germany',
  H: 'Home',
  B: 'Away',
  U: 'Draw'
};

function predict(name) {
  // read file into memory
  const workbook = XLSX.readFile(`${DIR}/${filePrefix} ${name}.xlsx`);
  // const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  const sheet = workbook.Sheets[sheetName];

  const prediction = {
    groupStageMatches: [],
    groupStageResults: {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: []
    },
    quarterfinal: [],
    semifinal: [],
    final: [],
    champion: '',
    topScorers: []
  };

  // GROUP STAGE MATCHES
  // read range E10 - K45
  const range1 = XLSX.utils.decode_range('E10:K45');
  /* Iterate through each row and add results */
  for (let R = range1.s.r; R <= range1.e.r; R++) {
    for (let C = range1.s.c; C <= range1.e.c; C += 7) {
      const home = getCellValue({ c: C, r: R });
      const away = getCellValue({ c: C + 2, r: R });
      const homeScore = getCellValue({ c: C + 3, r: R });
      const awayScore = getCellValue({ c: C + 5, r: R });
      const hub = getCellValue({ c: C + 6, r: R });
      prediction.groupStageMatches.push({
        match: `${home} - ${away}`,
        result: `${homeScore} - ${awayScore}`,
        hub
      });
    }
  }

  // GROUP STAGE RESULTS
  // read range AC10:AC39
  const range2 = XLSX.utils.decode_range('AC10:AC39');
  for (let R = range2.s.r; R <= range2.e.r; R++) {
    const C = range2.s.c;
    const idx = R - range2.s.r;
    let group;
    if (idx < 5) group = 'A';
    else if (idx < 10) group = 'B';
    else if (idx < 15) group = 'C';
    else if (idx < 20) group = 'D';
    else if (idx < 25) group = 'E';
    else group = 'F';

    if (idx % 5 !== 0) {
      const team = getCellValue({ c: C, r: R });
      prediction.groupStageResults[group].push(team);
    }
  }

  // Quarterfinal AO10:AO17
  const range3 = XLSX.utils.decode_range('AO10:AO17');
  for (let R = range3.s.r; R <= range3.e.r; R++) {
    const C = range3.s.c;
    const team = getCellValue({ c: C, r: R });
    prediction.quarterfinal.push(team);
  }

  // semifinal AQ10:AQ13
  const range4 = XLSX.utils.decode_range('AQ10:AQ13');
  for (let R = range4.s.r; R <= range4.e.r; R++) {
    const C = range4.s.c;
    const team = getCellValue({ c: C, r: R });
    prediction.semifinal.push(team);
  }

  // final AS10:AS11
  const range5 = XLSX.utils.decode_range('AS10:AS11');
  for (let R = range5.s.r; R <= range5.e.r; R++) {
    const C = range5.s.c;
    const team = getCellValue({ c: C, r: R });
    prediction.final.push(team);
  }

  // Champion AU10
  const cell6 = XLSX.utils.decode_cell('AU10');
  prediction.champion = getCellValue(cell6);

  // Top scorer AW10:AW11
  const range7 = XLSX.utils.decode_range('AW10:AW11');
  for (let R = range7.s.r; R <= range7.e.r; R++) {
    const C = range7.s.c;
    const player = getCellValue({ c: C, r: R });
    prediction.topScorers.push(player);
  }
  return prediction;

  // HELPER FUNCTIONS
  function getCellValue(address) {
    return sheet[XLSX.utils.encode_cell(address)].v;
  }

  function translate(word) {
    return translation[word];
  }

  function getTranslatedValue(address) {
    return translate(getCellValue(address));
  }
}

for (let name of names) {
  console.log(`Importing ${name}.xlsx ...`);
  predictionData[name] = predict(name);
}

console.log('\n\nImported Excel files into memory.');

// write file in json format
const jsonData = JSON.stringify(predictionData);
fs.writeFileSync('./data/predictions.json', jsonData);

console.log('Wrote to file predictions.json\nDone!\n');
