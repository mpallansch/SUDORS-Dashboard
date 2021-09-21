import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/race.json';
import rawRates from '../data/age-adjusted-race-rates.json';

import { rateCutoff, countCutoff } from '../constants.json';

import '../css/RaceChart.css';

function RaceChart(params) {

  const [ sort, setSort ] = useState('Descending');
  const [ sortClass, setSortClass ] = useState('fadein-initial');
  
  const { width, height, state } = params;

  const data = raw[state];
  const dataRates = rawRates[state];

  const margin = {top: 10, bottom: 10, left: 160, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 60;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleLinear({
    domain: [0, Math.max(...dataRates.map(d => d.rate))],
    range: [ 0, adjustedWidth ]
  });
  
  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataRates.sort((a,b) => (a.rate > b.rate) ? 1 : -1).map(d => d.race),
    padding: 0.2
  });
  
  const yScaleReverse = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataRates.sort((a,b) => (a.rate < b.rate) ? 1 : -1).map(d => d.race),
    padding: 0.2
  });

  const yScaleAlphabetical = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataRates.sort((a,b) => (a.race < b.race) ? 1 : -1).map(d => d.race),
    padding: 0.2
  });

  const sortMapping = {
    'Descending': yScale,
    'Ascending': yScaleReverse,
    'Alphabetical': yScaleAlphabetical
  };

  const selectChange = (e) => {
    setSortClass('');
    setSort(e.target.value);
  };

  useEffect(() => {
    setTimeout(() => {
      setSortClass('fadein');
    }, 10);
  }, [sort]);

  return width > 0 && (
    <>
      <select onChange={selectChange}>
        <option>Descending</option>
        <option>Ascending</option>
        <option>Alphabetical</option>
      </select>
      <svg
        id="race-chart" 
        width={width} 
        height={height}>
          <Group top={margin.top} left={margin.left}>
            {dataRates.map(d => {
              let datum;
              for(let i = 0; i < data.length; i++){
                if(data[i].race === d.race){
                  datum = data[i];
                  break;
                }
              }

              return (
                <Bar 
                  className="bar"
                  style={{
                    'transition': 'transform 1s ease-in-out',
                    'transform': `translate(0px, ${sort !== 'Descending' ? sortMapping[sort](d.race) - yScale(d.race) : 0}px)`
                  }}
                  key={`bar-${d.race}`}
                  x={0}
                  y={yScale(d.race)}
                  width={xScale(d.rate)}
                  height={yScale.bandwidth()}
                  fill="rgb(198, 209, 230)"
                  data-tip={`<strong>${d.race}</strong><br/>
                  Deaths: ${datum.value <= countCutoff ? `< ${countCutoff}` : datum.value}<br/>
                  Rate: ${d.rate <= rateCutoff ? `< ${rateCutoff}` : d.rate}`}
                />
              )}
            )}
            <AxisLeft 
              scale={yScale}
            >
              {axisLeft => (
                <g className="visx-group visx-axis visx-axis-left">
                  {axisLeft.ticks.map(tick => (
                      <g 
                        key={`tick-${tick.value}`}
                        className="visx-group visx-axis-tick"
                        style={{
                          'transition': 'transform 1s ease-in-out',
                          'transform': `translate(0px, ${sort !== 'Descending' ? sortMapping[sort](tick.value) - yScale(tick.value) : 0}px)`
                        }}>
                        <text textAnchor="end" fontSize="medium">
                          <tspan y={tick.to.y} dx="-10">{tick.value}</tspan>
                        </text>
                      </g>
                    )
                  )}
                </g>
              )}
            </AxisLeft>
          </Group>
      </svg>
    </>
  );
}

export default RaceChart;
