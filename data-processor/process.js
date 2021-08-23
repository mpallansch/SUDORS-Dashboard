const fs = require('fs');
const csv = require('csv-parse');

const inputFilePath = './input.csv';
const outputFilePath = '../src/data/data.json';
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
    fs.writeFile(outputFilePath, JSON.stringify(keyCounts), {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
  });