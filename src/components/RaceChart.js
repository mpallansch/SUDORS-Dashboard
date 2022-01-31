import { useState, useEffect } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/race.json';
import rawRates from '../data/age-adjusted-race-rates.json';

import DataTable from './DataTable';
import Utils from '../shared/Utils';
import { rateCutoff, rateCutoffLabel, countCutoff } from '../constants.json';

import '../css/RaceChart.css';

function RaceChart(params) {
  
  const { width, height, metric, state, colorScale, el, accessible} = params;

  const [ animated, setAnimated ] = useState(false);

  const raceLabels = {
    'AI/AN, non-Hispanic': 'American Indian/Alaska Native, non-Hispanic',
    'A/PI, non-Hispanic': 'Asian/Pacific Islander, non-Hispanic'
  };

  const data = raw[state];
  const dataRates = rawRates[state];
  const currentData = metric === 'rate' ? dataRates : data;
  const otherData = metric === 'rate' ? data : dataRates;

  const margin = {top: 10, bottom: 10, left: 160, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const isSuppressed = (value) => {
    if(metric === 'rate' && value[metric] <= rateCutoff) return true;
    return value.deaths < countCutoff ? true : false;
  };

  const getData = (datum, label) => {
    if(metric === 'rate'){
      if(datum.rate <= rateCutoff) return label === true ? '*' : 0;
      return (label === true ? datum.rate.toFixed(1) : datum.rate);
    }
    if(datum.deaths < countCutoff) return label === true ? '*' : 0
    return (label === true ? `${datum.percent.toFixed(1)}%` : datum.percent);
  };

  const xScale = scaleLinear({
    domain: [ 0, Math.max(...(currentData).map(getData))],
    range: [ 20, adjustedWidth - 45 ]
  });
  
  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: currentData.sort((a,b) => {
      if(a.race === 'Hispanic') {
        return -1;
      } else if(b.race === 'Hispanic'){
        return 1;
      }
      return (a.race < b.race) ? 1 : -1;
    }).map(d => d.race),
    padding: 0.2
  });

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().bottom - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if(animated) {
      setAnimated(false);
      setTimeout(() => {
        setAnimated(true);
      }, 50);
    } // eslint-disable-next-line
  }, [state, metric]);

  return width > 0 && (
    accessible ? (
      <DataTable
        data={metric === 'rate' ? dataRates : data}
        cutoffData={metric === 'rate' ? data : undefined}
        cutoffKey="deaths"
        xAxisKey={'race'}
        caption={'Drug deaths by race'}
      />
    ) : (
      <svg
        id="race-chart" 
        width={width} 
        height={height}>
          <Group top={margin.top} left={margin.left}>
            {currentData.map(d => {
              let datum;
              for(let i = 0; i < otherData.length; i++){
                if(otherData[i].race === d.race){
                  datum = otherData[i];
                  break;
                }
              }

              return (
                <Group key={`bar-container-${d.race}`}>
                  { // render data bar
                  !isSuppressed(d) && (
                    <path 
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : ''
                      }}
                      key={`bar-${d.race}`}
                      d={Utils.horizontalBarPath(true, 0, yScale(d.race), xScale(getData(d)), yScale.bandwidth(), 0, yScale.bandwidth() * .1)}
                      fill={colorScale.Race}
                      data-tip={`<strong>${raceLabels[d.race] || d.race}</strong><br/>
                      Deaths: ${(d.deaths || datum.deaths) < countCutoff ? `< ${countCutoff}` : Number(d.deaths || datum.deaths).toLocaleString()}<br/>
                      Rate: ${(d.rate || datum.rate) <= rateCutoff ? rateCutoffLabel : (d.rate || datum.rate).toFixed(1)}`}
                    ></path>
                  )}
                  { // render suppressed bar
                  isSuppressed(d) && (
                    <>
                      <Bar
                        className={`animated-bar ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : ''
                        }}
                        key={`bar-${d.race}`}
                        x={0}
                        y={yScale(d.race)}
                        width={1}
                        height={yScale.bandwidth()}
                        fill="black"
                      />
                      <Bar
                        key={`bar-hover-${d.race}`}
                        x={0}
                        y={yScale(d.race)}
                        width={40}
                        height={yScale.bandwidth()}
                        fill="transparent"
                        data-tip={`<strong>${raceLabels[d.race] || d.race}</strong><br/>
                        Deaths: ${(d.deaths || datum.deaths) < countCutoff ? `< ${countCutoff}` : Number(d.deaths || datum.deaths).toLocaleString()}<br/>
                        Rate: *Data suppressed`}
                      />
                    </>
                  )}
                  <text
                    key={`bar-label-${d.race}`}
                    x={xScale(getData(d)) + 25}
                    y={yScale(d.race) + (yScale.bandwidth() / 1.75)}
                    textAnchor={'start'}
                    dx={-18}
                  >{getData(d, true)}</text>
                </Group>
              )}
            )}
            <AxisLeft 
              scale={yScale}
            >
              {axisLeft => (
                <g className="visx-group visx-axis visx-axis-left" style={{'paddingTop':'20'}}>
                  {axisLeft.ticks.map(tick => (
                      <g 
                        key={`tick-${tick.value}`}
                        className="visx-group visx-axis-tick">
                        <text key={`tick-label-${tick.value}`} textAnchor="end" fontSize="medium">
                          <tspan y={tick.to.y + 4} dx="-10">{tick.value}</tspan>
                        </text>
                      </g>
                    )
                  )}
                </g>
              )}
            </AxisLeft>
          </Group>
      </svg>
    )
  );
}

export default RaceChart;
