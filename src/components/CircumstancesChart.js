import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/circumstances.json';

import { countCutoff } from '../constants.json';

import '../css/CircumstancesChart.css';

function CircumstancesChart(params) {

  const { width, height, state, interventions } = params;
  const metric = interventions ? 'intervention' : 'other';
  const data = raw[state];
  const margin = {top: 10, bottom: 10, left: 0, right: 0, bar: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const barThickness = 6;
  const barThicknessHalf = barThickness / 2;

  const xScale = scaleLinear({
    domain: [0, 100],
    range: [ 0, adjustedWidth ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data[metric].sort((a, b) => a.percent > b.percent ? 1 : -1).map(d => d.circumstance),
    padding: 0.2
  });

  return width > 0 && (
    <>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          {data[metric].map(d => (
              <Group key={`group-${d.circumstance}`}>
                <Bar 
                  key={`bar-${d.circumstance}`}
                  x={0}
                  y={yScale(d.circumstance)}
                  width={xScale(d.percent)}
                  height={barThickness}
                  fill="rgb(198, 209, 230)"
                  data-tip={`<strong>${d.circumstance}</strong><br/>
                  Deaths: ${d.count <= countCutoff ? `< ${countCutoff}` : d.count}`}
                />
                <Circle
                  key={`point-${d.circumstance}`}
                  r={7}
                  cx={xScale(d.percent)}
                  cy={yScale(d.circumstance) + barThicknessHalf}
                  fill="rgb(58, 88, 161)"
                />
                <text x={(xScale(d.percent) || 0) + 10} y={yScale(d.circumstance) + barThickness + 2} fontWeight="bold" fontSize="medium" fill="rgb(58, 88, 161)">{d.percent.toFixed(1)}%</text>
                <Text width={adjustedWidth} x={0}  y={yScale(d.circumstance) + barThickness + margin.bar} verticalAnchor="start">{d.circumstance}</Text>
              </Group>
            )
          )}
        </Group>
      </svg>
    </>
  );
}

export default CircumstancesChart;
