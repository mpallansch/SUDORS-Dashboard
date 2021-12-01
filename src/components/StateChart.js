import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';

import dataRaw from '../data/map.json';
import dataRatesRaw from '../data/age-adjusted-drug-rates.json';

import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import '../css/StateChart.css';

function StateChart(params) {

  const viewportCutoff = 600;

  const { width, setState, height, state, drug, state: globalState } = params;

  const data = dataRaw[drug];
  const dataRates = dataRatesRaw[drug];
  const dataKeys = Object.keys(dataRates).filter(name => name !== 'max' && name !== 'min');

  const margin = {top: 10, bottom: 10, left: 130, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 60;
  const adjustedWidth = width - margin.left - margin.right;

  const colors = {
    'All': 'rgb(58, 88, 161)',
    'Methamphetamine': 'rgb(75, 131, 13)',
    'Heroin': 'rgb(251, 171, 24)',
    'Prescription opioids': 'rgb(0, 124, 145)',
    'Cocaine': 'rgb(0, 105, 92)',
    'Illicitly manufactured fentanyls': 'rgb(187, 77, 0)'
  };

  const sort = (a,b) => (dataRates[a].rate > dataRates[b].rate ? 1 : -1);

  const xScale = scaleLinear({
    domain: [0, Math.max(...dataKeys.map(d => dataRates[d].rate)) * (width < viewportCutoff ? 1.3 : 1.1)],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: dataKeys.sort(sort),
    padding: 0.35
  });

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
              const deaths = data[name].deaths;

              return (
                <Group key={`bar-${name}`}>
                  <Bar 
                    className="bar"
                    x={0}
                    y={yScale(name)}
                    width={rate < 0 ? 10 : xScale(rate)}
                    height={yScale.bandwidth()}
                    fill={name === 'Overall' ? 'white' : colors[drug]}
                    stroke={name === state ? 'rgba(255, 102, 1, 0.9)' : colors[drug]}
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
                    Deaths: ${deaths < countCutoff ? `< ${countCutoff}` : deaths}<br/>
                    Rate: ${rate <= rateCutoff ? rateCutoffLabel : rate.toFixed(1)}`}
                  />
                  <text 
                    className="bar-label"
                    opacity={state === 'Overall' || name === state ? 1 : 0.2}
                    x={rate < 0 ? 10 : xScale(rate)}
                    y={yScale(name)}
                    dy="15"
                    dx="5">
                      {rate <= rateCutoff ? rateCutoffLabel : rate.toFixed(1)}
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