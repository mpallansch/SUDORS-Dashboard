import { useState, useEffect } from 'react';
import { Bar, Circle, LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { curveLinear } from '@visx/curve';

import raw from '../data/causes.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const [ sort, setSort ] = useState('');
  const [ sortClass, setSortClass ] = useState('fadein-initial');

  const { width, height, state } = params;
  const data = raw[state];
  const margin = {top: 20, bottom: 70, left: 70, right: 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    range: [ 0, adjustedWidth ],
    domain: data.map(d => d.opioid),
    padding: 0.2
  });
  
  const xScaleReverse = scaleBand({
    range: [ adjustedWidth, 0 ],
    domain: data.map(d => d.opioid),
    padding: 0.2
  });

  const xOffset = xScale.bandwidth() / 2;

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [ adjustedHeight, 0 ]
  });

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
      </select>
      <div id="cause-chart">
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <AxisLeft
              scale={yScale}
              tickValues={[0, 25, 50, 75, 100]}
              tickFormat={num => num + '%'}
              tickLabelProps={() => ({
                fontSize: 'medium',
                textAnchor: 'end',
                transform: 'translate(-10, 5)'
              })}
              tickTransform={`translate(${adjustedWidth}, 0)`}
              tickStroke="lightgray"
              tickLength={adjustedWidth}
              hideAxisLine
            />
            {data.map(d => (
                <Group key={`group-${d.opioid}`}>
                  <Bar 
                    className="bar"
                    style={{
                      'transition': 'transform 1s ease-in-out',
                      'transform': `translate(${sort === 'Ascending' ? xScaleReverse(d.opioid) - xScale(d.opioid) : 0}px)`
                    }}
                    key={`bar-${d.opioid}`}
                    x={xScale(d.opioid)}
                    y={yScale(d.present)}
                    width={xScale.bandwidth()}
                    height={adjustedHeight - yScale(d.present)}
                    fill="rgb(198, 209, 230)"
                  />
                  <Circle
                    className="point fadein"
                    style={{
                      'transition': 'transform 1s ease-in-out',
                      'transform': `translate(${sort === 'Ascending' ? xScaleReverse(d.opioid) - xScale(d.opioid) : 0}px)`
                    }}
                    key={`point-${d.opioid}`}
                    r={5}
                    cx={xScale(d.opioid) + xOffset}
                    cy={yScale(d.cause)}
                    fill="rgb(58, 88, 161)"
                  />
                </Group>
              )
            )}
            <LinePath
              className={`line ${sortClass}`}
              curve={curveLinear}
              data={data}
              x={d => (sort === 'Ascending' ? xScaleReverse(d.opioid) : xScale(d.opioid)) + xOffset}
              y={d => yScale(d.cause)}
              stroke="rgb(58, 88, 161)"
              strokeWidth={3}
            />
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
            >
              {axisBottom => (
                <g className="visx-group visx-axis visx-axis-bottom">
                  {axisBottom.ticks.map(tick => (
                      <g 
                        key={`tick-${tick.value}`}
                        className="visx-group visx-axis-tick"
                        style={{
                          'transition': 'transform 1s ease-in-out',
                          'transform': `translate(${sort === 'Ascending' ? xScaleReverse(tick.value) - xScale(tick.value) : 0}px)`
                        }}>
                        <svg x="0" y="0" fontSize="medium">
                          <text textAnchor="middle">
                            <tspan x={tick.to.x} dy="1.5em">{tick.value}</tspan>
                          </text>
                        </svg>
                      </g>
                    )
                  )}
                </g>
              )}
            </AxisBottom>
          </Group>
        </svg>
      </div>
    </>
  );
}

export default CauseChart;
