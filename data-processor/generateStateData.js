const fs = require('fs');
const csv = require('csv-parse');

const inputFilePath = './input.csv';
const outputFilePath = './state.csv';
const states = ["Alabama", "Alaska", "American Samoa", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District Of Columbia", "Federated States Of Micronesia", "Florida", "Georgia", "Guam", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Marshall Islands", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Northern Mariana Islands", "Ohio", "Oklahoma", "Oregon", "Palau", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virgin Islands", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const keys = [
  'State',
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

let first = true;
let outputCSVData = keys.join(',') + '\n';

fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on('data', (row) => {
    if(first){
      first = false;
    } else {
      states.forEach(state => {
        outputCSVData += (state + ',');
        row.forEach((item, index) => {
          if(index === 0){
            outputCSVData += '2019,';
          } else if(index === 1){
            outputCSVData += ((Math.round(Math.random() * 99) + 1) + ',');
          } else {
            outputCSVData += Math.round(Math.random());
            if(index === row.length - 1) {
              outputCSVData += '\n';
            } else {
              outputCSVData += ',';
            }
          }
        });
      });
    }
  })
  .on('end', () => {
    fs.writeFile(outputFilePath, outputCSVData, {flag: 'w'}, (err) => {
      if(err){
        console.log(err);
      } else {
        console.log('Data processed successfully');
      }
    });
  });