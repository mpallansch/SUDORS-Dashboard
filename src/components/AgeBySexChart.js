import { useEffect, useState } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/age-by-sex.json';

import DataTable from './DataTable';
import Utils from '../shared/Utils';
import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import '../css/AgeBySexChart.css';

function AgeBySexChart(params) {

  const ageMapping = {
    '0': '< 15',
    '1': '15-24',
    '2': '25-34',
    '3': '35-44',
    '4': '45-54',
    '5': '55-64',
    '6': '65+'
  };
  
  const { width, height, metric, state, colorScale, el, accessible } = params;

  const [ animated, setAnimated ] = useState(false);

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 75, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data['male'].map(d => d[metric]), ...data['female'].map(d => d[metric]))],
    range: [ 10, halfWidth - 50 ]
  });

  const yScale = scaleBand({
    range: [ 0, adjustedHeight ],
    domain: data['male'].map(d => ageMapping[d.age]),
    padding: 0.2
  });

  const isSuppressed = (value) => {
    if(metric === 'rate' && value[metric] <= rateCutoff) return true;
    return value.count <= countCutoff ? true : false;
  };

  const suppressedValue = (value) => {
    if(metric === 'rate'){
      return value[metric] <= rateCutoff ? '*' : value[metric].toFixed(1);
    }
    return value.count <= countCutoff ? '*' : (value[metric].toFixed(1) + '%');
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
  }, [state, metric]);

  return width > 0 && (
    accessible ? (
      <>
        <br/>
        <strong className="individual-header">Male</strong>
        <DataTable
          data={data['male']}
          xAxisKey={'age'}
          orderedKeys={metric === 'rate' ? ['rate'] : ['count', 'percent']}
          labelOverrides={{...ageMapping, 'count': 'Deaths'}}
          caption={'Drug deaths by age group among males'}
        />
        <strong className="individual-header">Female</strong>
        <DataTable
          data={data['female']}
          xAxisKey={'age'}
          orderedKeys={metric === 'rate' ? ['rate'] : ['count', 'percent']}
          labelOverrides={{...ageMapping, 'count': 'Deaths'}}
          caption={'Drug deaths by age group among females'}
        />
      </>
    ) : (
      <svg
        id="age-by-sex-chart" 
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
                  {!isSuppressed(d) && (
                    <path
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `${halfWidth}px 0px`
                      }}
                      key={`bar-male-${d.age}`}
                      d={Utils.horizontalBarPath(false, halfWidth - xScale(d[metric]), yScale(ageMapping[d.age]), xScale(d[metric]), yScale.bandwidth(), 0, yScale.bandwidth() * .1)}
                      fill={colorScale.Male}
                      data-tip={`<strong>Males ${ageMapping[d.age]}</strong><br/>
                      Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : Number(d.count).toLocaleString()}<br/>
                      Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate.toFixed(1)}`}
                    ></path>
                  )}
                  {isSuppressed(d) && (
                    <>
                      <Bar 
                        x={halfWidth - 1}
                        y={yScale(ageMapping[d.age])}
                        width={1}
                        height={yScale.bandwidth()}
                        fill={colorScale.Male}
                      />
                      <Bar 
                        x={0}
                        y={yScale(ageMapping[d.age])}
                        width={halfWidth}
                        height={yScale.bandwidth()}
                        fill="transparent"
                        data-tip={`<strong>Males ${ageMapping[d.age]}</strong><br/>
                        Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : Number(d.count).toLocaleString()}<br/>
                        Rate: *Data suppressed`}
                      />
                    </>
                  )}
                  <text
                    x={halfWidth - (isSuppressed(d) ? 10 : xScale(d[metric])) - 5}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 1.5)}
                    dx={isSuppressed(d) ? '-15px' : '0'}
                    fill="black"
                    textAnchor="end">
                      {suppressedValue(d, true)}
                  </text>
                </Group>
              )
            )}
            {data['female'].map(d => (
                <Group key={`group-female-${d.age}`}>
                  {!isSuppressed(d) && (
                    <path
                      className={`animated-bar ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `${halfWidth}px 0px`
                      }}
                      key={`bar-female-${d.age}`}
                      d={Utils.horizontalBarPath(true, halfWidth, yScale(ageMapping[d.age]), xScale(d[metric]), yScale.bandwidth(), 0, yScale.bandwidth() * .1)}
                      fill={colorScale.Female}
                      data-tip={`<strong>Females ${ageMapping[d.age]}</strong><br/>
                      Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : Number(d.count).toLocaleString()}<br/>
                      Rate: ${d.rate <= rateCutoff ? rateCutoffLabel : d.rate.toFixed(1)}`}
                    ></path>
                  )}
                  {isSuppressed(d) && (
                    <>
                      <Bar 
                        x={halfWidth}
                        y={yScale(ageMapping[d.age])}
                        width={1}
                        height={yScale.bandwidth()}
                        fill={colorScale.Male}
                      />
                      <Bar 
                        x={halfWidth}
                        y={yScale(ageMapping[d.age])}
                        width={halfWidth}
                        height={yScale.bandwidth()}
                        fill="transparent"
                        data-tip={`<strong>Females ${ageMapping[d.age]}</strong><br/>*Data suppressed`}
                      />
                    </>
                  )}
                  <text
                    x={halfWidth + (isSuppressed(d) ? 10 : xScale(d[metric])) + 5}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 1.5)}
                    dx={isSuppressed(d) ? '15px' : '0'}
                    fill="black">
                      {suppressedValue(d, true)}
                  </text>
                </Group>
              )
            )}
          </Group>
      </svg>
    )
  );
}

export default AgeBySexChart;