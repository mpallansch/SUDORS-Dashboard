import { useEffect, useCallback, useRef, useState } from 'react'; 
import ReactTooltip from 'react-tooltip'; 
import ResizeObserver from 'resize-observer-polyfill';

import WaffleChart from './components/WaffleChart';
import SexChart from './components/SexChart';
import AgeChart from './components/AgeChart';
import AgeBySexChart from './components/AgeBySexChart';
import RaceChart from './components/RaceChart';
import StateChart from './components/StateChart';
import CauseChart from './components/CauseChart';
import OpioidStimulantChart from './components/OpioidStimulantChart';
import DrugCombinationChart from './components/DrugCombinationChart';
import MonthChart from './components/MonthChart';
import CircumstancesChart from './components/CircumstancesChart';
import DataTable from './components/DataTable';
import Footer from './components/Footer';

import { countCutoff } from './constants.json';

import './App.css';

function App(params) {

  const { accessible } = params;

  const viewportCutoffSmall = 550;
  const viewportCutoffMedium = 800;

  const [ dimensions, setDimensions ] = useState({width: 0, height: 0});
  const [ state, setState ] = useState('Overall');
  const [ drug, setDrug ] = useState('All');
  const [ metric, setMetric ] = useState('rate');
  const [ datasets, setDatasets ] = useState();

  const headerMonthChartRef = useRef();
  const headerWaffleChartRef = useRef();
  const sexChartRef = useRef();
  const ageChartRef = useRef();
  const ageBySexChartRef = useRef();
  const raceChartRef = useRef();
  const stateChartRef = useRef();
  const causeChartRef = useRef();
  const opioidStimulantChartRef = useRef();
  const drugCombinationChartRef = useRef();
  const interventionChartRef = useRef();
  const monthChartRef = useRef();
  const waffleChartRef = useRef();

  const datasetUrls = {
    timeData: 'data/time.json',
    mapData: 'data/map.json',
    drugDataRates: 'data/age-adjusted-drug-rates.json',
    interventionData: 'data/interventions.json',
    circumstancesData: 'data/circumstance.json',
    totalData: 'data/totals.json',
    combinationData: 'data/drug-combination.json',
    causeData: 'data/cause.json',
    additionalDrugData: 'data/additional_drug.json',
    opioidStimulantData: 'data/opioid-stimulant.json',
    sexData: 'data/sex.json',
    sexDataRates: 'data/age-adjusted-sex-rates.json',
    ageData: 'data/age.json',
    raceData: 'data/race.json',
    raceDataRates: 'data/age-adjusted-race-rates.json',
    ageBySexData: 'data/age-by-sex.json'
  };
  const datasetKeys = Object.keys(datasetUrls);

  const colorScale = {
    'Male': '#5C2E79',
    'Female': '#63A244',
    'Race': '#BBA1EA',
    'RaceAccent': '#5C2E79',
    'Month': '#325D7D',
    'Intervention': '#712177',
    'Combination': '#712177',
    'OpioidsWithStimulants': '#384766',
    'OpioidsWithoutStimulants': '#7299B1',
    'StimulantsWithoutOpioids': '#00695C',
    'NeitherOpioidsNorStimulants': '#57A292',
    'All': '#325D7D',
    'Any Opioids': '#000C77',
    'Opioid': '#000C77',
    'Methamphetamine': '#A378E8',
    'Heroin': '#0C6F96',
    'Prescription Opioids': '#3FA0AB',
    'Any Stimulants': '#411B6D',
    'Stimulant': '#411B6D',
    'Cocaine': '#671AAA',
    'Illicitly Manufactured Fentanyls': '#294891 '
  };

  const ageMapping = {
    '0': '0-14',
    '1': '15-24',
    '2': '25-34',
    '3': '35-44',
    '4': '45-54',
    '5': '55-64',
    '6': '65+'
  };

  const raceMapping = {
    'AI/AN, non-Hispanic': 'American Indian/Alaska Native, non-Hispanic',
    'A/PI, non-Hispanic': 'Asian/Pacific Islander, non-Hispanic'
  }

  const drugs = ['Illicitly Manufactured Fentanyls', 'Heroin', 'Prescription Opioids', 'Cocaine', 'Methamphetamine'];

  const icons = {
    'History of substance use/misuse': 'cdc-icon-clipboard-list-light',
    'Naloxone administered': 'cdc-icon-first-aid-light',
    'Current pain treatment': 'cdc-icon-medical_04',
    'Experiencing homelessness': 'cdc-icon-home-lg-light',
    'Recent return to use of opioids': 'cdc-icon-sync-alt-light icon'
  };

  const monthLabelOverrides = {
    '0': '    Jan-March', 
    '1': '    Apr-Jun', 
    '2': '    Jul-Sept', 
    '3': '     Oct-Dec'
  };


  const resizeObserver = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;

    if(width !== dimensions.width || height !== dimensions.height) {
      setDimensions({width, height});
    }
  });

  useEffect(() => {
    ReactTooltip.rebuild();
  });

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
        resizeObserver.observe(node);
    } // eslint-disable-next-line
  },[]);

  const stateLabel = <span className="italics">{state}</span>;

  const getDimension = (ref, dimension) => {
    if(!ref.current){
      return 0;
    }

    return dimension === 'width' ? ref.current.clientWidth : ref.current.clientHeight
  }

  const drugTab = (drugName, drugLabel) => (
    <button 
      className={`drug-tab${drugName === drug ? ' active' : ''}`}
      onClick={() => {setDrug(drugName)}}
    >{drugLabel || drugName}</button> 
  );

  const listDrugs = (drugCombination) => {
    let drugCombinationNames = [];
    for(let i = 0; i < drugCombination.length; i++){
      if(drugCombination.charAt(i) === '1') {
        drugCombinationNames.push(drugs[i].toLowerCase());
      }
    }
    return [
      drugCombinationNames.slice(0, -1).join(', '), 
      drugCombinationNames.slice(-1)[0]
    ].join(drugCombinationNames.length < 2 ? '' : 
      drugCombinationNames.length === 2 ? ' and ' : ', and ')
  };

  useEffect(() => {
    Promise.all(datasetKeys.map(key => fetch(datasetUrls[key])))
      .then(async responses => {
        let datasets = {};
        
        for(var i = 0; i < responses.length; i++){
          let json = await responses[i].json();
          datasets[datasetKeys[i]] = json;
        }

        setDatasets(datasets);
      }).catch((err) => {
        console.log(err);
      });
  }, []);

  if(!datasets){
    return <p>Loading...</p>;
  }

  const multipleCombo = datasets.combinationData[state].combinations.filter(combo => ((combo.deaths > countCutoff && combo.drugCombination.match(/1/g)) || []).length > 1);
  const sexMax = [...datasets.sexData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const ageMax = [...datasets.ageData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const raceMax = [...datasets.raceData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const maleAgeMax = [...datasets.ageBySexData[state].Male].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const femaleAgeMax = [...datasets.ageBySexData[state].Female].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const ageRateMax = [...datasets.ageData[state]].sort((a,b) => a.rate < b.rate ? 1 : -1)[0];
  const sexRateMax = [...datasets.sexDataRates[state]].sort((a,b) => a.rate < b.rate ? 1 : -1)[0];
  const raceRateMax = [...datasets.raceDataRates[state]].sort((a,b) => a.rate < b.rate ? 1 : -1)[0];

  const stateSelector = (
    <select aria-label="View data by state" value={state} onChange={(e) => setState(e.target.value)}>
      {Object.keys(datasets.totalData).sort((a, b) => {
        if(a === 'Overall'){
          return -1;
        } else if (b === 'Overall'){
          return 1;
        } else {
          return a < b ? -1 : 1;
        }
      }).map(state => (
        <option key={`dropdown-option-${state}`}>{state}</option>
      ))}
    </select>
  );

  return (
    <div className={`App${dimensions.width < viewportCutoffSmall ? ' small-vp' : ''}${dimensions.width < viewportCutoffMedium ? ' medium-vp' : ''}${accessible ? ' accessible' : ''}`} 
      ref={outerContainerRef}>
      <div className="section">
        <span>View data for:</span>
        {stateSelector}
        <div className="header">
          <h2 className="preheader-label">2020 Data Summary at a Glance, {stateLabel}</h2>
        </div>
        {accessible ? (
          <>
              <DataTable 
                data={[
                  {quarter: 'Total in 2020', value: datasets.totalData[state], percent: '100.0'}, 
                  {quarter: 'Quarter of 2020', spacer: true, colSpan: 2},
                  ...datasets.timeData[state].quarter.map(d => ({quarter: monthLabelOverrides[d.quarter], value: d.value, percent: ((d.value / datasets.totalData[state] * 1000) / 10).toFixed(1)})), 
                  {quarter: 'At least one potential opportunity for intervention', value: datasets.interventionData[state].deaths, percent: datasets.interventionData[state].percent}
                ]}
                xAxisKey={'quarter'}
                labelOverrides={{
                  'quarter': ' ',
                  'value': 'Number of deaths',
                  'percent': 'Percent of deaths'
                }}
                suffixes={{
                  'percent': '%'
                }}
              />
          </>
        ) : (
          <div className="header-sections-container">
            <div className="header-section first">
              <span className="header-text full">
                <span className="enlarged">{Number(datasets.totalData[state]).toLocaleString()}</span> 
                <span className="header-text">total overdose deaths</span>
              </span>
            </div>
            <div className="header-section middle" onClick={() => {monthChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
              <div id="header-line-chart-container" className="chart-container" ref={headerMonthChartRef}>
                <MonthChart 
                    data={datasets.timeData[state]}
                    width={getDimension(headerMonthChartRef, 'width')}
                    height={getDimension(headerMonthChartRef, 'height')}
                    header={true}
                    colorScale={colorScale}
                    el={monthChartRef}
                    accessible={accessible}
                  />
              </div>
              <span className="header-text">deaths by quarter in 2020</span>
            </div>
            <div className="header-section" onClick={() => {interventionChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
              <div id="header-waffle-chart-container" className="chart-container" ref={headerWaffleChartRef}>
                <WaffleChart 
                  data={datasets.interventionData[state]}
                  width={getDimension(headerWaffleChartRef, 'width')}
                  height={getDimension(headerWaffleChartRef, 'height')}
                  header={true}
                />
              </div>
              <span className="header-text"><strong>{datasets.interventionData[state].percent}%</strong> had at least one potential opportunity for intervention<sup>a</sup></span>
            </div>
          </div>
        )}
        <div className="header margin">
          <h2 className="preheader-label">What drugs were involved in overdose deaths in 2020, {stateLabel}?</h2>{stateSelector}
        </div>
        <h3 className="subheader">Rate of overdose deaths by state and drug or drug class</h3>
        {dimensions.width < viewportCutoffSmall && (
          <select className="drug-select" onChange={(e) => {setDrug(e.target.value)}}>
            <option value="All">All Drugs</option>
            <option value="Opioid">Any Opioids</option>
            <option value="Illicitly Manufactured Fentanyls">IMFs</option>
            <option value="Heroin">Heroin</option>
            <option value="Prescription Opioids">Prescription Opioids</option>
            <option value="Stimulant">Any Stimulants</option>
            <option value="Cocaine">Cocaine</option>
            <option value="Methamphetamine">Methamphetamine</option>
          </select>
        )}
        {dimensions.width >= viewportCutoffSmall && (
          <div>
            <div className="drug-tab-section">
              {drugTab('All', 'All Drugs')}
              {drugTab('Opioid', <span>Any Opioid<sup>b</sup></span>)}
            </div>
            <div className="drug-tab-section">
              {drugTab('Illicitly Manufactured Fentanyls', <span>{dimensions.width < viewportCutoffSmall ? 'IMFs' : 'Illicitly Manufactured Fentanyls'}<sup>c</sup></span>)}
              {drugTab('Heroin', <span>Heroin<sup>d</sup></span>)}
            </div>
            <div className="drug-tab-section">
              {drugTab('Prescription Opioids')}
              {drugTab('Stimulant', <span>Any Stimulants<sup>e</sup></span>)}
            </div>
            <div className="drug-tab-section">
              {drugTab('Cocaine')}
              {drugTab('Methamphetamine', dimensions.width < viewportCutoffSmall ? 'Meth' : 'Methamphetamine')}
            </div>
          </div>
        )}
        <div id="state-chart-container" className="chart-container" ref={stateChartRef}>
          <StateChart
            data={datasets.mapData[drug]}
            dataRates={datasets.drugDataRates[drug]}
            width={getDimension(stateChartRef, 'width')}
            height={getDimension(stateChartRef, 'height')}
            setState={setState}
            el={stateChartRef}
            state={state}
            drug={drug}
            accessible={accessible}
            colorScale={colorScale} />
        </div>
        {!accessible && <p className="text-align-center margin-bottom-extra">Age-adjusted rate of deaths per 100,000 persons<sup>†</sup></p>}
        {!accessible && <p className="scale-note"><sup>†</sup> Scale of the chart may change based on the data presented</p>}
      </div>

      <div className="section divider">
        <h3 className="subheader">Percentages<sup>f</sup> of overdose deaths involving select drugs and drug classes, {stateLabel}</h3>
        <p>{datasets.causeData[state].find(d => d.opioid === 'Any Opioids').causePercent.toFixed(1)}% of deaths involved at least one opioid and {datasets.causeData[state].find(d => d.opioid === 'Any Stimulants').causePercent.toFixed(1)}% involved at least one stimulant. {datasets.additionalDrugData[state].commonOpioid} {datasets.additionalDrugData[state].commonOpioid === 'Heroin' ? 'was' : 'were'} the most commonly involved opioids. The most common stimulant involved in overdose deaths was {datasets.additionalDrugData[state].commonStimulants.toLowerCase()}.</p>
        <div className="subsection">
          <div id="cause-chart-container" className="chart-container" ref={causeChartRef}>
            <CauseChart 
              data={datasets.causeData[state]}
              width={getDimension(causeChartRef, 'width')}
              height={getDimension(causeChartRef, 'height')}
              el={causeChartRef}
              state={state}
              accessible={accessible}
              colorScale={colorScale} />
          </div>
        </div>
      </div>

      <div className="section divider">
        <h3 className="subheader">Percentages of overdose deaths involving the most common opioids and stimulants alone or in combination<sup>g</sup>, {stateLabel}</h3>
        <p>The five most frequently occurring opioids and stimulants, alone or in combination, accounted for {datasets.combinationData[state].total.toFixed(1)}% of overdose deaths. 
          {multipleCombo.length > 0 ? 
            ` For example, ${multipleCombo[0].percent.toFixed(1)}% of overdose deaths involved ${listDrugs(multipleCombo[0].drugCombination)}` :
            ` ${datasets.combinationData[state].combinations[0].percent.toFixed(1)}% of overdose deaths involved ${listDrugs(datasets.combinationData[state].combinations[0].drugCombination)}, one of the most common ${datasets.combinationData[state].combinations[0].drugCombination.charAt(3) === '1' || datasets.combinationData[state].combinations[0].drugCombination.charAt(4) === '1' ? 'stimulants' : 'opioids'}`}.</p>
        <div className="subsection no-padding">
          <div id="drug-combination-chart-container" className="chart-container" ref={drugCombinationChartRef}>
            <DrugCombinationChart 
              data={datasets.combinationData[state].combinations}
              width={getDimension(drugCombinationChartRef, 'width')}
              height={getDimension(drugCombinationChartRef, 'height')}
              el={drugCombinationChartRef}
              accessible={accessible}
              colorScale={colorScale} />
          </div>
        </div>
      </div>

      <div className="section divider">
        <h3 className="subheader">Distribution of overdose deaths by opioid and stimulant involvement, {stateLabel}</h3>
        <p>The largest percentage of deaths involved {datasets.opioidStimulantData[state].max.toLowerCase()}, while {datasets.opioidStimulantData[state].minPercent.toFixed(1)}% of overdose deaths involved {datasets.opioidStimulantData[state].min.toLowerCase()}.</p>
        <div className="subsection no-pad">
          <div id="opioid-stimulant-chart-container" className="chart-container" ref={opioidStimulantChartRef}>
            <OpioidStimulantChart 
                data={datasets.opioidStimulantData[state].horizontalBarData}
                width={getDimension(opioidStimulantChartRef, 'width')}
                height={getDimension(opioidStimulantChartRef, 'height')}
                el={opioidStimulantChartRef}
                accessible={accessible}
                colorScale={colorScale} />
          </div>
          {!accessible && (<div id="opioid-stimulant-chart-legend">
            <span className="indicator-container"><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.OpioidsWithStimulants}/></svg><span>Opioids with stimulants</span></span>
            <span className="indicator-container"><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.OpioidsWithoutStimulants}/></svg><span>Opioids without stimulants</span></span>
            <span className="indicator-container"><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.StimulantsWithoutOpioids}/></svg><span>Stimulants without opioids</span></span>
            <span className="indicator-container"><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.NeitherOpioidsNorStimulants}/></svg><span>Neither opioids nor stimulants</span></span>
          </div>)}
        </div>
      </div>

      <div className="section">
        <div className="header margin">
          <h2 className="preheader-label">How many drug overdose deaths occurred each month in 2020, {stateLabel}?</h2>{stateSelector}
        </div>
        <div className="subsection">
          <div id="line-chart-container" className="chart-container" ref={monthChartRef}>
            <MonthChart 
              data={datasets.timeData[state]}
              width={getDimension(monthChartRef, 'width')}
              height={getDimension(monthChartRef, 'height')}
              header={false}
              colorScale={colorScale}
              el={monthChartRef}
              accessible={accessible}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="header margin">
          <h2 className="preheader-label">Who died of a drug overdose in 2020, {stateLabel}?<sup>h</sup></h2>{stateSelector}
        </div>
        <p>{sexMax.percent.toFixed(1)}% of people who died of a drug overdose were {sexMax.sex.toLowerCase()}, {ageMax.percent.toFixed()}% were {ageMapping[ageMax.age]} years old, and {raceMax.percent.toFixed()}% were {raceMax.race}.
        The largest percentage of males were aged {ageMapping[maleAgeMax.age]} and the largest percentage of females were aged {ageMapping[femaleAgeMax.age]}. {sexRateMax.sex}, {ageMapping[ageRateMax.age]}, and {raceMapping[raceRateMax.race] || raceRateMax.race} race had the highest overdose death rates.</p>

        {accessible ? (
          <DataTable
            data={[
              {demographic: 'Sex', spacer: true, colSpan: '3', background: true},
              ...datasets.sexData[state].map((datum, i) => (
                {demographic: `    ${datum.sex}`, deaths: datum.count, percent: datum.percent, rate: datasets.sexDataRates[state][i].rate
              })),
              {demographic: 'Race', spacer: true, colSpan: '3', background: true},
              ...datasets.raceData[state].map((datum, i) => (
                {demographic: `    ${datum.race}`, deaths: datum.deaths, percent: datum.percent, rate: datasets.raceDataRates[state][i].rate}
              )),
              {demographic: 'Age (in years)', spacer: true, colSpan: '3', background: true},
              ...datasets.ageData[state].filter(d => !!d.age).map((datum, i) => (
                {demographic: `    ${ageMapping[datum.age]}`, deaths: datum.count, percent: datum.percent, rate: datum.rate}
              )),
              {demographic: 'Age (in years) by Sex', spacer: true, colSpan: '3', background: true},
              {demographic: '    Male', spacer: true, colSpan: '3'},
              ...datasets.ageBySexData[state].Male.filter(d => !!d.age).map((datum, i) => (
                {demographic: `        ${ageMapping[datum.age]}`, deaths: datum.count, percent: datum.percent, rate: datum.rate}
              )),
              {demographic: '    Female', spacer: true, colSpan: '3'},
              ...datasets.ageBySexData[state].Female.filter(d => !!d.age).map((datum, i) => (
                {demographic: `        ${ageMapping[datum.age]}`, deaths: datum.count, percent: datum.percent, rate: datum.rate}
              ))
            ]}
            xAxisKey="demographic"
            orderedKeys={['deaths', 'percent', 'rate']}
            labelOverrides={{
              deaths: 'Number of deaths',
              percent: 'Percent of deaths',
              rate: 'Rate per 1000,000 persons*'
            }}
            suffixes={{
              percent: '%'
            }}
            customBackground={true}
          />
        ) : (
          <>
            <div id="metric-selectors">
              <strong>Metric: </strong>
              <div>
                <input 
                  id="rate-metric" 
                  name="metric" 
                  type="radio" 
                  value="rate" 
                  checked={metric === 'rate'}
                  onChange={(e) => setMetric(e.target.value)} />
                <label htmlFor="rate-metric">Rate per 100,000 persons</label>
              </div>

              <div>
                <input 
                  id="percent-metric" 
                  name="metric" 
                  type="radio" 
                  value="percent" 
                  checked={metric === 'percent'}
                  onChange={(e) => setMetric(e.target.value)} />
                <label htmlFor="percent-metric">Percent</label>
              </div>
            </div><br/>
            
            <div className="column column-left">
              <div className="subsection marked">
                <span className="individual-header smaller">By Sex</span>
                <div id="sex-chart-container" className="chart-container" ref={sexChartRef}>
                  <SexChart 
                    data={datasets.sexData[state]}
                    dataRates={datasets.sexDataRates[state]}
                    width={getDimension(sexChartRef, 'width')} 
                    height={getDimension(sexChartRef, 'height')}
                    metric={metric}
                    state={state}
                    colorScale={colorScale} 
                    el={sexChartRef}
                    accessible={accessible}
                  />
                </div>
                {metric !== 'rate' && !accessible && (<div id="sex-chart-legend">
                  <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Male} /></svg>Male</span>
                  <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Female} /></svg>Female</span>
                </div>)}
              </div>
            </div>
            <div className="column column-right">
              <div className="subsection marked">
                <span className="individual-header margin-top">By Race/Ethnicity</span>
                <div id="race-chart-container" className="chart-container" ref={raceChartRef}>
                    <RaceChart 
                      data={datasets.raceData[state]}
                      dataRates={datasets.raceDataRates[state]}
                      width={getDimension(raceChartRef, 'width')}
                      height={getDimension(raceChartRef, 'height')}
                      metric={metric}
                      state={state}
                      colorScale={colorScale}
                      el={raceChartRef}
                      accessible={accessible}
                    />
                </div>
                <p>NH: non-Hispanic</p>
              </div>
            </div>
            <div className="column column-left">
              <div className="subsection marked">
                <span className="individual-header margin-top">By Age (In Years)</span>
                <div id="age-chart-container" className="chart-container" ref={ageChartRef}>
                    <AgeChart 
                      data={datasets.ageData[state]}
                      width={getDimension(ageChartRef, 'width')}
                      height={getDimension(ageChartRef, 'height')}
                      metric={metric}
                      state={state}
                      colorScale={colorScale}
                      el={ageChartRef}
                      accessible={accessible}
                    />
                </div>
              </div>
            </div>
            <div className="column column-right">
              <div className="subsection marked">
                <span className="individual-header margin-top-small-viewport">By Age and Sex</span>
                <div id="age-by-sex-chart-container" className="chart-container" ref={ageBySexChartRef}>
                  <AgeBySexChart 
                    data={datasets.ageBySexData[state]}
                    width={getDimension(ageBySexChartRef, 'width')}
                    height={getDimension(ageBySexChartRef, 'height')}
                    metric={metric}
                    state={state}
                    colorScale={colorScale}
                    el={ageBySexChartRef}
                    accessible={accessible}
                  />
                </div>
                {!accessible && (<div className="age-chart-legend">
                  <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Male} /></svg>Male</span>
                  <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Female} /></svg>Female</span>
                </div>)}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="section opioid-section">
        <div className="header margin">
          <h2 className="preheader-label">What were the circumstances<sup>i</sup> surrounding overdose deaths, {stateLabel}?</h2>{stateSelector}
        </div>
        <span className="individual-header margin-bottom">Potential opportunities for intervention</span>
        <p>{datasets.interventionData[state].percent.toFixed(1)}% had at least one potential opportunity for intervention. {datasets.circumstancesData[state].other.find(d => d.circumstance === 'History of substance use/misuse').percent.toFixed(1)}% had a documented history of substance use or misuse.</p>
        {!accessible && (
          <div className="column column-left">
            <div className="waffle-column waffle-column-left">
              <div id="waffle-chart-container" className="chart-container" ref={waffleChartRef}>
                <WaffleChart 
                  data={datasets.interventionData[state]}
                  width={getDimension(waffleChartRef, 'width')}
                  height={getDimension(waffleChartRef, 'height')}
                  header={false}
                  accessible={accessible}
                  colorScale={colorScale}
                />
              </div>
            </div>
            <div className="waffle-column waffle-column-right">
              <span className="waffle-label font-xxl">{datasets.interventionData[state].percent.toFixed(1)}%</span><br/>
              <span className="waffle-label">of drug overdose deaths had at least one opportunity for intervention</span>
            </div>
          </div> 
        )}
        <div className="column column-right">
          <div id="intervention-chart-container" className="chart-container" ref={interventionChartRef}>
            <CircumstancesChart 
              data={datasets.circumstancesData[state]}
              atLeastOneValue={datasets.interventionData[state]}
              width={getDimension(interventionChartRef, 'width')}
              height={getDimension(interventionChartRef, 'height')}
              interventions={true}
              accessible={accessible}
              colorScale={colorScale}
            />
          </div>
        </div> 

        {!accessible && <span className="scale-note">Circumstance percentages are only among decedents with an available medical examiner or coroner report</span>}
      </div>

      <div className="section divider">
        <div className="subsection">
          <span className="individual-header margin-bottom">Additional circumstances surrounding overdose deaths</span>
          <div className="additional-circumstance-container">
            {!accessible && datasets.circumstancesData[state]['other'].map(d => (
              <div key={`circtumstance-${d.circumstance}`} className="circumstance-container">
                <div className="circumstance-icon-container" data-tip={`Deaths: ${Number(d.count).toLocaleString()}<br/>Percent: ${d.percent}%`}>
                  <span className={`fi ${icons[d.circumstance]} icon icon-fw fill-s x64`} aria-hidden="true"></span>
                </div>
                <div className="circumstance-label-container">
                  <span className="circumstance-value">{d.percent.toFixed(1)}%</span>
                  {d.circumstance}
                  {d.circumstance === 'History of substance use/misuse' && <sup>m</sup>}
                  {d.circumstance === 'Naloxone administered' && <sup>n</sup>}
                  {d.circumstance === 'Recent return to use of opioids' && <sup>o</sup>}
                  {d.circumstance === 'Experiencing homelessness' && <sup>p</sup>}
                </div>
              </div>
            ))}
            {accessible && <DataTable 
              data={datasets.circumstancesData[state]['other']}
              xAxisKey={'circumstance'}
              orderedKeys={['count', 'percent']}
              labelOverrides={{'count': 'Number of deaths', 'percent': 'Percent of deaths'}}
              suffixes={{
                'percent': '%'
              }}
            />}
          </div>
        </div>

        {!accessible && <span className="scale-note">Circumstance percentages are only among decedents with an available medical examiner or coroner report</span>}
      </div> 
      
      <Footer />

      <a onClick={(e) => e.preventDefault()} download="Non-Fatal-Overdose-Data.csv" href="#" aria-label="Download this data in a CSV file format." className="btn btn-download no-border">Download Data (CSV)</a>

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </div>
  );
}

export default App;
