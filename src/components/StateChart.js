import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

import data from '../data/state.json';
import dataRatesRaw from '../data/age-adjusted-drug-rates.json';

import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import abbreviations from '../geo/abbreviations.json';

import '../css/StateChart.css';

function StateChart(params) {

  const viewportCutoff = 600;

  const { width, setState, height, state, drug, state: globalState } = params;

  const dataRates = dataRatesRaw[drug];
  const dataKeys = Object.keys(dataRates).filter(name => name !== 'United States' &&  name !== 'max' && name !== 'min');

  const margin = {top: 10, bottom: 10, left: 130, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 60;
  const adjustedWidth = width - margin.left - margin.right;

  const colors = {
    'All': 'rgb(198, 209, 230)',
    'Meth': 'rgb(75, 131, 13)',
    'Heroin': 'rgb(251, 171, 24)',
    'Rx Opioids': 'rgb(0, 124, 145)',
    'Cocaine': 'rgb(0, 105, 92)',
    'IMFs': 'rgb(187, 77, 0)'
  };

  const sortPrioritize = (stateName) => {
    return (a,b) => {
      if(state !== 'United States'){
        if(a === stateName){
          return 1;
        }
        if(b === stateName){
          return -1;
        }
      }
      return (dataRates[a].rate > dataRates[b].rate) ? 1 : -1;
    }
  }

  const xScale = scaleLinear({
    domain: [0, Math.max(...dataKeys.map(d => dataRates[d].rate)) * (width < viewportCutoff ? 1.3 : 1.1)],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataKeys.sort(sortPrioritize()),
    padding: 0.2
  });

  let scales = {};
  Object.keys(abbreviations).forEach(abbrev => {
    scales[abbreviations[abbrev]] = scaleBand({
      range: [ adjustedHeight, 0 ],
      domain: dataKeys.sort(sortPrioritize(abbreviations[abbrev])),
      padding: 0.2
    });
  });

  scales['United States'] = yScale;

  return width > 0 && (
    <>
      <svg
        id="state-chart" 
        width={width} 
        height={height}>
          <Group top={margin.top} left={margin.left}>
            {dataKeys.map(d => {
              const name = d;
              const rate = dataRates[name].rate;
              d = dataRates[d];

              let datum;
              for(let i = 0; i < data.length; i++){
                if(data[i].state === name){
                  datum = data[i];
                  break;
                }
              }

              return (
                <>
                  <Bar 
                    className="bar"
                    style={{
                      'transform': `translate(0px, ${scales[state](name) - yScale(name)}px)`
                    }}
                    key={`bar-${name}`}
                    x={0}
                    y={yScale(name)}
                    width={rate < 0 ? 10 : xScale(rate)}
                    height={yScale.bandwidth()}
                    fill={colors[drug]}
                    stroke={name === state ? 'rgb(58, 88, 161)' : 'none'}
                    strokeWidth="3"
                    onClick={() => {
                      if(datum){
                        if(globalState === name){
                          setState('United States');
                        } else {
                          setState(name);
                        }
                      }
                    }}
                    data-tip={`<strong>${name}</strong><br/>
                    Deaths: ${datum.value < countCutoff ? `< ${countCutoff}` : datum.value}<br/>
                    Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate.toFixed(1)}`}
                  />
                  <text 
                    style={{
                      'transform': `translate(0px, ${scales[state](name) - yScale(name)}px)`
                    }}
                    x={rate < 0 ? 10 : xScale(rate)}
                    y={yScale(name)}
                    dy="15"
                    dx="5">
                      {d.rate <= rateCutoff ? rateCutoffLabel : d.rate.toFixed(1)}
                  </text>
                </>
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
                        className="visx-group visx-axis-tick"
                        style={{
                          'transition': 'transform 1s ease-in-out',
                          'transform': `translate(0px, ${scales[state](tick.value) - yScale(tick.value)}px)`
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
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
              label={width < viewportCutoff ?  'Deaths per 100,000' : 'Age-adjusted Rate of Deaths per 100,000'}
              numTicks={width < viewportCutoff ? 4 : null}
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
    </>
  );
}

export default StateChart;