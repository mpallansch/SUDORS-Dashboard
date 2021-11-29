import { useEffect, useCallback, useRef, useState } from 'react'; 
import ReactTooltip from 'react-tooltip'; 
import ResizeObserver from 'resize-observer-polyfill';

import WaffleChart from './components/WaffleChart';
import SexChart from './components/SexChart';
import AgeChart from './components/AgeChart';
import RaceChart from './components/RaceChart';
import StateChart from './components/StateChart';
import CauseChart from './components/CauseChart';
import OpioidStimulantChart from './components/OpioidStimulantChart';
import DrugCombinationChart from './components/DrugCombinationChart';
import MonthChart from './components/MonthChart';
import CircumstancesChart from './components/CircumstancesChart';

import interventionData from './data/interventions.json';
import totalData from './data/totals.json';

import './App.css';

function App() {

  const viewportCutoffSmall = 550;
  const viewportCutoffMedium = 800;

  const [ dimensions, setDimensions ] = useState({width: 0, height: 0});
  const [ state, setState ] = useState('Overall');
  const [ drug, setDrug ] = useState('All');
  const headerMonthChartRef = useRef();
  const headerWaffleChartRef = useRef();
  const sexChartRef = useRef();
  const ageChartRef = useRef();
  const raceChartRef = useRef();
  const stateChartRef = useRef();
  const causeChartRef = useRef();
  const opioidStimulantChartRef = useRef();
  const drugCombinationChartRef = useRef();
  const circumstancesChartRef = useRef();
  const monthChartRef = useRef();
  const waffleChartRef = useRef();

  const colorScale = {
    Male: 'rgb(58, 88, 161)',
    Female: '#88c3ea',
    Primary: 'rgb(58, 88, 161)',
    Secondary: '#88c3ea'
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

  const stateLabel = <span> {state === 'Overall' ? '' : 'in'} <span className="italics">{state}</span></span>;
  const stateLabelOf = <span> of <span className="italics">{state}</span></span>;

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
        <div id="header">
          <span id="preheader-label">Data Summary {stateLabelOf} At a Glance</span>
        </div>
        <div className="header-section">
          <span className="header-text full">
            <span className="enlarged">{formatDeathsNum(totalData[state])}</span> 
            <span>total deaths</span>
          </span>
        </div>
        <div className="header-section middle" onClick={() => {monthChartRef.current.scrollIntoView({behavior: 'smooth', block: 'center'})}}>
          <div id="header-line-chart-container" ref={headerMonthChartRef}>
            <MonthChart 
                width={getDimension(headerMonthChartRef, 'width')}
                height={getDimension(headerMonthChartRef, 'height')}
                header={true}
                state={state} 
                colorScale={colorScale}
                el={monthChartRef}
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
        <div id="state-chart-container" ref={stateChartRef}>
          <StateChart
            width={getDimension(stateChartRef, 'width')}
            height={getDimension(stateChartRef, 'height')}
            setState={setState}
            state={state}
            drug={drug} />
        </div>
      </div>

      <div className="section">
        <span className="subheader">What drugs were identified{stateLabel}?</span>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
        <div className="subsection">
          <div id="cause-chart-container" ref={causeChartRef}>
            <CauseChart 
                width={getDimension(causeChartRef, 'width')}
                height={getDimension(causeChartRef, 'height')}
              state={state} />
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">Title {stateLabel}?</span>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
        <div className="subsection no-padding">
          <div id="drug-combination-chart-container" ref={drugCombinationChartRef}>
            <DrugCombinationChart 
                width={getDimension(drugCombinationChartRef, 'width')}
                height={getDimension(drugCombinationChartRef, 'height')}
              state={state} />
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">Title {stateLabel}?</span>
        <div className="subsection">
          <div id="opioid-stimulant-chart-container" ref={opioidStimulantChartRef}>
            <OpioidStimulantChart 
                width={getDimension(opioidStimulantChartRef, 'width')}
                height={getDimension(opioidStimulantChartRef, 'height')}
              state={state} />
          </div>
          <div id="opioid-stimulant-chart-legend">
            <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(58, 88, 161)"/></svg>Opioids with stimulants</span>
            <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(116,148,194)"/></svg>Opioids without stimulants</span>
            <span><svg className="indicator"><rect width="100%" height="100%" fill="#88c3ea"/></svg>Stimulants without opioids</span>
            <span><svg className="indicator"><rect width="100%" height="100%" fill="rgb(220,237,201)"/></svg>Neither opioids nor stimulants</span>
          </div>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam fermentum, nulla luctus pharetra vulputate, felis tellus mollis orci, sed rhoncus sapien nunc eget odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>

      <div className="section">
        <span className="subheader">Drug overdose deaths{stateLabel}</span>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
        <div className="column column-left">
          <div className="subsection marked">
            <span className="individual-header smaller">By Sex</span>
            <div id="sex-chart-container" ref={sexChartRef}>
              <SexChart 
                width={getDimension(sexChartRef, 'width')} 
                height={getDimension(sexChartRef, 'height')}
                state={state}
                colorScale={colorScale} 
                el={sexChartRef}
              />
            </div>
            <div id="sex-chart-legend">
              <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Male} /></svg>Male</span>
              <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Female} /></svg>Female</span>
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
                colorScale={colorScale}
                el={ageChartRef}
              />
            </div>
            <div id="age-chart-legend">
              <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Male} /></svg>Male</span>
              <span><svg className="indicator"><rect width="100%" height="100%" fill={colorScale.Female} /></svg>Female</span>
            </div>
          </div>
        </div>
        <div className="subsection marked">
          <span className="individual-header margin-top">By Race/Ethnicity</span>
          <div id="race-chart-container" ref={raceChartRef}>
              <RaceChart 
                width={getDimension(raceChartRef, 'width')}
                height={getDimension(raceChartRef, 'height')}
                state={state}
                colorScale={colorScale}
                el={raceChartRef}
              />
          </div>
          Age-adjusted rate of deaths per 100,000
        </div>
      </div>

      <div className="section">
        <span className="subheader">Title {stateLabel}?</span>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
        <div className="subsection">
          <div id="line-chart-container" ref={monthChartRef}>
            <MonthChart 
              width={getDimension(monthChartRef, 'width')}
              height={getDimension(monthChartRef, 'height')}
              header={false}
              state={state} 
              colorScale={colorScale}
              el={monthChartRef}
            />
          </div>
        </div>
      </div>

      <div className="section">
        <span className="subheader">What are the opportunities for for intervention{stateLabel}?</span>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean euismod bibendum laoreet. Proin gravida dolor sit amet lacus accumsan et viverra justo commodo. Proin sodales pulvinar tempor. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.</p>
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
