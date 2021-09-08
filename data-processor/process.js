const fs = require('fs');
const csv = require('csv-parse');

const inputFilePath = './state.csv';
//const outputFilePath = '../src/data/data.json';
const typeOfDrugFilePath = '../src/data/causes.json';
const additionalDrugFilePath = '../src/data/additional-drugs.json';
const circumstancesFilePath = '../src/data/circumstances.json';
const mapFilePath = '../src/data/map.json';
const sexFilePath = '../src/data/sex.json';
const ageFilePath = '../src/data/age.json';
const raceFilePath = '../src/data/race.json';
const stateFilePath = '../src/data/state.json';
const stateKey = 'State';
const keys = [
  'Incident_Year',
  'Age',
  'EMSPresent',
  'Homeless',
  'InjuryLocation', 
  'Sex',
  'BystandersPresent',
  'NaloxoneAdministered',
  'antidepressant_r',
  'benzo_r_cod',
  'meth_r_cod',
  'opioid_r_cod',
  'alcohol_r',
  'benzo_r',
  'meth_r',  
  'opioid_r_pos',
  'MentalHealthProblem_c',
  'SubstanceAbuseOther_c',
  'age_cat',
  'race_eth',
  'deathmonth_order',
  'fentanyl_t',
  'fentanyl_t_cod',
  'cocaine_t',
  'cocaine_t_cod',
  'heroin_def_v2',
  'heroin_def_cod_v2',
  'rx_opioid_v2',
  'rx_illicit_v2',
  'rx_opioid_cod_v2',
  'rx_illicit_cod_v2',
  'pain_treat',
  'recentinst',
  'evertx',
  'priorod',
  'recentrelapse',
  'witnesseddruguse',
  'sitenum'
];
const drugTypeMapping = {
  'benzo_r_cod': 'benzo_r',
  'meth_r_cod': 'meth_r',
  'rx_opioid_cod_v2': 'rx_opioid_v2',
  'fentanyl_t_cod': 'fentanyl_t',
  'heroin_def_cod_v2': 'heroin_def_v2',
  'cocaine_t_cod': 'cocaine_t'
};
const drugLabelMapping = {
  'benzo_r_cod': 'Benzos',
  'benzo_r': 'Benzos',
  'meth_r_cod': 'Meth',
  'meth_r': 'Meth',
  'rx_opioid_cod_v2': 'Rx Opioids',
  'rx_opioid_v2': 'Rx Opioids',
  'fentanyl_t_cod': 'IMFs',
  'fentanyl_t': 'IMFs',
  'heroin_def_cod_v2': 'Heroin',
  'heroin_def_v2': 'Heroin',
  'cocaine_t_cod': 'Cocaine',
  'cocaine_t': 'Cocaine'
};
const raceMapping = {
  '0': 'Race category 0',
  '1': 'Race category 1',
  '2': 'Race category 2',
  '3': 'Race category 3',
  '4': 'Race category 4',
  '5': 'Race category 5'
};
const us = 'United States';

let stateKeyIndex;
let first = true;
let keyIndex = {};
let keyCounts = {};
let additionalDrugs = {};
let totalDeaths = {};
let allOpioidCause = {};
let allOpioidPresent = {};
let ageData = {};
let ageCounts = {
  '15-24': 0,
  '25-34': 0,
  '35-44': 0,
  '45-54': 0,
  '55-64': 0,
  '65+': 0
};

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
      const state = row[stateKeyIndex];

      increment(totalDeaths, state);

      if(row[keyIndex['fentanyl_t']] === '1' ||
          row[keyIndex['heroin_def_v2']] === '1' ||
          row[keyIndex['rx_opioid_v2']] === '1'){
        increment(allOpioidPresent, state);
      }

      if(row[keyIndex['fentanyl_t_cod']] === '1' ||
          row[keyIndex['heroin_def_cod_v2']] === '1' ||
          row[keyIndex['rx_opioid_cod_v2']] === '1'){
        increment(allOpioidCause, state);
      }

      Object.keys(drugTypeMapping).forEach(cause => {
        if(row[keyIndex[cause]] === '1'){
          if(!additionalDrugs[state]) additionalDrugs[state] = {};
          if(!additionalDrugs[state][cause]) additionalDrugs[state][cause] = {};

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

      ageData[state] = ageData[state] || {'male': {...ageCounts}, 'female':{...ageCounts}};
      ageData[us] = ageData[us] || {'male': {...ageCounts}, 'female': {...ageCounts}};
      let age = parseInt(row[keyIndex['Age']]);
      let sex = row[keyIndex['Sex']] === '1' ? 'male' : 'female';
      if(age >= 15 && age < 25){
        ageData[state][sex]['15-24'] += 1;
        ageData[us][sex]['15-24'] += 1;
      } else if(age >= 25 && age < 35){
        ageData[state][sex]['25-34'] += 1;
        ageData[us][sex]['25-34'] += 1;
      } else if(age >= 35 && age < 45){
        ageData[state][sex]['35-44'] += 1;
        ageData[us][sex]['35-44'] += 1;
      } else if(age >= 45 && age < 55){
        ageData[state][sex]['45-54'] += 1;
        ageData[us][sex]['45-54'] += 1;
      } else if(age >= 55 && age < 65){
        ageData[state][sex]['55-64'] += 1;
        ageData[us][sex]['55-64'] += 1;
      } else if(age >= 65){
        ageData[state][sex]['65+'] += 1;
        ageData[us][sex]['65+'] += 1;
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
          present: percent(keyCounts[state]['fentanyl_t']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['fentanyl_t_cod']['1'], totalDeaths[state])
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
          opioid: 'Benzos', 
          present: percent(keyCounts[state]['benzo_r']['1'], totalDeaths[state]), 
          cause: percent(keyCounts[state]['benzo_r_cod']['1'], totalDeaths[state])
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
        home: percent(keyCounts[state]['InjuryLocation']['1'], totalDeaths[state]),
        other: [
          { 
            circumstance: 'Current or past substance abuse/misuse', 
            value: percent(keyCounts[state]['SubstanceAbuseOther_c']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Bystander present', 
            value: percent(keyCounts[state]['BystandersPresent']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Mental health diagnosis', 
            value: percent(keyCounts[state]['MentalHealthProblem_c']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Naloxone Administered', 
            value: percent(keyCounts[state]['NaloxoneAdministered']['1'], totalDeaths[state]) },
          { 
            circumstance: 'Ever treated for substance abuse disorder', 
            value: percent(keyCounts[state]['SubstanceAbuseOther_c']['1'], totalDeaths[state]) },
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
            value: percent( ['priorod']['1'], totalDeaths[state]) },
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

    let mapData = {};
    let mapMax = Number.MIN_VALUE;
    let mapMin = Number.MAX_VALUE;
    statesFinal.forEach(state => {
      mapData[state] = {
        deaths: allOpioidCause[state]
      };
      if(state !== us && allOpioidCause[state] > mapMax){
        mapMax = allOpioidCause[state];
      }
      if(state !== us && allOpioidCause[state] < mapMin){
        mapMin = allOpioidCause[state];
      }
    });
    mapData.max = mapMax;
    mapData.min = mapMin;

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
        {sex: 'Male', value: keyCounts[state]['Sex']['1']},
        {sex: 'Female', value: keyCounts[state]['Sex']['0']}
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

    console.log(keyCounts['Georgia']);
    
    let raceData = {};
    statesFinal.forEach(state => {
      raceData[state] = [];
      Object.keys(keyCounts[state]['race_eth']).forEach(raceNum => {
        raceData[state].push({race: raceMapping[raceNum], value: percent(keyCounts[state]['race_eth'][raceNum], totalDeaths[state])});
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

    /*fs.writeFile(outputFilePath, JSON.stringify(keyCounts), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });*/
  });