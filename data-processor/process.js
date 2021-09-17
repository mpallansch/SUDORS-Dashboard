const fs = require('fs');
const csv = require('csv-parse');

const stateAgePops = require('./census/state-age-pops.json');
const stateAgeSexPops = require('./census/state-age-sex-pops.json');
const stateAgeRacePops = require('./census/state-age-race-pops.json');
const weights = require('./census/weights.json');

const fips = {"1": "Alabama","2":"Alaska","4":"Arizona","5":"Arkansas","6":"California","8":"Colorado","9":"Connecticut","10":"Delaware", "11": "District of Columbia", "12": "Florida", "13": "Georgia", "15": "Hawaii", "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas", "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada", "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York", "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington", "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming"};
const reverseFips = {"Alabama":"1","Alaska":"2","Arizona":"4","Arkansas":"5","California":"6","Colorado":"8","Connecticut":"9","Delaware":"10","District of Columbia":"11","Florida":"12","Georgia":"13","Hawaii":"15","Idaho":"16","Illinois":"17","Indiana":"18","Iowa":"19","Kansas":"20","Kentucky":"21","Louisiana":"22","Maine":"23","Maryland":"24","Massachusetts":"25","Michigan":"26","Minnesota":"27","Mississippi":"28","Missouri":"29","Montana":"30","Nebraska":"31","Nevada":"32","New Hampshire":"33","New Jersey":"34","New Mexico":"35","New York":"36","North Carolina":"37","North Dakota":"38","Ohio":"39","Oklahoma":"40","Oregon":"41","Pennsylvania":"42","Rhode Island":"44","South Carolina":"45","South Dakota":"46","Tennessee":"47","Texas":"48","Utah":"49","Vermont":"50","Virginia":"51","Washington":"53","West Virginia":"54","Wisconsin":"55","Wyoming":"56"};

const inputFilePath = './SUDORS 2020 Prelim Data for Dashboard_09SEP2021.csv';
const typeOfDrugFilePath = '../src/data/causes.json';
const additionalDrugFilePath = '../src/data/additional-drugs.json';
const circumstancesFilePath = '../src/data/circumstances.json';
const mapFilePath = '../src/data/map.json';
const sexFilePath = '../src/data/sex.json';
const ageFilePath = '../src/data/age.json';
const raceFilePath = '../src/data/race.json';
const stateFilePath = '../src/data/state.json';
const interventionFilePath = '../src/data/interventions.json';
const totalsFilePath = '../src/data/totals.json';
const timeFilePath = '../src/data/time.json';
const ageAdjustedRatesFilePath = '../src/data/age-adjusted-rates.json';
const ageAdjustedSexRatesFilePath = '../src/data/age-adjusted-sex-rates.json';
const ageAdjustedRaceRatesFilePath = '../src/data/age-adjusted-race-rates.json';

const stateKey = 'Site_ID';
const keys = [
  'Incident_Year',
  'Age',
  'Homeless',
  'Sex',
  'bystander',
  'NaloxoneAdministered',
  'meth_r_cod',
  'opioid_r_cod',
  'alcohol_r',
  'meth_r',  
  'opioid_r_pos',
  'MentalHealthProblem_c',
  'SubstanceAbuseOther_c',
  'age_cat',
  'race_eth_v2',
  'deathmonth_order',
  'imfs_pos',
  'imfs_cod',
  'cocaine_t',
  'cocaine_t_cod',
  'heroin_def_v2',
  'heroin_def_cod_v2',
  'rx_opioid_v2',
  'rx_opioid_cod_v2',
  'pain_treat',
  'recentinst',
  'evertrt',
  'priorod',
  'recentrelapse',
  'witnesseddruguse'
];
const drugTypeMapping = {
  'meth_r_cod': 'meth_r',
  'rx_opioid_cod_v2': 'rx_opioid_v2',
  'imfs_cod': 'imfs_pos',
  'heroin_def_cod_v2': 'heroin_def_v2',
  'cocaine_t_cod': 'cocaine_t'
};
const drugLabelMapping = {
  'meth_r_cod': 'Meth',
  'meth_r': 'Meth',
  'rx_opioid_cod_v2': 'Rx Opioids',
  'rx_opioid_v2': 'Rx Opioids',
  'imfs_cod': 'IMFs',
  'imfs_pos': 'IMFs',
  'heroin_def_cod_v2': 'Heroin',
  'heroin_def_v2': 'Heroin',
  'cocaine_t_cod': 'Cocaine',
  'cocaine_t': 'Cocaine'
};
const raceMapping = {
  '0': 'White, non-Hispanic',
  '1': 'Black, non-Hispanic',
  '2': 'AI/AN, non-Hispanic',
  '3': 'A/PI, non-Hispanic',
  '4': 'Other, non-Hispanic',
  '5': 'Hispanic'
};
const us = 'United States';
const ageTallyInitial = {
  '1': 0,
  '2': 0,
  '3': 0,
  '4': 0,
  '5': 0,
  '6': 0
}
const ageDataInitial = {'male': {...ageTallyInitial}, 'female':{...ageTallyInitial}};
const raceDataInitial = {'0': {...ageTallyInitial}, '1': {...ageTallyInitial}, '2': {...ageTallyInitial}, '3': {...ageTallyInitial}, '4': {...ageTallyInitial}, '5': {...ageTallyInitial}};

let stateKeyIndex;
let first = true;
let keyIndex = {};
let keyCounts = {};
let additionalDrugs = {};
let totalDeaths = {};
let allOpioidCause = {};
let allOpioidPresent = {};
let interventions = {};
let ageData = {};
let raceAgeData = {};

function percent(deaths, total, wholeNumber) {
  if(wholeNumber){
    return Math.round(deaths / total * 100);
  }
  return Math.round(deaths / total * 10000) / 100;
}

function increment(obj, state) {
  if(obj[state]) {
    obj[state]++;
  } else {
    obj[state] = 1;
  }

  if(obj[us]) {
    obj[us]++;
  } else {
    obj[us] = 1;
  }
}

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    if(first){
      stateKeyIndex = row.indexOf(stateKey);

      if(stateKeyIndex === -1){
        throw 'Cannot find state key';
      }

      keys.forEach(key => {
        let index = row.indexOf(key);
        if(index !== -1){
          keyIndex[key] = index;
        } else {
          throw ('Cannot find key ' + key);
        }
      });

      first = false;
    } else {
      const state = fips[row[stateKeyIndex]];

      increment(totalDeaths, state);

      if(row[keyIndex['imfs_pos']] === '1' ||
          row[keyIndex['heroin_def_v2']] === '1' ||
          row[keyIndex['rx_opioid_v2']] === '1'){
        increment(allOpioidPresent, state);
      }

      if(row[keyIndex['imfs_cod']] === '1' ||
          row[keyIndex['heroin_def_cod_v2']] === '1' ||
          row[keyIndex['rx_opioid_cod_v2']] === '1'){
        increment(allOpioidCause, state);
      }

      if(row[keyIndex['recentinst']] === '1' ||
          row[keyIndex['priorod']] === '1' ||
          row[keyIndex['MentalHealthProblem_c']] === '1' ||
          row[keyIndex['evertrt']] === '1' ||
          row[keyIndex['bystander']] === '1' ||
          row[keyIndex['witnesseddruguse']] === '1'){
        increment(interventions, state);
      }

      Object.keys(drugTypeMapping).forEach(cause => {
        if(row[keyIndex[cause]] === '1'){
          if(!additionalDrugs[state]) additionalDrugs[state] = {};
          if(!additionalDrugs[state][cause]) additionalDrugs[state][cause] = {};
          if(!additionalDrugs[us]) additionalDrugs[us] = {};
          if(!additionalDrugs[us][cause]) additionalDrugs[us][cause] = {};

          Object.keys(drugTypeMapping).forEach(causeForAdditional => {
            if(causeForAdditional !== cause && row[keyIndex[drugTypeMapping[causeForAdditional]]] === '1'){
              if(!additionalDrugs[state][cause][drugTypeMapping[causeForAdditional]]) {
                 additionalDrugs[state][cause][drugTypeMapping[causeForAdditional]] = 1;
              } else {
                additionalDrugs[state][cause][drugTypeMapping[causeForAdditional]]++;
              }


              if(!additionalDrugs[us]) additionalDrugs[us] = {};
              if(!additionalDrugs[us][cause]) additionalDrugs[us][cause] = {};
              if(!additionalDrugs[us][cause][drugTypeMapping[causeForAdditional]]) {
                 additionalDrugs[us][cause][drugTypeMapping[causeForAdditional]] = 1;
              } else {
                additionalDrugs[us][cause][drugTypeMapping[causeForAdditional]]++;
              }
            }
          });
          additionalDrugs[state][cause]['total'] = additionalDrugs[state][cause]['total'] === undefined ? 1 : (additionalDrugs[state][cause]['total'] + 1);
          additionalDrugs[us][cause]['total'] = additionalDrugs[us][cause]['total'] === undefined ? 1 : (additionalDrugs[us][cause]['total'] + 1);
        }
      });

      ageData[state] = ageData[state] || ageDataInitial;
      ageData[us] = ageData[us] || ageDataInitial;
      raceAgeData[state] = raceAgeData[state] || raceDataInitial;
      raceAgeData[us] = raceAgeData[us] || raceDataInitial;
      let age = row[keyIndex['age_cat']];
      let sex = row[keyIndex['Sex']] === '1' ? 'male' : 'female';
      let race = row[keyIndex['race_eth_v2']];
      if(ageData[state][sex][age] !== undefined){
        ageData[state][sex][age]++;
        ageData[us][sex][age]++;
      }
      if(race.length > 0 && raceAgeData[state][race][age] !== undefined){
        raceAgeData[state][race][age]++;
        raceAgeData[us][race][age]++;
      }

      keys.forEach(key => {
        if(!keyCounts[state]) keyCounts[state] = {};
        if(!keyCounts[state][key]) keyCounts[state][key] = {};
        if(keyCounts[state][key][row[keyIndex[key]]]){
          keyCounts[state][key][row[keyIndex[key]]]++;
        } else {
          keyCounts[state][key][row[keyIndex[key]]] = 1;
        }


        if(!keyCounts[us]) keyCounts[us] = {};
        if(!keyCounts[us][key]) keyCounts[us][key] = {};
        if(keyCounts[us][key][row[keyIndex[key]]]){
          keyCounts[us][key][row[keyIndex[key]]]++;
        } else {
          keyCounts[us][key][row[keyIndex[key]]] = 1;
        }
      });
      
    }
  })
  .on('end', () => {
    let statesFinal = Object.keys(keyCounts);
    statesFinal.push(us);

    let typeOfDrugData = {};

    statesFinal.forEach(state => {
      typeOfDrugData[state] = [
        {
          opioid: 'Any Opioids', 
          present: percent(allOpioidPresent[state], totalDeaths[state]), 
          cause: percent(allOpioidCause[state], totalDeaths[state])
        },
        {
          opioid: 'IMFs', 
          present: percent(keyCounts[state]['imfs_pos']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['imfs_cod']['1'], totalDeaths[state])
        },
        {
          opioid: 'Cocaine', 
          present: percent(keyCounts[state]['cocaine_t']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['cocaine_t_cod']['1'], totalDeaths[state])
        },
        {
          opioid: 'Heroin', 
          present: percent(keyCounts[state]['heroin_def_v2']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['heroin_def_cod_v2']['1'], totalDeaths[state])
        },
        {
          opioid: 'Rx Opioids',
          present: percent(keyCounts[state]['rx_opioid_v2']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['rx_opioid_cod_v2']['1'], totalDeaths[state])
        },
        {
          opioid: 'Meth', 
          present: percent(keyCounts[state]['meth_r']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['meth_r_cod']['1'], totalDeaths[state])
        }
      ];
    });

    fs.writeFile(typeOfDrugFilePath, JSON.stringify(typeOfDrugData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let additionalDrugData = {};
    statesFinal.forEach(state => {
      additionalDrugData[state] = [];
      Object.keys(additionalDrugs[state]).forEach(cause => {
        let total = additionalDrugs[state][cause]['total'];
        let row = {cause: drugLabelMapping[cause]};
        Object.keys(additionalDrugs[state][cause]).forEach(additional => row[drugLabelMapping[additional]] = percent(additionalDrugs[state][cause][additional], total));
        additionalDrugData[state].push(row);
      });
    });

    fs.writeFile(additionalDrugFilePath, JSON.stringify(additionalDrugData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let circumstancesData = {};
    statesFinal.forEach(state => {
      circumstancesData[state] = {
        other: [
          { 
            circumstance: 'Current or past substance abuse/misuse', 
            value: percent(keyCounts[state]['SubstanceAbuseOther_c']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Bystander present', 
            value: percent(keyCounts[state]['bystander']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Mental health diagnosis', 
            value: percent(keyCounts[state]['MentalHealthProblem_c']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Naloxone Administered', 
            value: percent(keyCounts[state]['NaloxoneAdministered']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Ever treated for substance abuse disorder', 
            value: percent(keyCounts[state]['evertrt']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Recent release from institution', 
            value: percent(keyCounts[state]['recentinst']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Current pain treatment', 
            value: percent(keyCounts[state]['pain_treat']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Fatal drug use witnessed', 
            value: percent(keyCounts[state]['witnesseddruguse']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Prior overdose', 
            value: percent( keyCounts[state]['priorod']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Recent opioid use relapse', 
            value: percent(keyCounts[state]['recentrelapse']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Homeless', 
            value: percent(keyCounts[state]['Homeless']['1'], totalDeaths[state]) }
        ]
      };
    });

    fs.writeFile(circumstancesFilePath, JSON.stringify(circumstancesData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let mapData = {'all': {}};
    let allDrugTotal = {};
    let allDrugMax = Number.MIN_VALUE;
    let allDrugMin = Number.MAX_VALUE;
    Object.keys(drugTypeMapping).forEach(drug => {
      mapData[drugLabelMapping[drug]] = {}

      let mapMax = Number.MIN_VALUE;
      let mapMin = Number.MAX_VALUE;
      statesFinal.forEach(state => {
        mapData[drugLabelMapping[drug]][state] = {deaths: keyCounts[state][drug]['1']};
        allDrugTotal[state] = allDrugTotal[state] || {deaths: 0};
        allDrugTotal[state].deaths += keyCounts[state][drug]['1'];

        if(state !== us && keyCounts[state][drug]['1'] > mapMax){
          mapMax = keyCounts[state][drug]['1'];
        }
        if(state !== us && keyCounts[state][drug]['1'] < mapMin){
          mapMin = keyCounts[state][drug]['1'];
        }
      });    
      mapData[drugLabelMapping[drug]].max = mapMax;
      mapData[drugLabelMapping[drug]].min = mapMin;
    }); 

    statesFinal.forEach(state => {
      if(state !== us && allDrugTotal[state].deaths > allDrugMax){
        allDrugMax = allDrugTotal[state].deaths;
      }
      if(state !== us && allDrugTotal[state].deaths < allDrugMin){
        allDrugMin = allDrugTotal[state].deaths;
      }
    });
    
    mapData['All'] = allDrugTotal;
    mapData['All'].max = allDrugMax;
    mapData['All'].min = allDrugMin;

    fs.writeFile(mapFilePath, JSON.stringify(mapData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let sexData = {};
    statesFinal.forEach(state => {
      sexData[state] = [
        {sex: 'Male', value: percent(keyCounts[state]['Sex']['1'], totalDeaths[state], true)},
        {sex: 'Female', value: percent(keyCounts[state]['Sex']['2'], totalDeaths[state], true)}
      ];
    });

    fs.writeFile(sexFilePath, JSON.stringify(sexData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
    
    let ageDataFinal = {};
    statesFinal.forEach(state => {
      let ageTotal = 0;
      Object.keys(ageData[state]['male']).forEach(ageGroup => ageTotal += ageData[state]['male'][ageGroup]);
      Object.keys(ageData[state]['female']).forEach(ageGroup => ageTotal += ageData[state]['female'][ageGroup]);

      ageDataFinal[state] = {
        'male': Object.keys(ageData[state]['male']).map(ageGroup => ({age: ageGroup, value: percent(ageData[state]['male'][ageGroup], ageTotal, true)})),
        'female': Object.keys(ageData[state]['female']).map(ageGroup => ({age: ageGroup, value: percent(ageData[state]['female'][ageGroup], ageTotal, true)}))
      };
    });

    fs.writeFile(ageFilePath, JSON.stringify(ageDataFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
    
    let raceData = {};
    statesFinal.forEach(state => {
      raceData[state] = [];
      Object.keys(keyCounts[state]['race_eth_v2']).forEach(raceNum => {
        if(raceMapping[raceNum]){
          raceData[state].push({race: raceMapping[raceNum], value: percent(keyCounts[state]['race_eth_v2'][raceNum], totalDeaths[state])});
        }
      });
    });

    fs.writeFile(raceFilePath, JSON.stringify(raceData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let stateData = [];
    statesFinal.forEach(state => {
      if(state !== us){
        stateData.push({state: state, value: totalDeaths[state]});
      }
    });

    fs.writeFile(stateFilePath, JSON.stringify(stateData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let interventionsDataFinal = {};
    statesFinal.forEach(state => {
      interventionsDataFinal[state] = percent(interventions[state], totalDeaths[state], true)
    });

    fs.writeFile(interventionFilePath, JSON.stringify(interventionsDataFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let timeData = {};
    statesFinal.forEach(state => {
      timeData[state] = [];
      Object.keys(keyCounts[state]['deathmonth_order']).forEach(month => {
        timeData[state].push({month, value: keyCounts[state]['deathmonth_order'][month]})
      });
    });

    fs.writeFile(timeFilePath, JSON.stringify(timeData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let ageAdjustedRates = [];
    statesFinal.forEach(state => {
      if(state === us) return;

      let rate = 0;

      Object.keys(weights).forEach(ageGroup => {
        if(stateAgePops[reverseFips[state]]){
          rate += (keyCounts[state]['age_cat'][ageGroup] || 0) / stateAgePops[reverseFips[state]][ageGroup] * weights[ageGroup];
        }
      });

      ageAdjustedRates.push({state, rate});
    });

    fs.writeFile(ageAdjustedRatesFilePath, JSON.stringify(ageAdjustedRates), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let ageAdjustedSexRates = {};
    statesFinal.forEach(state => {
      if(state === us) return;

      let rateMale = 0;
      let rateFemale = 0;

      Object.keys(weights).forEach(ageGroup => {
        if(stateAgeSexPops[reverseFips[state]]){
          rateMale += (ageData[state]['male'][ageGroup] || 0) / stateAgeSexPops[reverseFips[state]]['1'][ageGroup] * weights[ageGroup];
          rateFemale += (ageData[state]['female'][ageGroup] || 0) / stateAgeSexPops[reverseFips[state]]['2'][ageGroup] * weights[ageGroup];
        }
      });

      ageAdjustedSexRates[state] = [];
      ageAdjustedSexRates[state].push({sex: 'male', rate: rateMale});
      ageAdjustedSexRates[state].push({sex: 'female', rate: rateFemale});
    });

    fs.writeFile(ageAdjustedSexRatesFilePath, JSON.stringify(ageAdjustedSexRates), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let ageAdjustedRaceRates = {};
    statesFinal.forEach(state => {
      if(state === us) return;

      ageAdjustedRaceRates[state] = [];

      Object.keys(keyCounts[state]['race_eth_v2']).forEach(race => {
        if(race.length === 0) return;

        let rate = 0;

        Object.keys(weights).forEach(ageGroup => {
          if(stateAgePops[reverseFips[state]]){
            rate += (raceAgeData[state][race][ageGroup] || 0) / stateAgeRacePops[reverseFips[state]][race][ageGroup] * weights[ageGroup];
          }
        });

        ageAdjustedRaceRates[state].push({race: raceMapping[race], rate});
      });
    });

    fs.writeFile(ageAdjustedRaceRatesFilePath, JSON.stringify(ageAdjustedRaceRates), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    fs.writeFile(totalsFilePath, JSON.stringify(totalDeaths), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
  });