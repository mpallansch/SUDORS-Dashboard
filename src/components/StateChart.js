import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import '../css/StateChart.css';

function StateChart(params) {
  
  const data = [
    {state: 'Georgia', value: 71},
    {state: 'Florida', value: 21},
    {state: 'Texas', value: 4},
    {state: 'California', value: 1}
  ];

  const [ sort, setSort ] = useState('Descending');
  const [ sortClass, setSortClass ] = useState('fadein-initial');
  
  const { width, height } = params;

  const margin = {top: 10, bottom: 10, left: 75, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom - 60;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.value))],
    range: [ 0, adjustedWidth ]
  });
  
  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data.sort((a,b) => (a.value > b.value) ? 1 : -1).map(d => d.state),
    padding: 0.2
  });
  
  const yScaleReverse = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data.sort((a,b) => (a.value < b.value) ? 1 : -1).map(d => d.state),
    padding: 0.2
  });

  const yScaleAlphabetical = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data.sort((a,b) => (a.state < b.state) ? 1 : -1).map(d => d.state),
    padding: 0.2
  });

  const sortMapping = {
    'Descending': yScale,
    'Ascending': yScaleReverse,
    'Alphabetical': yScaleAlphabetical
  };

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
        <option>Alphabetical</option>
      </select>
      <svg
        id="state-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}>
          <Group top={margin.top} left={margin.left}>
            {data.map(d => (
              <Bar 
                className="bar"
                style={{
                  'transition': 'transform 1s ease-in-out',
                  'transform': `translate(0px, ${sort !== 'Descending' ? sortMapping[sort](d.state) - yScale(d.state) : 0}px)`
                }}
                key={`bar-${d.state}`}
                x={0}
                y={yScale(d.state)}
                width={xScale(d.value)}
                height={yScale.bandwidth()}
                fill="rgb(198, 209, 230)"
              />
            ))}
            <AxisLeft 
              scale={yScale}
            >
              {axisLeft => (
                <g className="visx-group visx-axis visx-axis-left">
                  {axisLeft.ticks.map(tick => (
                      <g 
                        key={`tick-${tick.value}`}
                        className="visx-group visx-axis-tick"
                        style={{
                          'transition': 'transform 1s ease-in-out',
                          'transform': `translate(0px, ${sort !== 'Descending' ? sortMapping[sort](tick.value) - yScale(tick.value) : 0}px)`
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
          </Group>
      </svg>
    </>
  );
}

export default StateChart;