const fs = require('fs');
const csv = require('csv-parse');

const inputFilePath = './input.csv';
//const outputFilePath = '../src/data/data.json';
const typeOfDrugFilePath = '../src/data/causes.json';
const additionalDrugFilePath = '../src/data/additional-drugs.json';
const circumstancesFilePath = '../src/data/circumstances.json';
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
let drugTypeMapping = {
  'benzo_r_cod': 'benzo_r',
  'meth_r_cod': 'meth_r',
  'rx_opioid_cod_v2': 'rx_opioid_v2',
  'fentanyl_t_cod': 'fentanyl_t',
  'heroin_def_cod_v2': 'heroin_def_v2',
  'cocaine_t_cod': 'cocaine_t'
};
let drugLabelMapping = {
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

let keyIndex = {};
let keyCounts = {};
let additionalDrugs = {};
let first = true;
let totalDeaths = 0;
let allOpioidCause = 0;
let allOpioidPresent = 0;


Object.keys(drugTypeMapping).forEach(cause => {
  additionalDrugs[cause] = {};
});

function percent(deaths, total) {
  return Math.round(deaths / (total || totalDeaths) * 10000) / 100;
}

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    if(first){
      keys.forEach(key => {
        let index = row.indexOf(key);
        if(index !== -1){
          keyIndex[key] = index;
          keyCounts[key] = {};
        } else {
          throw ('Cannot find key ' + key);
        }
      });

      first = false;
    } else {
      totalDeaths++;

      if(row[keyIndex['fentanyl_t']] === '1' ||
          row[keyIndex['heroin_def_v2']] === '1' ||
          row[keyIndex['rx_opioid_v2']] === '1'){
        allOpioidPresent++;
      }

      if(row[keyIndex['fentanyl_t_cod']] === '1' ||
          row[keyIndex['heroin_def_cod_v2']] === '1' ||
          row[keyIndex['rx_opioid_cod_v2']] === '1'){
        allOpioidCause++;
      }

      Object.keys(drugTypeMapping).forEach(cause => {
        if(row[keyIndex[cause]] === '1'){
          Object.keys(drugTypeMapping).forEach(causeForAdditional => {
            if(causeForAdditional !== cause && row[keyIndex[drugTypeMapping[causeForAdditional]]] === '1'){
              if(additionalDrugs[cause][drugTypeMapping[causeForAdditional]] === undefined){
                additionalDrugs[cause][drugTypeMapping[causeForAdditional]] = 1;
              } else {
                additionalDrugs[cause][drugTypeMapping[causeForAdditional]]++;
              }
            }
          });
          additionalDrugs[cause]['total'] = additionalDrugs[cause]['total'] === undefined ? 1 : (additionalDrugs[cause]['total'] + 1);
        }
      });

      keys.forEach(key => {
        if(keyCounts[key][row[keyIndex[key]]]){
          keyCounts[key][row[keyIndex[key]]]++;
        } else {
          keyCounts[key][row[keyIndex[key]]] = 1;
        }
      });
      
    }
  })
  .on('end', () => {
    let typeOfDrugData = [{opioid: 'Any Opioids', present: percent(allOpioidPresent), cause: percent(allOpioidCause)},
                   {opioid: 'IMFs', present: percent(keyCounts['fentanyl_t']['1']), cause: percent(keyCounts['fentanyl_t_cod']['1'])},
                   {opioid: 'Cocaine', present: percent(keyCounts['cocaine_t']['1']), cause: percent(keyCounts['cocaine_t_cod']['1'])},
                   {opioid: 'Heroin', present: percent(keyCounts['heroin_def_v2']['1']), cause: percent(keyCounts['heroin_def_cod_v2']['1'])},
                   {opioid: 'Benzos', present: percent(keyCounts['benzo_r']['1']), cause: percent(keyCounts['benzo_r_cod']['1'])},
                   {opioid: 'Rx Opioids', present: percent(keyCounts['rx_opioid_v2']['1']), cause: percent(keyCounts['rx_opioid_cod_v2']['1'])},
                   {opioid: 'Meth', present: percent(keyCounts['meth_r']['1']), cause: percent(keyCounts['meth_r_cod']['1'])}];

    fs.writeFile(typeOfDrugFilePath, JSON.stringify(typeOfDrugData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let additionalDrugData = [];
    Object.keys(additionalDrugs).forEach(cause => {
      let total = additionalDrugs[cause]['total'];
      let row = {cause: drugLabelMapping[cause]};
      Object.keys(additionalDrugs[cause]).forEach(additional => row[drugLabelMapping[additional]] = percent(additionalDrugs[cause][additional], total));
      additionalDrugData.push(row);
    });

    fs.writeFile(additionalDrugFilePath, JSON.stringify(additionalDrugData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });

    let circumstancesData = {
      home: percent(keyCounts['InjuryLocation']['1'], totalDeaths),
      other: [
        { circumstance: 'Current or past substance abuse/misuse', value: percent(keyCounts['SubstanceAbuseOther_c']['1'], totalDeaths) },
        { circumstance: 'Bystander present', value: percent(keyCounts['BystandersPresent']['1'], totalDeaths) },
        { circumstance: 'Mental health diagnosis', value: percent(keyCounts['MentalHealthProblem_c']['1'], totalDeaths) },
        { circumstance: 'Naloxone Administered', value: percent(keyCounts['NaloxoneAdministered']['1'], totalDeaths) },
        { circumstance: 'Ever treated for substance abuse disorder', value: percent(keyCounts['SubstanceAbuseOther_c']['1'], totalDeaths) },
        { circumstance: 'Recent release from institution', value: percent(keyCounts['recentinst']['1'], totalDeaths) },
        { circumstance: 'Current pain treatment', value: percent(keyCounts['pain_treat']['1'], totalDeaths) },
        { circumstance: 'Fatal drug use witnessed', value: percent(keyCounts['witnesseddruguse']['1'], totalDeaths) },
        { circumstance: 'Prior overdose', value: percent(keyCounts['priorod']['1'], totalDeaths) },
        { circumstance: 'Recent opioid use relapse', value: percent(keyCounts['recentrelapse']['1'], totalDeaths) },
        { circumstance: 'Homeless', value: percent(keyCounts['Homeless']['1'], totalDeaths) }
      ]
    };

    fs.writeFile(circumstancesFilePath, JSON.stringify(circumstancesData), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    })

    /*fs.writeFile(outputFilePath, JSON.stringify(keyCounts), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });*/
  });