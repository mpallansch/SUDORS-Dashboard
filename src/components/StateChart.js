import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

import Utils from '../shared/Utils';
import DataTable from './DataTable';
import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import '../css/StateChart.css';

function StateChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(false);

  const { data, dataRates, max, width, height, setState, el, state, drug, accessible, colorScale, state: globalState, toFixed } = params;

  const dataKeys = Object.keys(dataRates).filter(name => name !== 'max' && name !== 'min');

  const margin = {top: 10, bottom: 0, left: 130, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 60;
  const adjustedWidth = width - margin.left - margin.right;

  const sort = (a,b) => {
    if(dataRates[a].rate > dataRates[b].rate) return 1;
    if(dataRates[a].rate < dataRates[b].rate) return -1;
    if(dataRates[a].deaths > dataRates[b].deaths) return 1;
    if(dataRates[a].deaths < dataRates[b].deaths) return -1;
  };

  const xScale = scaleLinear({
    domain: [0, max * (width < viewportCutoff ? 1.3 : 1.1)],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataKeys.sort(sort),
    padding: 0.35
  });

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top + 50){
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
  }, [drug]);

  return width > 0 && (
    <>
      {accessible ? (
        <DataTable
          data={data}
          rates={dataRates}
          highlight={state}
          caption={'Drug deaths by state'}
          labelOverrides={{
            'deaths': 'Number of deaths',
            'rate': 'Age-adjusted rate per 100,000 persons'
          }}
        />
      ) : (
        <svg
          id="state-chart" 
          width={width} 
          height={height}>
            <Group top={margin.top} left={margin.left}>
              {dataKeys.map(d => {
                const name = d;
                const rate = dataRates[name].rate;
                const deaths = data[name].deaths;

                return (
                  <Group key={`bar-${name}`}>
                    <path 
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `0px 0px`
                      }}
                      d={Utils.horizontalBarPath(true, 0, yScale(name), rate < 0 ? 10 : xScale(rate), yScale.bandwidth(), 3, yScale.bandwidth() * .1)}
                      fill={name === 'Overall' ? 'white' : colorScale[drug]}
                      stroke={name === state ? 'rgba(255, 102, 1, 0.9)' : colorScale[drug]}
                      strokeWidth="3"
                      opacity={state === 'Overall' || name === state ? 1 : 0.4}
                      onClick={() => {
                        if(deaths){
                          if(globalState === name){
                            setState('Overall');
                          } else {
                            setState(name);
                          }
                        }
                      }}
                      data-tip={`<strong>${name}</strong><br/>
                      Deaths: ${deaths < countCutoff ? `< ${countCutoff}` : Number(deaths).toLocaleString()}<br/>
                      Age-adjusted rate: ${deaths < rateCutoff ? `*${rateCutoffLabel}` : toFixed(rate)}`}
                    ></path>
                    <text 
                      className="bar-label"
                      x={rate < 0 ? 10 : xScale(rate)}
                      y={yScale(name)}
                      dy="12"
                      dx="5">
                        {deaths < rateCutoff ? '*' : toFixed(rate)}
                    </text>
                  </Group>
                )}
              )}
              <AxisLeft 
                scale={yScale}
                tickValues={dataKeys}
              >
                {axisLeft => (
                  <g className="visx-group visx-axis visx-axis-left">
                    {axisLeft.ticks.map(tick => (
                        <g 
                          key={`tick-${tick.value}`}
                          className="visx-group visx-axis-tick">
                          <text textAnchor="end" fontSize="medium">
                            <tspan y={tick.to.y} dx="-10" dy="5">{tick.value === 'District of Columbia' ? 'DC' : tick.value}</tspan>
                          </text>
                        </g>
                      )
                    )}
                  </g>
                )}
              </AxisLeft>
              <AxisBottom
                top={adjustedHeight}
                scale={xScale}
                numTicks={width < viewportCutoff ? 4 : null}
                tickStroke="none"
                labelProps={{
                  fontSize: 'medium',
                  textAnchor: width < viewportCutoff ? 'end' : 'middle',
                  transform: 'translate(0, 40)'
                }}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'middle',
                  transform: 'translate(0, 10)'
                })}
              />
            </Group>
        </svg>
      )}
    </>
  );
}

export default StateChart;