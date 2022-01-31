const fs = require('fs');
const csv = require('csv-parse');

const stateAgePops = require('./census/state-age-pops.json');
const stateAgeSexPops = require('./census/state-age-sex-pops.json');
const stateAgeRacePops = require('./census/state-age-race-pops.json');
const weights = require('./census/weights.json');

const fips = {"0":"Overall", "1": "Alabama","2":"Alaska","4":"Arizona","5":"Arkansas","6":"California","8":"Colorado","9":"Connecticut","10":"Delaware", "11": "DC", "12": "Florida", "13": "Georgia", "15": "Hawaii", "16": "Idaho", "17": "Illinois", "18": "Indiana", "19": "Iowa", "20": "Kansas", "21": "Kentucky", "22": "Louisiana", "23": "Maine", "24": "Maryland", "25": "Massachusetts", "26": "Michigan", "27": "Minnesota", "28": "Mississippi", "29": "Missouri", "30": "Montana", "31": "Nebraska", "32": "Nevada", "33": "New Hampshire", "34": "New Jersey", "35": "New Mexico", "36": "New York", "37": "North Carolina", "38": "North Dakota", "39": "Ohio", "40": "Oklahoma", "41": "Oregon", "42": "Pennsylvania", "44": "Rhode Island", "45": "South Carolina", "46": "South Dakota", "47": "Tennessee", "48": "Texas", "49": "Utah", "50": "Vermont", "51": "Virginia", "53": "Washington", "54": "West Virginia", "55": "Wisconsin", "56": "Wyoming"};
const reverseFips = {"Overall":"0","Alabama":"1","Alaska":"2","Arizona":"4","Arkansas":"5","California":"6","Colorado":"8","Connecticut":"9","Delaware":"10","DC":"11","Florida":"12","Georgia":"13","Hawaii":"15","Idaho":"16","Illinois":"17","Indiana":"18","Iowa":"19","Kansas":"20","Kentucky":"21","Louisiana":"22","Maine":"23","Maryland":"24","Massachusetts":"25","Michigan":"26","Minnesota":"27","Mississippi":"28","Missouri":"29","Montana":"30","Nebraska":"31","Nevada":"32","New Hampshire":"33","New Jersey":"34","New Mexico":"35","New York":"36","North Carolina":"37","North Dakota":"38","Ohio":"39","Oklahoma":"40","Oregon":"41","Pennsylvania":"42","Rhode Island":"44","South Carolina":"45","South Dakota":"46","Tennessee":"47","Texas":"48","Utah":"49","Vermont":"50","Virginia":"51","Washington":"53","West Virginia":"54","Wisconsin":"55","Wyoming":"56"};

const inputFilePath = './SUDORS 2020 Prelim Data for Dashboard_21JAN2022.csv';
const typeOfDrugFilePath = '../src/data/causes.json';
const additionalDrugFilePath = '../src/data/additional-drugs.json';
const circumstancesFilePath = '../src/data/circumstances.json';
const mapFilePath = '../src/data/map.json';
const sexFilePath = '../src/data/sex.json';
const ageFilePath = '../src/data/age.json';
const ageBySexFilePath = '../src/data/age-by-sex.json';
const raceFilePath = '../src/data/race.json';
const stateFilePath = '../src/data/state.json';
const interventionFilePath = '../src/data/interventions.json';
const totalsFilePath = '../src/data/totals.json';
const timeFilePath = '../src/data/time.json';
const opioidStimulantFilePath = '../src/data/opioid-stimulant.json';
const drugCombinationFilePath = '../src/data/drug-combination.json';
const ageAdjustedRatesFilePath = '../src/data/age-adjusted-rates.json';
const ageAdjustedSexRatesFilePath = '../src/data/age-adjusted-sex-rates.json';
const ageAdjustedRaceRatesFilePath = '../src/data/age-adjusted-race-rates.json';
const ageAdjustedDrugRatesFilePath = '../src/data/age-adjusted-drug-rates.json';

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
  'witnesseddruguse',
  'home_dec',
  'opioid_r_cod',
  'opioid_r_pos',
  'stimulant_cod',
  'stimulant_pos'
];
const drugTypeMapping = {
  'meth_r_cod': 'meth_r',
  'rx_opioid_cod_v2': 'rx_opioid_v2',
  'imfs_cod': 'imfs_pos',
  'heroin_def_cod_v2': 'heroin_def_v2',
  'cocaine_t_cod': 'cocaine_t'
};
const drugLabelMapping = {
  'meth_r_cod': 'Methamphetamine',
  'meth_r': 'Methamphetamine',
  'rx_opioid_cod_v2': 'Prescription opioids',
  'rx_opioid_v2': 'Prescription opioids',
  'imfs_cod': 'Illicitly manufactured fentanyls',
  'imfs_pos': 'Illicitly manufactured fentanyls',
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
const us = 'Overall';
const ageDataInitial = () => (
  {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}
);
const ageDataBySexInitial = () => ({
  'male': {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'female': {'0': 0, '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}
});
const raceDataInitial = () => ({
  '0': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  '1': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  '2': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  '3': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  '4': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  '5': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}
});
const drugDataInitial = () => ({
  'All': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'Methamphetamine': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'Prescription opioids': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'Illicitly manufactured fentanyls': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'Heroin': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}, 
  'Cocaine': {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0}
});

const countCutoff = 10;
const rateCutoff = 20;

let stateKeyIndex;
let first = true;
let keyIndex = {};
let keyCounts = {};
let additionalDrugs = {};
let totalDeaths = {};
let allOpioidCause = {};
let allOpioidPresent = {};
let opioidByAge = {};
let allStimulantCause = {};
let allStimulantPresent = {};
let stimulantByAge = {};
let interventions = {};
let ageData = {};
let ageDataBySex = {};
let raceAgeData = {};
let drugAgeData = {};
let opioidStimulantData = {};
let drugCombinationData = {};

function percent(deaths, total) {
  if(deaths === undefined) return 0;
  return Math.round(deaths / total * 1000) / 10;
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

function checkCutoff(value, rate) {
  if(rate !== undefined){
    if(value <= rateCutoff) return -1;
    return rate;
  }
  if(!value || value < countCutoff) return -1;
  return value;
}

function nestedAdd(a, b) {
  let newObj = {};
  
  Object.keys(a).forEach(key => {
    if(typeof a[key] === 'number') {
      newObj[key] = a[key] + b[key];
    } else {
      newObj[key] = nestedAdd(a[key], b[key]);
    }
  });

  return newObj;
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
      const age = row[keyIndex['age_cat']];

      let opioid, stimulant = false;

      increment(totalDeaths, state);

      opioidByAge[state] = opioidByAge[state] || ageDataInitial();
      opioidByAge[us] = opioidByAge[us] || ageDataInitial();

      if(row[keyIndex['opioid_r_cod']] === '1'){
        opioid = true;
        opioidByAge[state][age]++;
        opioidByAge[us][age]++;
        increment(allOpioidCause, state);
      }

      if(row[keyIndex['opioid_r_pos']] === '1'){
        increment(allOpioidPresent, state);
      }

      stimulantByAge[state] = stimulantByAge[state] || ageDataInitial();
      stimulantByAge[us] = stimulantByAge[us] || ageDataInitial();

      if(row[keyIndex['stimulant_cod']] === '1'){
        stimulant = true;
        stimulantByAge[state][age]++;
        stimulantByAge[us][age]++;
        increment(allStimulantCause, state);
      }

      if(row[keyIndex['stimulant_pos']] === '1') {
        increment(allStimulantPresent, state);
      }

      if(!opioidStimulantData[state]){
        opioidStimulantData[state] = {'o': 0, 's': 0, 'os': 0, 'n': 0}
      }
      if(!opioidStimulantData[us]){
        opioidStimulantData[us] = {'o': 0, 's': 0, 'os': 0, 'n': 0}
      }

      if(opioid && !stimulant){
        opioidStimulantData[state]['o']++;
        opioidStimulantData[us]['o']++;
      } else if(!opioid && stimulant) {
        opioidStimulantData[state]['s']++;
        opioidStimulantData[us]['s']++;
      } else if(opioid && stimulant) {
        opioidStimulantData[state]['os']++;
        opioidStimulantData[us]['os']++;
      } else {
        opioidStimulantData[state]['n']++;
        opioidStimulantData[us]['n']++;
      }

      let drugCombination = '';
      if(row[keyIndex['imfs_cod']] === '1'){
        drugCombination += '1';
      } else {
        drugCombination += '0';
      }
      if(row[keyIndex['heroin_def_cod_v2']] === '1'){
        drugCombination += '1';
      } else {
        drugCombination += '0';
      }
      if(row[keyIndex['rx_opioid_cod_v2']] === '1'){
        drugCombination += '1';
      } else {
        drugCombination += '0';
      }
      if(row[keyIndex['cocaine_t_cod']] === '1'){
        drugCombination += '1';
      } else {
        drugCombination += '0';
      }
      if(row[keyIndex['meth_r_cod']] === '1'){
        drugCombination += '1';
      } else {
        drugCombination += '0';
      }
      if(!drugCombinationData[us]) drugCombinationData[us] = {};
      if(!drugCombinationData[state]) drugCombinationData[state] = {};
      if(!drugCombinationData[us][drugCombination]) drugCombinationData[us][drugCombination] = 0;
      if(!drugCombinationData[state][drugCombination]) drugCombinationData[state][drugCombination] = 0;
      drugCombinationData[us][drugCombination]++;
      drugCombinationData[state][drugCombination]++;

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

      ageData[state] = ageData[state] || ageDataInitial();
      ageData[us] = ageData[us] || ageDataInitial();
      ageDataBySex[state] = ageDataBySex[state] || ageDataBySexInitial();
      ageDataBySex[us] = ageDataBySex[us] || ageDataBySexInitial();
      raceAgeData[state] = raceAgeData[state] || raceDataInitial();
      raceAgeData[us] = raceAgeData[us] || raceDataInitial();
      drugAgeData[state] = drugAgeData[state] || drugDataInitial();
      drugAgeData[us] = drugAgeData[us] || drugDataInitial();
      let sex = row[keyIndex['Sex']] === '1' ? 'male' : 'female';
      let race = row[keyIndex['race_eth_v2']];
      if(ageData[state][age] !== undefined){
        ageData[state][age]++;
        ageData[us][age]++;
      }
      if(ageDataBySex[state][sex][age] !== undefined){
        ageDataBySex[state][sex][age]++;
        ageDataBySex[us][sex][age]++;
      }
      if(race.length > 0 && raceAgeData[state][race][age] !== undefined){
        raceAgeData[state][race][age]++;
        raceAgeData[us][race][age]++;
      }

      Object.keys(drugTypeMapping).forEach(drug => {
        if(row[keyIndex[drug]] === '1') {
          drugAgeData[state][drugLabelMapping[drug]][age]++;
          drugAgeData[us][drugLabelMapping[drug]][age]++;
        }
      });

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

    let stateAgePopsOverall;
    let stateAgeSexPopsOverall;
    let stateAgeRacePopsOverall;
    statesFinal.forEach(state => {
      if(state !== us){
        if(!stateAgePopsOverall) {
          stateAgePopsOverall = stateAgePops[reverseFips[state]];
          stateAgeSexPopsOverall = stateAgeSexPops[reverseFips[state]];
          stateAgeRacePopsOverall = stateAgeRacePops[reverseFips[state]];
        } else {
          stateAgePopsOverall = nestedAdd(stateAgePops[reverseFips[state]], stateAgePopsOverall);
          stateAgeSexPopsOverall = nestedAdd(stateAgeSexPops[reverseFips[state]], stateAgeSexPopsOverall);
          stateAgeRacePopsOverall = nestedAdd(stateAgeRacePops[reverseFips[state]], stateAgeRacePopsOverall);
        }
      }
    });
    stateAgePops[reverseFips[us]] = stateAgePopsOverall;
    stateAgeSexPops[reverseFips[us]] = stateAgeSexPopsOverall;
    stateAgeRacePops[reverseFips[us]] = stateAgeRacePopsOverall;

    let typeOfDrugData = {};

    statesFinal.forEach(state => {
      typeOfDrugData[state] = [
        {
          opioid: 'Any Opioids', 
          presentPercent: percent(allOpioidPresent[state], totalDeaths[state]), 
          causePercent: percent(allOpioidCause[state], totalDeaths[state]),
          presentCount: checkCutoff(allOpioidPresent[state]),
          causeCount: checkCutoff(allOpioidCause[state])
        },
        {
          opioid: 'Illicitly manufactured fentanyls', 
          presentPercent: percent(keyCounts[state]['imfs_pos']['1'], totalDeaths[state]), 
          causePercent: percent(keyCounts[state]['imfs_cod']['1'], totalDeaths[state]),
          presentCount: checkCutoff(keyCounts[state]['imfs_pos']['1']),
          causeCount: checkCutoff(keyCounts[state]['imfs_cod']['1'])
        },
        {
          opioid: 'Heroin', 
          presentPercent: percent(keyCounts[state]['heroin_def_v2']['1'], totalDeaths[state]), 
          causePercent: percent(keyCounts[state]['heroin_def_cod_v2']['1'], totalDeaths[state]),
          presentCount: checkCutoff(keyCounts[state]['heroin_def_v2']['1']),
          causeCount: checkCutoff(keyCounts[state]['heroin_def_cod_v2']['1'])
        },
        {
          opioid: 'Prescription opioids',
          presentPercent: percent(keyCounts[state]['rx_opioid_v2']['1'], totalDeaths[state]), 
          causePercent: percent(keyCounts[state]['rx_opioid_cod_v2']['1'], totalDeaths[state]),
          presentCount: checkCutoff(keyCounts[state]['rx_opioid_v2']['1']),
          causeCount: checkCutoff(keyCounts[state]['rx_opioid_cod_v2']['1'])
        },
        {
          opioid: 'Any Stimulant', 
          presentPercent: percent(allStimulantPresent[state], totalDeaths[state]), 
          causePercent: percent(allStimulantCause[state], totalDeaths[state]),
          presentCount: checkCutoff(allStimulantPresent[state]),
          causeCount: checkCutoff(allStimulantCause[state])
        },
        {
          opioid: 'Cocaine', 
          presentPercent: percent(keyCounts[state]['cocaine_t']['1'], totalDeaths[state]), 
          causePercent: percent(keyCounts[state]['cocaine_t_cod']['1'], totalDeaths[state]),
          presentCount: checkCutoff(keyCounts[state]['cocaine_t']['1']),
          causeCount: checkCutoff(keyCounts[state]['cocaine_t_cod']['1'])
        },
        {
          opioid: 'Methamphetamine', 
          presentPercent: percent(keyCounts[state]['meth_r']['1'], totalDeaths[state]), 
          causePercent: percent(keyCounts[state]['meth_r_cod']['1'], totalDeaths[state]),
          presentCount: checkCutoff(keyCounts[state]['meth_r']['1']),
          causeCount: checkCutoff(keyCounts[state]['meth_r_cod']['1'])
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
      let opioids = ['rx_opioid_cod_v2','imfs_cod','heroin_def_cod_v2'];
      let stimulants = ['meth_r_cod','cocaine_t_cod'];
      let opioidMaxValue = Math.max.apply(Math, opioids.map(drug => keyCounts[state][drug]['1']));
      let stimulantMaxValue = Math.max.apply(Math, stimulants.map(drug => keyCounts[state][drug]['1']));

      additionalDrugData[state] = {
        commonOpioid: drugLabelMapping[opioids.find(drug => keyCounts[state][drug]['1'] === opioidMaxValue)],
        commonStimulant: drugLabelMapping[stimulants.find(drug => keyCounts[state][drug]['1'] === stimulantMaxValue)]
      }
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
        intervention: [
          { 
            circumstance: 'Recent release from institutional setting', 
            percent: percent(keyCounts[state]['recentinst']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['recentinst']['1']) },
          { 
            circumstance: 'Prior overdose', 
            percent: percent( keyCounts[state]['priorod']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['priorod']['1']) },
          { 
            circumstance: 'Mental health diagnosis', 
            percent: percent(keyCounts[state]['MentalHealthProblem_c']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['MentalHealthProblem_c']['1']) },
          { 
            circumstance: 'Current treatment for substance use disorder', 
            percent: percent(keyCounts[state]['evertrt']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['evertrt']['1']) },
          { 
            circumstance: 'Potential bystander present', 
            percent: percent(keyCounts[state]['bystander']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['bystander']['1']) },
          { 
            circumstance: 'Fatal drug use witnessed', 
            percent: percent(keyCounts[state]['witnesseddruguse']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['witnesseddruguse']['1']) },
        ],
        other: [
          { 
            circumstance: 'History of substance use/misuse', 
            percent: percent(keyCounts[state]['SubstanceAbuseOther_c']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['SubstanceAbuseOther_c']['1']) },
          { 
            circumstance: 'Naloxone administered', 
            percent: percent(keyCounts[state]['NaloxoneAdministered']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['NaloxoneAdministered']['1']) },
          { 
            circumstance: 'Current pain treatment', 
            percent: percent(keyCounts[state]['pain_treat']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['pain_treat']['1']) },
          { 
            circumstance: 'Recent return to use of opioids', 
            percent: percent(keyCounts[state]['recentrelapse']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['recentrelapse']['1']) },
          { 
            circumstance: 'Experiencing homelessness', 
            percent: percent(keyCounts[state]['Homeless']['1'], totalDeaths[state]),
            count: checkCutoff(keyCounts[state]['Homeless']['1']) }
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

    let mapData = {'All': {}, 'Opioid': {}, 'Stimulant': {}};
    Object.keys(drugTypeMapping).forEach(drug => {
      mapData[drugLabelMapping[drug]] = {}

      statesFinal.forEach(state => {
        mapData[drugLabelMapping[drug]][state] = {deaths: checkCutoff(keyCounts[state][drug]['1'])};
      });  
    }); 

    let totalDeathsCutoff = {};
    let opioidDeathsCutoff = {};
    let stimulantDeathsCutoff = {};
    statesFinal.forEach(state => {
      totalDeathsCutoff[state] = {deaths: checkCutoff(totalDeaths[state])};
      opioidDeathsCutoff[state] = {deaths: checkCutoff(allOpioidCause[state])};
      stimulantDeathsCutoff[state] = {deaths: checkCutoff(allStimulantCause[state])};
    });;
    mapData['All'] = totalDeathsCutoff;
    mapData['Opioid'] = opioidDeathsCutoff;
    mapData['Stimulant'] = stimulantDeathsCutoff;

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
        {sex: 'Male', percent: percent(keyCounts[state]['Sex']['1'], totalDeaths[state]), count: checkCutoff(keyCounts[state]['Sex']['1'])},
        {sex: 'Female', percent: percent(keyCounts[state]['Sex']['2'], totalDeaths[state]), count: checkCutoff(keyCounts[state]['Sex']['2'])}
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
      ageDataFinal[state] = Object.keys(ageData[state]).map(ageGroup => ({
          age: ageGroup, 
          percent: percent(ageData[state][ageGroup], totalDeaths[state]),
          count: checkCutoff(ageData[state][ageGroup]),
          rate: checkCutoff(ageData[state][ageGroup], Math.round(ageData[state][ageGroup] / stateAgePops[reverseFips[state]][ageGroup] * 1000000) / 10)
        }));
    });

    fs.writeFile(ageFilePath, JSON.stringify(ageDataFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
    
    let ageDataBySexFinal = {};
    statesFinal.forEach(state => {
      let maleTotal = 0;
      let femaleTotal = 0;
      Object.keys(ageDataBySex[state]['male']).forEach(ageGroup => maleTotal += ageDataBySex[state]['male'][ageGroup]);
      Object.keys(ageDataBySex[state]['female']).forEach(ageGroup => femaleTotal += ageDataBySex[state]['female'][ageGroup]);

      ageDataBySexFinal[state] = {
        'male': Object.keys(ageDataBySex[state]['male']).map(ageGroup => ({
          age: ageGroup, 
          percent: percent(ageDataBySex[state]['male'][ageGroup], maleTotal),
          count: checkCutoff(ageDataBySex[state]['male'][ageGroup]),
          rate: checkCutoff(ageDataBySex[state]['male'][ageGroup], Math.round(ageDataBySex[state]['male'][ageGroup] / stateAgeSexPops[reverseFips[state]]['1'][ageGroup] * 1000000) / 10)
        })),
        'female': Object.keys(ageDataBySex[state]['female']).map(ageGroup => ({
          age: ageGroup, 
          percent: percent(ageDataBySex[state]['female'][ageGroup], femaleTotal),
          count: checkCutoff(ageDataBySex[state]['female'][ageGroup]),
          rate: checkCutoff(ageDataBySex[state]['female'][ageGroup], Math.round(ageDataBySex[state]['female'][ageGroup] / stateAgeSexPops[reverseFips[state]]['2'][ageGroup] * 1000000) / 10)
        }))
      };
    });

    fs.writeFile(ageBySexFilePath, JSON.stringify(ageDataBySexFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
    
    let raceData = {};
    statesFinal.forEach(state => {
      raceData[state] = [];

      Object.keys(raceDataInitial()).forEach(raceNum => {
        if(raceMapping[raceNum]){
          raceData[state].push({
            race: raceMapping[raceNum], 
            deaths: checkCutoff(keyCounts[state]['race_eth_v2'][raceNum] || 0), 
            percent: percent(keyCounts[state]['race_eth_v2'][raceNum] || 0, totalDeaths[state])});
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
      stateData.push({state: state, value: totalDeaths[state]});
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
      interventionsDataFinal[state] = percent(interventions[state], totalDeaths[state]);
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
      timeData[state] = {month: [], quarter: [{quarter: 0, value: 0}, {quarter: 1, value: 0}, {quarter: 2, value: 0}, {quarter: 3, value: 0}]};
      Object.keys(keyCounts[state]['deathmonth_order']).forEach(month => {
        if(!month || month > 60) return;
        timeData[state].month.push({month, value: keyCounts[state]['deathmonth_order'][month]})
        timeData[state].quarter[Math.floor((parseInt(month) - 49) / 3)].value += keyCounts[state]['deathmonth_order'][month];
      });
    });

    fs.writeFile(timeFilePath, JSON.stringify(timeData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let opioidStimulantDataFinal = {};

    const drugGroupLabels = {'o': 'Opioids without stimulants', 'os': 'Opioids with stimulants', 's': 'Stimulants without opioids', 'n': 'Neither opioids nor stimulants'};

    Object.keys(opioidStimulantData).forEach(state => {
      const drugGroupsOrdered = Object.keys(drugGroupLabels).sort((drug1, drug2) => opioidStimulantData[state][drug1] > opioidStimulantData[state][drug2] ? -1 : 1);

      opioidStimulantDataFinal[state] = {
        max: drugGroupLabels[drugGroupsOrdered[0]],
        min: drugGroupLabels[drugGroupsOrdered[drugGroupsOrdered.length - 1]],
        minPercent: percent(opioidStimulantData[state][drugGroupsOrdered[drugGroupsOrdered.length - 1]], totalDeaths[state]),
        horizontalBarData: [
          {
            osName: drugGroupLabels['os'],
            osCount: checkCutoff(opioidStimulantData[state]['os']),
            osPercent: percent(opioidStimulantData[state]['os'], totalDeaths[state]),

            oName: drugGroupLabels['o'],
            oCount: checkCutoff(opioidStimulantData[state]['o']),
            oPercent: percent(opioidStimulantData[state]['o'], totalDeaths[state]),

            sName: drugGroupLabels['s'],
            sCount: checkCutoff(opioidStimulantData[state]['s']),
            sPercent: percent(opioidStimulantData[state]['s'], totalDeaths[state]),

            nName: drugGroupLabels['n'],
            nCount: checkCutoff(opioidStimulantData[state]['n']),
            nPercent: percent(opioidStimulantData[state]['n'], totalDeaths[state])
          }
        ]};
    });

    fs.writeFile(opioidStimulantFilePath, JSON.stringify(opioidStimulantDataFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let drugCombinationDataFinal = {};
    Object.keys(drugCombinationData).forEach(state => {
      const top5 = Object.keys(drugCombinationData[state]).sort((a, b) => {
          if(drugCombinationData[state][a] < drugCombinationData[state][b]){
            return 1;
          } else if (drugCombinationData[state][a] > drugCombinationData[state][b]){
            return -1;
          }
          return 0;
        }).filter(key => {
          return key !== '00000';
        }).slice(0, 5);

      drugCombinationDataFinal[state] = {
        'total': percent(top5.map(combo => drugCombinationData[state][combo]).reduce((prev, next) => prev + next), totalDeaths[state]),
        'illicit': 100 - (drugCombinationData[state]['00100'] ? percent(drugCombinationData[state]['00100'], totalDeaths[state]) : 0),
        'combinations': top5.map(key => ({
          drugCombination: key,
          deaths: checkCutoff(drugCombinationData[state][key]),
          percent: percent(checkCutoff(drugCombinationData[state][key]), totalDeaths[state])
        }))};
    });

    fs.writeFile(drugCombinationFilePath, JSON.stringify(drugCombinationDataFinal), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let ageAdjustedRates = [];
    statesFinal.forEach(state => {
      let rate = 0;

      Object.keys(weights).forEach(ageGroup => {
        if(stateAgePops[reverseFips[state]]){
          rate += (keyCounts[state]['age_cat'][ageGroup] || 0) / stateAgePops[reverseFips[state]][ageGroup] * weights[ageGroup];
        }
      });

      rate = Math.round(rate * 1000000) / 10;
      rate = checkCutoff(totalDeaths[state], rate);

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
      let rateMale = 0;
      let rateFemale = 0;

      Object.keys(weights).forEach(ageGroup => {
        if(stateAgeSexPops[reverseFips[state]]){
          rateMale += (ageDataBySex[state]['male'][ageGroup] || 0) / stateAgeSexPops[reverseFips[state]]['1'][ageGroup] * weights[ageGroup];
          rateFemale += (ageDataBySex[state]['female'][ageGroup] || 0) / stateAgeSexPops[reverseFips[state]]['2'][ageGroup] * weights[ageGroup];
        }
      });

      rateMale = Math.round(rateMale * 1000000) / 10;
      rateFemale = Math.round(rateFemale * 1000000) / 10;

      rateMale = checkCutoff(keyCounts[state]['Sex']['1'], rateMale);
      rateFemale = checkCutoff(keyCounts[state]['Sex']['2'], rateFemale);

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
      ageAdjustedRaceRates[state] = [];

      Object.keys(raceDataInitial()).forEach(race => {
        if(race.length === 0) return;

        let rate = 0;

        Object.keys(weights).forEach(ageGroup => {
          if(stateAgePops[reverseFips[state]]){
            rate += (raceAgeData[state][race][ageGroup] || 0) / stateAgeRacePops[reverseFips[state]][race][ageGroup] * weights[ageGroup];
          }
        });

        rate = Math.round(rate * 1000000) / 10;
        rate = checkCutoff(keyCounts[state]['race_eth_v2'][race], rate);

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

    const processDrugAdjusted = (drug) => {
      const drugName = drugLabelMapping[drug] || drug;
      ageAdjustedDrugRates[drugName] = {};

      statesFinal.forEach(state => {
        ageAdjustedDrugRates[drugName][state] = {};

        rate = 0;

        Object.keys(weights).forEach(ageGroup => {
          if(stateAgePops[reverseFips[state]]){
            let value;
            if(drugName === 'All'){
              value = ageData[state][ageGroup];
            } else if(drugName === 'Opioid'){
              value = opioidByAge[state][ageGroup];
            } else if(drugName === 'Stimulant'){
              value = stimulantByAge[state][ageGroup];
            } else {
              value = drugAgeData[state][drugName][ageGroup];
            }
            rate += (value || 0) / stateAgePops[reverseFips[state]][ageGroup] * weights[ageGroup];
          }
        });

        rate = Math.round(rate * 1000000) / 10;
        if(drugName === 'All'){
          rate = checkCutoff(totalDeaths[state], rate);
        } else if(drugName === 'Opioid'){
          rate = checkCutoff(allOpioidCause[state], rate);
        } else if(drugName === 'Stimulant'){
          rate = checkCutoff(allStimulantCause[state], rate);
        } else {
          rate = checkCutoff(keyCounts[state][drug]['1'], rate);
        }

        ageAdjustedDrugRates[drugName][state]['rate'] = rate;
        if(!ageAdjustedDrugRates[drugName].min || rate < ageAdjustedDrugRates[drugName].min) {
          ageAdjustedDrugRates[drugName].min = rate;
        }
        if(!ageAdjustedDrugRates[drugName].max || rate > ageAdjustedDrugRates[drugName].max) {
          ageAdjustedDrugRates[drugName].max = rate;
        }
      });
    };

    let ageAdjustedDrugRates = {};
    Object.keys(drugTypeMapping).forEach(drug => {
      processDrugAdjusted(drug);
    });
    processDrugAdjusted('All');
    processDrugAdjusted('Opioid');
    processDrugAdjusted('Stimulant');

    fs.writeFile(ageAdjustedDrugRatesFilePath, JSON.stringify(ageAdjustedDrugRates), {flag: 'w'}, (err) => {
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