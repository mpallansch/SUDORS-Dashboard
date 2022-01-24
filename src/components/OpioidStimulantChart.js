import { useState, useEffect } from 'react';
import { BarStackHorizontal } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

import raw from '../data/opioid-stimulant.json';

import { countCutoff } from '../constants.json';

import DataTable from './DataTable';
import '../css/OpioidStimulantChart.css';

function OpioidStimulantChart(params) {

  const viewportCutoff = 800;

  const [ animated, setAnimated ] = useState(false);

  const { width, height, state, el, accessible, colorScale } = params;
  const data = raw[state].horizontalBarData;
  const keys = Object.keys(data[0]).filter(key => key.indexOf('Percent') !== -1);
  const margin = {top: 10, bottom: 40, left: 20, right: width < viewportCutoff ? 60 : 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, 100],
    range: [0, adjustedWidth]
  });

  const yScale = scaleBand({
    domain: [1,1],
    range: [1,1]
  });

  const keyedColorScale = scaleOrdinal({
    domain: keys,
    range: [colorScale.OpioidsWithStimulants, colorScale.OpioidsWithoutStimulants, colorScale.StimulantsWithoutOpioids, colorScale.NeitherOpioidsNorStimulants]
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

  return width > 0 && (
    <>
      <div id="opioid-stimulant-chart">
        {accessible ? (
          <DataTable
            data={['o', 'os', 's', 'n'].map(key => ({
              deaths: data[0][`${key}Count`],
              percent: data[0][`${key}Percent`],
              name: data[0][`${key}Name`]
            }))}
            xAxisKey={'name'}
            labelOverrides={{'name': ' '}}
            caption={'Opioid and stimulant breakdown in overdose deaths'}
          />
        ) : (
          <svg width={width} height={height}>
            <Group top={margin.top} left={margin.left}>
              <BarStackHorizontal
                data={data}
                keys={keys}
                yScale={yScale}
                xScale={xScale}
                color={keyedColorScale}
                y={() => 1}>
                {barStacks =>
                  barStacks.map(barStack =>
                    barStack.bars.map(bar => {
                      const name = bar.bar.data[bar.key.replace('Percent', 'Name')];
                      const rawCount = bar.bar.data[bar.key.replace('Percent', 'Count')];
                      const rawPercent = bar.bar.data[bar.key];
                      const percent = rawPercent.toFixed(1);
                      const cornerRadius = adjustedHeight * .35;
                      const xEnd = bar.x + bar.width;
                      const yEnd = bar.y + adjustedHeight;

                      let count;
                      if(rawCount <= countCutoff){
                        count = '< ' + countCutoff;
                      } else {
                        count = rawCount;
                      }

                      return (
                        <Group key={`barstack-horizontal-${barStack.index}-${bar.index}`}>
                          <path 
                            className={`animated-bar ${animated ? 'animated' : ''}`}
                            style={{
                              'transition': animated ? 'transform 1s ease-in-out' : '',
                              'transformOrigin': `${adjustedWidth / 2}px 0px`
                            }}
                            d={barStack.index === 0 ? 
                              `M${bar.x + cornerRadius} ${bar.y}
                                L${xEnd} ${bar.y}
                                L${xEnd} ${yEnd}
                                L${bar.x + cornerRadius} ${yEnd}
                                C${bar.x} ${yEnd}, ${bar.x} ${yEnd}, ${bar.x} ${yEnd - cornerRadius}
                                L${bar.x} ${bar.y + cornerRadius}
                                C${bar.x} ${bar.y}, ${bar.x} ${bar.y}, ${bar.x + cornerRadius} ${bar.y}` : 
                            (barStack.index === (barStacks.length - 1) ? 
                              `M${bar.x} ${bar.y}
                                L${xEnd - cornerRadius} ${bar.y}
                                C${xEnd} ${bar.y}, ${xEnd} ${bar.y}, ${xEnd} ${bar.y + cornerRadius}
                                L${xEnd} ${yEnd - cornerRadius}
                                C${xEnd} ${yEnd}, ${xEnd} ${yEnd}, ${xEnd - cornerRadius} ${yEnd}
                                L${bar.x} ${yEnd}
                                L${bar.x} ${bar.y}` : 
                              `M${bar.x} ${bar.y} 
                                L${xEnd} ${bar.y} 
                                L${xEnd} ${yEnd}
                                L${bar.x} ${yEnd}
                                L${bar.x} ${bar.y}`)
                            }
                            fill={bar.color}
                            data-tip={`${name}<br/>
                            Count: ${count}<br/>
                            Percent: ${percent}%`}
                          />
                          {bar.width > 50 && (
                            <text
                              x={bar.x + (bar.width / 2)}
                              y={bar.y + (adjustedHeight / 2) + 5}
                              textAnchor="middle"
                              fill={bar.key === 'nPercent' ? 'black' : 'white'}
                            >{percent}%</text>
                          )}
                        </Group>
                    )}),
                  )
                }
              </BarStackHorizontal>
              <AxisBottom
                top={adjustedHeight + 10}
                scale={xScale}
                tickStroke="none"
                tickValues={[0, 50, 100]}
                tickFormat={val => val + '%'}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'middle',
                  transform: 'translate(0, 10)'
                })}
              />
            </Group>
          </svg>
        )}
      </div>
    </>
  );
}

export default OpioidStimulantChart;