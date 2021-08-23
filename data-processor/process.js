const fs = require('fs');
const csv = require('csv-parse');

const inputFilePath = './input.csv';
const outputFilePath = '../src/data/data.json';
const typeOfDrugFilePath = '../src/data/type-of-drug.json';
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

let keyIndex = {};
let keyCounts = {};
let first = true;
let totalDeaths = 0;
let allOpioidCause = 0;
let allOpioidPresent = 0;

function percent(deaths) {
  return Math.round(deaths / totalDeaths * 10000) / 100;
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

    fs.writeFile(outputFilePath, JSON.stringify(keyCounts), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
  });