import { useCallback, useRef, useState } from 'react';  
import ResizeObserver from 'resize-observer-polyfill';

import Map from './components/Map';
import HeaderChart from './components/HeaderChart';
import SexChart from './components/SexChart';
import AgeChart from './components/AgeChart';
import RaceChart from './components/RaceChart';
import StateChart from './components/StateChart';
import HomeChart from './components/HomeChart';
import CauseChart from './components/CauseChart';
import CircumstancesChart from './components/CircumstancesChart';
import AdditionalDrugChart from './components/AdditionalDrugChart';

import './App.css';
import { element } from 'prop-types';

function App() {

  const initialDimensions = {width: 0, height: 0};

  const [ state, setState ] = useState('United States');
  const [ mapState, setMapState ]  = useState(initialDimensions);
  const [ headerChartState, setHeaderChartState ]  = useState(initialDimensions);
  const [ sexChartState, setSexChartState ]  = useState(initialDimensions);
  const [ ageChartState, setAgeChartState ]  = useState(initialDimensions);
  const [ raceChartState, setRaceChartState ]  = useState(initialDimensions);
  const [ stateChartState, setStateChartState ]  = useState(initialDimensions);
  const [ causeChartState, setCauseChartState ]  = useState(initialDimensions);
  const [ additionalDrugChartState, setAdditionalDrugChartState ]  = useState(initialDimensions);
  const [ homeChartState, setHomeChartState ]  = useState(initialDimensions);
  const [ circumstancesChartState, setCircumstancesChartState ]  = useState(initialDimensions);
  const mapRef = useRef();
  const headerChartRef = useRef();
  const sexChartRef = useRef();
  const ageChartRef = useRef();
  const raceChartRef = useRef();
  const stateChartRef = useRef();
  const causeChartRef = useRef();
  const additionalDrugChartRef = useRef();
  const homeChartRef = useRef();
  const circumstancesChartRef = useRef();

  const setDimensions = (stateFunc, elementRef) => {
    stateFunc({
      width: elementRef.current.clientWidth,
      height: elementRef.current.clientHeight
    });
  };

  const resizeObserver = new ResizeObserver(entries => {
    setDimensions(setMapState, mapRef);
    setDimensions(setHeaderChartState, headerChartRef);
    setDimensions(setSexChartState, sexChartRef);
    setDimensions(setAgeChartState, ageChartRef);
    setDimensions(setRaceChartState, raceChartRef);
    setDimensions(setStateChartState, stateChartRef);
    setDimensions(setCauseChartState, causeChartRef);
    setDimensions(setAdditionalDrugChartState, additionalDrugChartRef);
    setDimensions(setHomeChartState, homeChartRef);
    setDimensions(setCircumstancesChartState, circumstancesChartRef);
  });

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
        resizeObserver.observe(node);
    } // eslint-disable-next-line
  },[]);

  return (
    <div className="App" ref={outerContainerRef}>
      <div className="section">
        <h2>How many people died of a drug overdose?</h2>
        <div id="header-chart-container" ref={headerChartRef}>
          <HeaderChart 
            width={headerChartState.width}
            height={headerChartState.height}
          />
        </div>
        <div id="map-container" ref={mapRef}>
          <Map 
            width={mapState.width} 
            height={mapState.height}
            setState={setState} />
        </div>
      </div>
      <div className="section">
        <h2>Who died of a drug overdose?</h2>
        <div className="column">
          <h3>By Sex</h3>
          <div id="sex-chart-container" ref={sexChartRef}>
            <SexChart 
              width={sexChartState.width} 
              height={sexChartState.height}
              state={state}
            />
          </div>
        </div>
        <div className="column">
          <h3>By Age</h3>
          <div id="age-chart-container" ref={ageChartRef}>
            <AgeChart 
              width={ageChartState.width} 
              height={ageChartState.height}
              state={state}
            />
          </div>
        </div>
        <h3>By Race/Ethnicity</h3>
        <div id="race-chart-container" ref={raceChartRef}>
            <RaceChart 
              width={raceChartState.width} 
              height={raceChartState.height}
              state={state}
            />
          </div>
      </div>

      <div className="section">
        <h2 className="chart-header">What drugs were identified?</h2>
        <div className="chart-legend">
          <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>% with drug present</span>
          <span><svg className="indicator" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="rgb(58, 88, 161)"></circle><line x1="0" x2="100" y1="50" y2="50" strokeWidth="25" stroke="rgb(58, 88, 161)"/></svg>% with drug listed as cause of death</span>
        </div>
        <div id="cause-chart-container" ref={causeChartRef}>
          <CauseChart 
            width={causeChartState.width} 
            height={causeChartState.height}
            state={state} />
        </div>
        <h3 className="chart-header">Additional drug classes detected</h3>
        <div id="additional-drug-chart-container" ref={additionalDrugChartRef}>
          <AdditionalDrugChart 
            width={additionalDrugChartState.width} 
            height={additionalDrugChartState.height}
            state={state} />
        </div>
        <div className="chart-legend side text-align-left">
          <br/><br/><strong>Drug Detected</strong><br/><br/>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(30, 23, 103)" /></svg>Benzos</div>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(113, 129, 167)" /></svg>Meth</div>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(150, 160, 185)" /></svg>Rx Opioids</div>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(108, 56, 111)" /></svg>IMFs</div>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(76, 140, 126)" /></svg>Heroin</div>
          <div><svg className="indicator"><rect width="100%" height="100%" fill="rgb(132, 178, 170)" /></svg>Cocaine</div>
        </div>
      </div>
      <div className="section">
        <div className="column">
          <div id="state-chart-container" ref={stateChartRef}>
            <StateChart
              width={stateChartState.width} 
              height={stateChartState.height}
              state={state} />
          </div>
        </div>
        <div className="column">
          <h2>What are the opportunities for intervention?*</h2>
          <div id="home-chart-container" ref={homeChartRef}>
            <HomeChart
              width={homeChartState.width} 
              height={homeChartState.height}
              state={state} />
          </div>
          <div id="circumstances-chart-container" ref={circumstancesChartRef}>
            <CircumstancesChart
              width={circumstancesChartState.width} 
              height={circumstancesChartState.height}
              state={state} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
