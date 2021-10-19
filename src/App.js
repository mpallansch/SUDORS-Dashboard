import { useEffect, useCallback, useRef, useState } from 'react'; 
import ReactTooltip from 'react-tooltip'; 
import ResizeObserver from 'resize-observer-polyfill';

import Map from './components/Map';
import LineChart from './components/LineChart';
import WaffleChart from './components/WaffleChart';
import SexChart from './components/SexChart';
import AgeChart from './components/AgeChart';
import RaceChart from './components/RaceChart';
import StateChart from './components/StateChart';
import CauseChart from './components/CauseChart';
import CircumstancesChart from './components/CircumstancesChart';
import AdditionalDrugChart from './components/AdditionalDrugChart';

import interventionData from './data/interventions.json';
import totalData from './data/totals.json';

import './App.css';

function App() {

  const viewportCutoffSmall = 550;
  const viewportCutoffMedium = 800;

  const [ dimensions, setDimensions ] = useState({width: 0, height: 0});
  const [ state, setState ] = useState('United States');
  const [ drug, setDrug ] = useState('All');
  const [ view, setView ] = useState('map');
  const mapRef = useRef();
  const headerLineChartRef = useRef();
  const headerWaffleChartRef = useRef();
  const sexChartRef = useRef();
  const ageChartRef = useRef();
  const raceChartRef = useRef();
  const stateChartRef = useRef();
  const causeChartRef = useRef();
  const additionalDrugChartRef = useRef();
  const circumstancesChartRef = useRef();
  const lineChartRef = useRef();
  const waffleChartRef = useRef();

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

  const stateLabel = <span> in {state === 'United States' ? 'the ' : ''}<span className="italics">{state}</span></span>;
  const stateLabelOf = <span> of {state === 'United States' ? 'the ' : ''}<span className="italics">{state}</span></span>;

  const getDimension = (ref, dimension) => {
    if(!ref.current){
      return 0;
    }

    return dimension === 'width' ? ref.current.clientWidth : ref.current.clientHeight
  }

  const formatDeathsNum = (num) => {
    if(num < 10) {
      return '< ' + 10;
    } else if(num < 1000) {
      return num;
    } else {
      return Math.floor(num / 1000) + 'k';
    }
  };

  const drugTab = (drugName, drugLabel) => (
    <button 
      className={`drug-tab${drugName === drug ? ' active' : ''}`}
      onClick={() => {setDrug(drugName)}}
    >{drugLabel || drugName}</button> 
  );

  return (
    <div className={`App${dimensions.width < viewportCutoffSmall ? ' small-vp' : ''}${dimensions.width < viewportCutoffMedium ? ' medium-vp' : ''}`} 
      ref={outerContainerRef}>
      <div className="section">
        <span>View data for:</span>
        <select value={state} onChange={(e) => setState(e.target.value)}>
          {Object.keys(totalData).sort((a, b) => {
            if(a === 'United States'){
              return -1;
            } else if (b === 'United States'){
              return 1;
            } else {
              return a < b ? -1 : 1;
            }
          }).map(state => (
            <option key={`dropdown-option-${state}`}>{state}</option>
          ))}
        </select>
        <div id="header">
          <span id="preheader-label">Data Summary {stateLabelOf} At a Glance</span>
        </div>
        <div className="header-section">
          <span className="header-text full">
            <span className="inline-vertical-align"></span>
            <span className="enlarged">{formatDeathsNum(totalData[state])}</span> total deaths
          </span>
        </div>
        <div className="header-section middle" onClick={() => {lineChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
          <div id="header-line-chart-container" ref={headerLineChartRef}>
            <LineChart 
              width={getDimension(headerLineChartRef, 'width')}
              height={getDimension(headerLineChartRef, 'height')}
              header={true}
              state={state}
            />
          </div>
          <span className="header-text">deaths over time</span>
        </div>
        <div className="header-section" onClick={() => {circumstancesChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
          <div id="header-waffle-chart-container" ref={headerWaffleChartRef}>
            <WaffleChart 
              width={getDimension(headerWaffleChartRef, 'width')}
              height={getDimension(headerWaffleChartRef, 'height')}
              header={true}
              state={state}
            />
          </div>
          <span className="header-text">{interventionData[state]}% had opportunities for intervention</span>
        </div>
        <span className="subheader">Number and rate of deaths by state and drug or drug type{stateLabel}?</span>
        {dimensions.width > viewportCutoffSmall && (<div className="compare-buttons">
          Select view type: 
          <input type="radio" name="view-radio" id="map-view-button" checked={view === 'map'} onChange={() => {setView('map')}} />
          <label htmlFor="map-view-button">Map</label>
          <input type="radio" name="view-radio" id="chart-view-button" checked={view === 'chart'} onChange={() => {setView('chart')}} />
          <label htmlFor="chart-view-button">Chart</label>
        </div>)}
        <div>
          <div className="drug-tab-section">
            {drugTab('All', 'All Substances')}
            {drugTab('Heroin')}
          </div>
          <div className="drug-tab-section">
            {drugTab('IMFs')}
            {drugTab('Cocaine')}
          </div>
          <div className="drug-tab-section">
            {drugTab('Rx Opioids')}
            {drugTab('Meth')}
          </div>
        </div>
        {dimensions.width > viewportCutoffSmall && view === 'map' ? (
          <div id="map-container" ref={mapRef}>
            <Map 
              width={getDimension(mapRef, 'width')} 
              height={getDimension(mapRef, 'height')}
              setState={setState}
              state={state}
              drug={drug} />
          </div>
        ) : (
          <div id="state-chart-container" ref={stateChartRef}>
            <StateChart
              width={getDimension(stateChartRef, 'width')}
              height={getDimension(stateChartRef, 'height')}
              state={state}
              drug={drug} />
          </div>
        )}
      </div>

      <div className="section">
        <span className="subheader">Drug overdose deaths{stateLabel}</span>
        <div className="column column-left">
          <div className="subsection marked">
            <span className="individual-header smaller">By Sex</span>
            <div id="sex-chart-container" ref={sexChartRef}>
              <SexChart 
                width={getDimension(sexChartRef, 'width')} 
                height={getDimension(sexChartRef, 'height')}
                state={state}
              />
            </div>
            <div id="sex-chart-legend">
              <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(58, 88, 161)" /></svg>Male</span>
              <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>Female</span>
            </div>
          </div>
          <div className="subsection marked">
            <span className="individual-header">By Month</span>
            <div id="line-chart-container" ref={lineChartRef}>
              <LineChart 
                width={getDimension(lineChartRef, 'width')}
                height={getDimension(lineChartRef, 'height')}
                header={false}
                state={state}
              />
            </div>
          </div>
        </div>
        <div className="column column-right">
          <div className="subsection marked">
            <span className="individual-header margin-top-small-viewport">By Age and Sex</span>
            <div id="age-chart-container" ref={ageChartRef}>
              <AgeChart 
                width={getDimension(ageChartRef, 'width')}
                height={getDimension(ageChartRef, 'height')}
                state={state}
                el={ageChartRef}
              />
            </div>
            <div id="age-chart-legend">
              <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(58, 88, 161)" /></svg>Male</span>
              <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>Female</span>
            </div>
          </div>
          <div className="subsection marked">
            <span className="individual-header margin-top">By Race/Ethnicity</span>
            <div id="race-chart-container" ref={raceChartRef}>
                <RaceChart 
                  width={getDimension(raceChartRef, 'width')}
                  height={getDimension(raceChartRef, 'height')}
                  state={state}
                  el={raceChartRef}
                />
            </div>
            Age-adjusted rate of deaths per 100,000
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">What drugs were identified{stateLabel}?</span>
        <div className="subsection">
          <div id="cause-chart-container" ref={causeChartRef}>
            <CauseChart 
                width={getDimension(causeChartRef, 'width')}
                height={getDimension(causeChartRef, 'height')}
              state={state} />
          </div>
        </div>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <span className="subheader margin-top">Additional drug classes detected</span>
        <div className="subsection">
          <div id="additional-drug-chart-container" ref={additionalDrugChartRef}>
            <AdditionalDrugChart 
                width={getDimension(additionalDrugChartRef, 'width')}
                height={getDimension(additionalDrugChartRef, 'height')}
              state={state} />
          </div>
          <div className="chart-legend side text-align-left">
            <strong>Drug Detected</strong>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="#4b830d" /></svg>Meth</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="#fbab18" /></svg>Heroin</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="#007c91" /></svg>Rx Opioids</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="#bb4d00" /></svg>IMFs</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="#00695c" /></svg>Cocaine</div>
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">What are the opportunities for for intervention{stateLabel}?</span>
        <div className="column column-left">
          <div className="subsection">
            <div id="waffle-chart-container" ref={waffleChartRef}>
              <WaffleChart 
                width={getDimension(waffleChartRef, 'width')}
                height={getDimension(waffleChartRef, 'height')}
                header={false}
                state={state}
              />
            </div>
          </div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="column column-right">
          <div className="subsection">
            <span className="individual-header">Opportunities for Intervention</span>
            <div id="circumstances-chart-container" ref={circumstancesChartRef}>
              <CircumstancesChart
                width={getDimension(circumstancesChartRef, 'width')}
                height={getDimension(circumstancesChartRef, 'height')}
                state={state} />
            </div>
          </div> 
        </div> 
      </div>

      <ReactTooltip html={true} type="light" arrowColor="rgba(0,0,0,0)" className="tooltip"/>
    </div>
  );
}

export default App;
