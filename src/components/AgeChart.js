import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisLeft } from '@visx/axis';

import raw from '../data/age.json';

import { countCutoff, rateCutoff } from '../constants.json';

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
  
  const { width, height, state } = params;

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 75, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;

  const xScale = scaleLinear({
    domain: [0, Math.max(...data['male'].map(d => d.percent), ...data['female'].map(d => d.percent))],
    range: [ 0, halfWidth ]
  });

  const yScale = scaleBand({
    range: [ 0, adjustedHeight ],
    domain: data['male'].map(d => ageMapping[d.age]),
    padding: 0.2
  });

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
              textAnchor: 'start'
            })}
            left={-55}
            hideTicks
            hideAxisLine
          />
            {data['male'].map(d => (
                <Group key={`group-male-${d.age}`}>
                  <Bar 
                    className="bar"
                    key={`bar-male-${d.age}`}
                    x={halfWidth - xScale(d.percent)}
                    y={yScale(ageMapping[d.age])}
                    width={xScale(d.percent)}
                    height={yScale.bandwidth()}
                    fill="rgb(58, 88, 161)"
                    data-tip={`<strong>Males ${ageMapping[d.age]}</strong><br/>
                    Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}<br/>
                    Rate: ${d.rate <= rateCutoff ? `< ${rateCutoff}` : d.rate}`}
                  />
                  <text
                    x={halfWidth - xScale(d.percent) + (xScale(d.percent) > 35 ? 5 : -30)}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 2)}
                    fill={xScale(d.percent) > 30 ? 'white' : 'black'}>
                      {d.percent}%
                  </text>
                </Group>
              )
            )}
            {data['female'].map(d => (
                <Group key={`group-female-${d.age}`}>
                  <Bar 
                    className="bar"
                    key={`bar-female-${d.age}`}
                    x={halfWidth}
                    y={yScale(ageMapping[d.age])}
                    width={xScale(d.percent)}
                    height={yScale.bandwidth()}
                    fill="rgb(198, 209, 230)"
                    data-tip={`<strong>Females ${ageMapping[d.age]}</strong><br/>
                    Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}<br/>
                    Rate: ${d.rate <= rateCutoff ? `< ${rateCutoff}` : d.rate}`}
                  />
                  <text
                    x={halfWidth + xScale(d.percent) + (xScale(d.percent) > 35 ? -35 : 5)}
                    y={yScale(ageMapping[d.age]) + (yScale.bandwidth() / 2)}
                    fill={xScale(d.percent) > 30 ? 'white' : 'black'}>
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
