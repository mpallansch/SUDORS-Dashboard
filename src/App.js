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

import interventionData from './data/interventions.json';
import circumstancesData from './data/circumstances.json';
import totalData from './data/totals.json';
import combinationData from './data/drug-combination.json';
import causeData from './data/causes.json';
import additionalDrugData from './data/additional-drugs.json';
import opioidStimulantData from './data/opioid-stimulant.json';
import sexData from './data/sex.json';
import ageData from './data/age.json';
import raceData from './data/race.json';
import ageBySexData from './data/age-by-sex.json';

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

  const colorScale = {
    'Male': 'rgb(109, 32, 75)',
    'Female': 'rgb(167, 49, 114)',
    'Race': 'rgb(143, 79, 43)',
    'RaceAccent': 'rgb(224, 122, 58)',
    'Month': 'rgb(109, 108, 55)',
    'Intervention': 'rgb(164, 163, 73)',
    'OpioidsWithStimulants': 'rgb(128, 157, 167)',
    'OpioidsWithoutStimulants': 'rgb(91, 102, 106)',
    'StimulantsWithoutOpioids': 'rgb(86, 120, 135)',
    'NeitherOpioidsNorStimulants': 'rgb(167, 218, 240)',
    'All': 'rgb(50, 93, 125)',
    'Any Opioids': '#002061',
    'Opioid': '#002061',
    'Methamphetamine': '#ac86d5',
    'Heroin': '#2E75B8',
    'Prescription opioids': '#B4C9E9',
    'Any Stimulant': '#301946',
    'Stimulant': '#301946',
    'Cocaine': '#582f82',
    'Illicitly manufactured fentanyls': '#2F5598'
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

  const drugs = ['Illicitly manufactured fentanyls', 'Heroin', 'Prescription opioids', 'Cocaine', 'Methamphetamine'];

  const icons = {
    'History of substance use/misuse': 'cdc-icon-clipboard-list-light',
    'Naloxone administered': 'cdc-icon-first-aid-light',
    'Current pain treatment': 'cdc-icon-medical_04',
    'Experiencing homelessness': 'cdc-icon-home-lg-light', //'cdc-icon-store-alt-slash-light',
    'Recent return to use of opioids': 'cdc-icon-sync-alt-light icon'
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

  const multipleCombo = combinationData[state].combinations.filter(combo => ((combo.deaths > countCutoff && combo.drugCombination.match(/1/g)) || []).length > 1);
  const sexMax = [...sexData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const ageMax = [...ageData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const raceMax = [...raceData[state]].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const maleAgeMax = [...ageBySexData[state].male].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];
  const femaleAgeMax = [...ageBySexData[state].female].sort((a,b) => a.percent < b.percent ? 1 : -1)[0];

  const stateSelector = (
    <select aria-label="View data by state" value={state} onChange={(e) => setState(e.target.value)}>
      {Object.keys(totalData).sort((a, b) => {
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
            <p>{Number(totalData[state]).toLocaleString()} total deaths in 2020</p>
            <div id="header-line-chart-container" className="chart-container" ref={headerMonthChartRef}>
              <MonthChart 
                width={getDimension(headerMonthChartRef, 'width')}
                height={getDimension(headerMonthChartRef, 'height')}
                header={true}
                state={state} 
                colorScale={colorScale}
                el={monthChartRef}
                accessible={accessible}
              />
            </div>
            <p>{interventionData[state]}% had at least one potential opportunity for intervention</p>
          </>
        ) : (
          <div className="header-sections-container">
            <div className="header-section first">
              <span className="header-text full">
                <span className="enlarged">{Number(totalData[state]).toLocaleString()}</span> 
                <span className="header-text">total deaths in 2020</span>
              </span>
            </div>
            <div className="header-section middle" onClick={() => {monthChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
              <div id="header-line-chart-container" className="chart-container" ref={headerMonthChartRef}>
                <MonthChart 
                    width={getDimension(headerMonthChartRef, 'width')}
                    height={getDimension(headerMonthChartRef, 'height')}
                    header={true}
                    state={state} 
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
                  width={getDimension(headerWaffleChartRef, 'width')}
                  height={getDimension(headerWaffleChartRef, 'height')}
                  header={true}
                  state={state}
                />
              </div>
              <span className="header-text"><strong>{interventionData[state]}%</strong> had at least one potential opportunity for intervention</span>
            </div>
          </div>
        )}
        <div className="header margin">
          <h2 className="preheader-label">What drugs were involved in overdose deaths in 2020, {stateLabel}?</h2>{stateSelector}
        </div>
        <h3 className="subheader">Rate of overdose deaths by state and drug or drug class</h3>
        <div>
          <div className="drug-tab-section">
            {drugTab('All', 'All Drugs')}
            {drugTab('Opioid', 'Any Opioid')}
          </div>
          <div className="drug-tab-section">
            {drugTab('Illicitly manufactured fentanyls', dimensions.width < viewportCutoffSmall ? 'IMFs' : 'Illicitly manufactured fentanyls')}
            {drugTab('Heroin')}
          </div>
          <div className="drug-tab-section">
            {drugTab('Prescription opioids')}
            {drugTab('Stimulant', 'Any Stimulant')}
          </div>
          <div className="drug-tab-section">
            {drugTab('Cocaine')}
            {drugTab('Methamphetamine', dimensions.width < viewportCutoffSmall ? 'Meth' : 'Methamphetamine')}
          </div>
        </div>
        <div id="state-chart-container" className="chart-container" ref={stateChartRef}>
          <StateChart
            width={getDimension(stateChartRef, 'width')}
            height={getDimension(stateChartRef, 'height')}
            setState={setState}
            state={state}
            el={stateChartRef}
            drug={drug}
            accessible={accessible}
            colorScale={colorScale} />
        </div>
        {!accessible && <p className="scale-note"><sup>†</sup> Scale of the chart may change based on the data presented</p>}
      </div>

      <div className="section divider">
        <h3 className="subheader">Percentages of overdose deaths involving select drugs and drug classes, {stateLabel}</h3>
        <p>{causeData[state].find(d => d.opioid === 'Any Opioids').causePercent.toFixed(1)}% of deaths involved at least one opioid and {causeData[state].find(d => d.opioid === 'Any Stimulant').causePercent.toFixed(1)}% involved at least one stimulant. {additionalDrugData[state].commonOpioid} {additionalDrugData[state].commonOpioid === 'Heroin' ? 'was' : 'were'} the most commonly involved opioids. The most common stimulant involved in overdose deaths was {additionalDrugData[state].commonStimulant.toLowerCase()}.</p>
        <div className="subsection">
          <div id="cause-chart-container" className="chart-container" ref={causeChartRef}>
            <CauseChart 
              width={getDimension(causeChartRef, 'width')}
              height={getDimension(causeChartRef, 'height')}
              state={state}
              el={causeChartRef}
              accessible={accessible}
              colorScale={colorScale} />
          </div>
        </div>
      </div>

      <div className="section divider">
        <h3 className="subheader">Percentages of overdose deaths involving the most common opioids and stimulants alone or in combination, {stateLabel}</h3>
        <p>The five most frequently occurring opioid and stimulant combinations accounted for {combinationData[state].total.toFixed(1)}% of overdose deaths. 
          {multipleCombo.length > 0 ? 
            ` For example, ${multipleCombo[0].percent.toFixed(1)}% involved ${listDrugs(multipleCombo[0].drugCombination)}` :
            ` ${combinationData[state].combinations[0].percent.toFixed(1)}% of deaths involved ${listDrugs(combinationData[state].combinations[0].drugCombination)}, one of the most common ${combinationData[state].combinations[0].drugCombination.charAt(3) === '1' || combinationData[state].combinations[0].drugCombination.charAt(4) === '1' ? 'stimulants' : 'opioids'}`}.</p>
        <div className="subsection no-padding">
          <div id="drug-combination-chart-container" className="chart-container" ref={drugCombinationChartRef}>
            <DrugCombinationChart 
              width={getDimension(drugCombinationChartRef, 'width')}
              height={getDimension(drugCombinationChartRef, 'height')}
              state={state}
              el={drugCombinationChartRef}
              accessible={accessible}
              colorScale={colorScale} />
          </div>
        </div>
      </div>

      <div className="section divider">
        <h3 className="subheader">Distribution of overdose deaths by opioid and stimulant involvement, {stateLabel}</h3>
        <p>The largest percentage of deaths involved {opioidStimulantData[state].max.toLowerCase()}, while {opioidStimulantData[state].minPercent.toFixed(1)}% of overdose deaths involved {opioidStimulantData[state].min.toLowerCase()}.</p>
        <div className="subsection">
          <div id="opioid-stimulant-chart-container" className="chart-container" ref={opioidStimulantChartRef}>
            <OpioidStimulantChart 
                width={getDimension(opioidStimulantChartRef, 'width')}
                height={getDimension(opioidStimulantChartRef, 'height')}
                state={state}
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
              width={getDimension(monthChartRef, 'width')}
              height={getDimension(monthChartRef, 'height')}
              header={false}
              state={state} 
              colorScale={colorScale}
              el={monthChartRef}
              accessible={accessible}
            />
          </div>
          {!accessible && <p className="scale-note"><sup>†</sup> Scale of the chart may change based on the data presented</p>}
        </div>
      </div>

      <div className="section">
        <div className="header margin">
          <h2 className="preheader-label">Who died of a drug overdose in 2020, {stateLabel}?</h2>{stateSelector}
        </div>
        <p>{sexMax.percent.toFixed(1)}% of people who died of a drug overdose were {sexMax.sex.toLowerCase()}, {ageMax.percent.toFixed()}% were {ageMapping[ageMax.age]} years old, and {raceMax.percent.toFixed()}% were {raceMax.race}.
        The largest percentage of males were aged {ageMapping[maleAgeMax.age]} and the largest percentage of females were aged {ageMapping[femaleAgeMax.age]}.</p>

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
                  width={getDimension(raceChartRef, 'width')}
                  height={getDimension(raceChartRef, 'height')}
                  metric={metric}
                  state={state}
                  colorScale={colorScale}
                  el={raceChartRef}
                  accessible={accessible}
                />
            </div>
          </div>
        </div>
        <div className="column column-left">
          <div className="subsection marked">
            <span className="individual-header margin-top">By Age (In Years)</span>
            <div id="age-chart-container" className="chart-container" ref={ageChartRef}>
                <AgeChart 
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
      </div>

      <div className="section opioid-section">
        <div className="header margin">
          <h2 className="preheader-label">What were the circumstances<sup>††</sup> surrounding overdose deaths, {stateLabel}?</h2>{stateSelector}
        </div>
        <span className="individual-header margin-bottom">Potential opportunities for intervention</span>
        <p>{interventionData[state].toFixed(1)}% had at least one potential opportunity for intervention. {circumstancesData[state].other.find(d => d.circumstance === 'History of substance use/misuse').percent.toFixed(1)}% had a documented history of substance use or misuse.</p>
        {!accessible && (
          <div className="column column-left">
            <div className="waffle-column waffle-column-left">
              <div id="waffle-chart-container" className="chart-container" ref={waffleChartRef}>
                <WaffleChart 
                  width={getDimension(waffleChartRef, 'width')}
                  height={getDimension(waffleChartRef, 'height')}
                  state={state}
                  header={false}
                  accessible={accessible}
                  colorScale={colorScale}
                />
              </div>
            </div>
            <div className="waffle-column waffle-column-right">
              <span className="waffle-label font-xxl">{interventionData[state].toFixed(1)}%</span><br/>
              <span className="waffle-label">of drug overdoses had at least one opportunity for intervention</span>
            </div>
          </div> 
        )}
        <div className="column column-right">
          <div id="intervention-chart-container" className="chart-container" ref={interventionChartRef}>
            <CircumstancesChart 
              width={getDimension(interventionChartRef, 'width')}
              height={getDimension(interventionChartRef, 'height')}
              state={state}
              interventions={true}
              accessible={accessible}
              colorScale={colorScale}
            />
          </div>
        </div> 

        <span class="scale-note"><sup>††</sup>Circumstance percentages are only among decedents with an available medical examiner or coroner report</span>
      </div>

      <div className="section divider">
        <div className="subsection">
          <span className="individual-header margin-bottom">Additional circumstances surrounding overdose deaths</span>
          <div className="additional-circumstance-container">
            {!accessible && circumstancesData[state]['other'].map(d => (
              <p className="circumstance-container">
                <div className="circumstance-icon-container">
                  <span className={`fi ${icons[d.circumstance]} icon icon-fw fill-s x64`} aria-hidden="true"></span>
                </div>
                <div className="circumstance-label-container">
                  <span className="circumstance-value">{d.percent.toFixed(1)}%</span>
                  {d.circumstance}
                </div>
              </p>
            ))}
            {accessible && <DataTable 
              data={circumstancesData[state]['other']}
              xAxisKey={'circumstance'}
              orderedKeys={['count', 'percent']}
              labelOverrides={{'count': 'Deaths'}}
            />}
          </div>
        </div>

        <span class="scale-note"><sup>††</sup>Circumstance percentages are only among decedents with an available medical examiner or coroner report</span>
      </div>

      <Footer />

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </div>
  );
}

export default App;
