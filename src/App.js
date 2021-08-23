import { useCallback, useRef, useState } from 'react';  
import ResizeObserver from 'resize-observer-polyfill';

import CauseChart from './components/CauseChart';

import './App.css';

function App() {

  const outerContainerRef = useCallback(node => {
    if (node !== null) {
        resizeObserver.observe(node);
    }
  },[]);

  const [ causeChartState, setCauseChartState ]  = useState({width: 0, height: 0});
  const causeChartRef = useRef();

  const resizeObserver = new ResizeObserver(entries => {
    setCauseChartState({
      width: causeChartRef.current.clientWidth, 
      height: causeChartRef.current.clientHeight
    });
  })

  return (
    <div className="App" ref={outerContainerRef}>
      <div id="cause-chart-container" ref={causeChartRef}>
        <CauseChart 
          width={causeChartState.width} 
          height={causeChartState.height} />
      </div>
    </div>
  );
}

export default App;
