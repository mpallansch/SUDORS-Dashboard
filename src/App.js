import { useEffect, useCallback, useRef, useState } from 'react'; 
import ReactTooltip from 'react-tooltip'; 
import ResizeObserver from 'resize-observer-polyfill';

import Map from './components/Map';
import HeaderLineChart from './components/HeaderLineChart';
import HeaderWaffleChart from './components/HeaderWaffleChart';
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

  const [ dimensions, setDimensions ] = useState({width: 0, height: 0});
  const [ state, setState ] = useState('United States');
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

  const stateLabel = state && state !== 'United States' ? ` in ${state}` : '';

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

  return (
    <div className="App" ref={outerContainerRef}>
      <div className="section">
        <div id="header">
          <span id="preheader-label">Data Summary At a Glance</span><br/>
          <span id="header-label">How many people died of a drug overdose{stateLabel}?</span>
        </div>
        <div className="header-section">
            <span className="header-text full">
              <span className="inline-vertical-align"></span>
              <span className="enlarged">{formatDeathsNum(totalData[state])}</span> total deaths
            </span>
          </div>
          <div className="header-section middle">
            <div id="header-line-chart-container" ref={headerLineChartRef}>
              <HeaderLineChart 
                width={getDimension(headerLineChartRef, 'width')}
                height={getDimension(headerLineChartRef, 'height')}
                state={state}
              />
            </div>
            <span className="header-text">deaths over time</span>
          </div>
          <div className="header-section">
            <div id="header-waffle-chart-container" ref={headerWaffleChartRef}>
              <HeaderWaffleChart 
                width={getDimension(headerWaffleChartRef, 'width')}
                height={getDimension(headerWaffleChartRef, 'height')}
                state={state}
              />
            </div>
            <span className="header-text">{interventionData[state]}% had opportunities for intervention</span>
          </div>
        <div id="map-container" ref={mapRef}>
          <Map 
            width={getDimension(mapRef, 'width')} 
            height={getDimension(mapRef, 'height')}
            setState={setState}
            state={state} />
        </div>
      </div>
      <div className="section">
        <span className="subheader">Who died of a drug overdose{stateLabel}?</span>
        <div className="column column-left">
          <span className="subheader smaller">By Sex</span>
          <div className="subsection">
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
        </div>
        <div className="column column-right">
          <span className="subheader smaller margin-top-small-viewport">By Age</span>
          <div className="subsection">
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
        </div>
        <span className="subheader smaller margin-top">By Race/Ethnicity</span>
        <div className="subsection">
          <div id="race-chart-container" ref={raceChartRef}>
              <RaceChart 
                width={getDimension(raceChartRef, 'width')}
                height={getDimension(raceChartRef, 'height')}
                state={state}
                el={raceChartRef}
              />
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">What drugs were identified{stateLabel}?</span>
        <div className="subsection">
          <div className="chart-legend">
            <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>% with drug present</span>
            <span><svg className="indicator" viewBox="0 0 100 100"><line x1="0" y1="50" x2="100" y2="50" stroke="rgb(58, 88, 161)" strokeDasharray="40 20" strokeWidth="40" /></svg>% with drug listed as cause of death</span>
          </div>
          <div id="cause-chart-container" ref={causeChartRef}>
            <CauseChart 
                width={getDimension(causeChartRef, 'width')}
                height={getDimension(causeChartRef, 'height')}
              state={state} />
          </div>
        </div>
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
            <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(76, 140, 126)" /></svg>Meth</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(150, 160, 185)" /></svg>Heroin</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(132, 178, 170)" /></svg>Rx Opioids</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(108, 56, 111)" /></svg>IMFs</div>
            <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(113, 129, 167)" /></svg>Cocaine</div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="column column-left">
          <span className="subheader">How does my state compare?*</span>
          <div className="subsection">
            <div id="state-chart-container" ref={stateChartRef}>
              <StateChart
                width={getDimension(stateChartRef, 'width')}
                height={getDimension(stateChartRef, 'height')}
                state={state} />
            </div>
          </div>
        </div>
        <div className="column column-right">
          <span className="subheader">What are the opportunities for intervention{stateLabel}?*</span>
          <div className="subsection">
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
