import { useCallback, useRef, useState } from 'react';  
import ResizeObserver from 'resize-observer-polyfill';

import Map from './components/Map';
import HomeChart from './components/HomeChart';
import CauseChart from './components/CauseChart';
import CircumstancesChart from './components/CircumstancesChart';
import AdditionalDrugChart from './components/AdditionalDrugChart';

import './App.css';

function App() {

  const resizeObserver = new ResizeObserver(entries => {
    setCauseChartState({
      width: causeChartRef.current.clientWidth, 
      height: causeChartRef.current.clientHeight
    });
    setAdditionalDrugChartState({
      width: additionalDrugChartRef.current.clientWidth, 
      height: additionalDrugChartRef.current.clientHeight
    });
    setHomeChartState({
      width: homeChartRef.current.clientWidth, 
      height: homeChartRef.current.clientHeight
    });
    setCircumstancesChartState({
      width: circumstancesChartRef.current.clientWidth, 
      height: circumstancesChartRef.current.clientHeight
    });
  });

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
        resizeObserver.observe(node);
    } // eslint-disable-next-line
  },[]);

  const [ causeChartState, setCauseChartState ]  = useState({width: 0, height: 0});
  const [ additionalDrugChartState, setAdditionalDrugChartState ]  = useState({width: 0, height: 0});
  const [ homeChartState, setHomeChartState ]  = useState({width: 0, height: 0});
  const [ circumstancesChartState, setCircumstancesChartState ]  = useState({width: 0, height: 0});
  const causeChartRef = useRef();
  const additionalDrugChartRef = useRef();
  const homeChartRef = useRef();
  const circumstancesChartRef = useRef();

  return (
    <div className="App" ref={outerContainerRef}>
      <div>
        <Map></Map>
      </div>
      <div className="column">

      </div>
      <div className="column">
        <div>
          <h2 className="chart-header">What drugs<sup>1</sup> were identified?</h2>
          <div className="chart-legend">
            <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>% with drug present</span>
            <span><svg className="indicator" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="rgb(58, 88, 161)"></circle><line x1="0" x2="100" y1="50" y2="50" strokeWidth="25" stroke="rgb(58, 88, 161)"/></svg>% with drug listed as cause of death</span>
          </div>
          <div id="cause-chart-container" ref={causeChartRef}>
            <CauseChart 
              width={causeChartState.width} 
              height={causeChartState.height} />
          </div>
        </div>
        <div>
          <h2 className="chart-header">Additional drug classes detected among drug overdose deaths by COD drug<sup>2</sup></h2>
          <div id="additional-drug-chart-container" ref={additionalDrugChartRef}>
            <AdditionalDrugChart 
              width={additionalDrugChartState.width} 
              height={additionalDrugChartState.height} />
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
      </div>
      <div className="column">
        <h2>What circumstances<sup>4</sup> were documented?</h2>
        <div id="home-chart-container" ref={homeChartRef}>
          <HomeChart
            width={homeChartState.width} 
            height={homeChartState.height} />
        </div>
        <div id="circumstances-chart-container" ref={circumstancesChartRef}>
          <CircumstancesChart
            width={circumstancesChartState.width} 
            height={circumstancesChartState.height} />
        </div>
      </div>
    </div>
  );
}

export default App;
