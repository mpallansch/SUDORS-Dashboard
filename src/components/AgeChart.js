import { useEffect, useState } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/age.json';

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
  
  const { width, height, state, colorScale, el } = params;

  const [ animated, setAnimated ] = useState(false);

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 75, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data['male'].map(d => d.percent), ...data['female'].map(d => d.percent))],
    range: [ 0, halfWidth - 30 ]
  });

  const yScale = scaleBand({
    range: [ 0, adjustedHeight ],
    domain: data['male'].map(d => ageMapping[d.age]),
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
            {data['male'].map(d => (
                <Group key={`group-male-${d.age}`}>
                  <Bar 
                    className={`animated-bar ${animated ? 'animated' : ''}`}
                    style={{
                      'transition': animated ? 'transform 1s ease-in-out' : '',
                      'transformOrigin': `${halfWidth}px 0px`
                    }}
                    key={`bar-male-${d.age}`}
                    x={halfWidth - xScale(d.percent)}
                    y={yScale(ageMapping[d.age])}
                    width={xScale(d.percent) }
                    height={yScale.bandwidth()}
                    fill={colorScale.Male}
                    data-tip={`<strong>Males ${ageMapping[d.age]}</strong><br/>
                    Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}<br/>
                    Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate}`}
                  />
                  <text
                    x={halfWidth - xScale(d.percent) - 40}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 1.5)}
                    fill={'black'}>
                      {d.percent}%
                  </text>
                </Group>
              )
            )}
            {data['female'].map(d => (
                <Group key={`group-female-${d.age}`}>
                  <Bar 
                    className={`animated-bar ${animated ? 'animated' : ''}`}
                    style={{
                      'transition': animated ? 'transform 1s ease-in-out' : '',
                      'transformOrigin': `${halfWidth}px 0px`
                    }}
                    key={`bar-female-${d.age}`}
                    x={halfWidth}
                    y={yScale(ageMapping[d.age])}
                    width={xScale(d.percent)}
                    height={yScale.bandwidth()}
                    fill={colorScale.Female}
                    data-tip={`<strong>Females ${ageMapping[d.age]}</strong><br/>
                    Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}<br/>
                    Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate}`}
                  />
                  <text
                    x={halfWidth + xScale(d.percent) + 5}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 1.5)}
                    fill={'black'}>
                      {d.percent}%
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