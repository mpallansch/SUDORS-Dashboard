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
  
  const { width, height, state, el } = params;

  const [ animated, setAnimated ] = useState(false);

  const data = raw[state];
  const dataRates = rawRates[state];

  const margin = {top: 10, bottom: 10, left: 160, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
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

  const onScroll = () => {
    if(!animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().bottom - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50);
  }, []);

  useEffect(() => {
    if(animated) {
      setAnimated(false);
      setTimeout(() => {
        setAnimated(true);
      }, 50);
    }
  }, [state]);

  return width > 0 && (
    <>
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
                  className={`animated-bar ${animated ? 'animated' : ''}`}
                  style={{
                    'transition': animated ? 'transform 1s ease-in-out' : ''
                  }}
                  key={`bar-${d.race}`}
                  x={0}
                  y={yScale(d.race)}
                  width={xScale(d.rate)}
                  height={yScale.bandwidth()}
                  fill="rgb(198, 209, 230)"
                  data-tip={`<strong>${d.race}</strong><br/>
                  Deaths: ${datum.deaths <= countCutoff ? `< ${countCutoff}` : datum.deaths}<br/>
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
                        className="visx-group visx-axis-tick">
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
