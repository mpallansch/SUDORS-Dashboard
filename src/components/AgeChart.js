import { useEffect, useState } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/age.json';

import Utils from '../shared/Utils';
import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import '../css/AgeChart.css';

function AgeChart(params) {

  const ageMapping = {
    '0': '0-14',
    '1': '15-24',
    '2': '25-34',
    '3': '35-44',
    '4': '45-54',
    '5': '55-64',
    '6': '65+'
  };
  
  const { width, height, metric, state, colorScale, el } = params;

  const [ animated, setAnimated ] = useState(false);

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 75, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d[metric]))],
    range: [ 10, adjustedWidth - 30 ]
  });

  const yScale = scaleBand({
    range: [ 0, adjustedHeight ],
    domain: data.map(d => ageMapping[d.age]),
    padding: 0.2
  });

  const isSuppressed = (value) => {
    if(metric === 'rate' && value <= rateCutoff) return true;
    return false;
  };

  const suppressedValue = (value) => {
    if(metric === 'rate' && value <= rateCutoff) return '*';
    return value.toFixed(1);
  }

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
  }, [state]);

  return width > 0 && (
    <>
      <svg
        id="age-chart" 
        width={width} 
        height={height}>
          <Group top={margin.top} left={margin.left}>
            <AxisLeft
              scale={yScale}
              tickLabelProps={() => ({
                fontSize: 'medium',
                textAnchor: 'start',
                verticalAnchor: 'middle'
              })}
              left={-65}
              hideTicks
              hideAxisLine
            />
            {data.map(d => (
                <Group key={`group-${d.age}`}>
                  {!isSuppressed(d[metric]) && (
                    <path 
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': '0px 0px'
                      }}
                      key={`bar-female-${d.age}`}
                      d={Utils.horizontalBarPath(true, 0, yScale(ageMapping[d.age]), xScale(d[metric]), yScale.bandwidth(), 0, 15)}
                      fill={colorScale.Female}
                      data-tip={`<strong>${ageMapping[d.age]}</strong><br/>
                      Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}<br/>
                      Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate.toFixed(1)}`}
                    ></path>
                  )}
                  <text
                    x={xScale(d[metric]) + 5}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 1.5)}
                    dx={isSuppressed(d[metric]) ? '15px' : '0'}
                    fill="black">
                      {suppressedValue(d[metric])}{metric === 'rate' ? '' : '%'}
                  </text>
                </Group>
              )
            )}
          </Group>
      </svg>
    </>
  );
}

export default AgeChart;