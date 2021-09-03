import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';

import data from '../data/circumstances.json';

import '../css/CircumstancesChart.css';

function CircumstancesChart(params) {

  const { width, height } = params;
  const margin = {top: 10, bottom: 10, left: 30, right: 10, bar: 20};
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
    domain: data.other.sort((a, b) => a.value > b.value ? 1 : -1).map(d => d.circumstance),
    padding: 0.2
  });

  return width > 0 && (
    <>
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          {data.other.map(d => (
              <Group key={`group-${d.circumstance}`}>
                <Bar 
                  key={`bar-${d.circumstance}`}
                  x={0}
                  y={yScale(d.circumstance)}
                  width={xScale(d.value)}
                  height={barThickness}
                  fill="rgb(198, 209, 230)"
                />
                <Circle
                  key={`point-${d.circumstance}`}
                  r={5}
                  cx={xScale(d.value)}
                  cy={yScale(d.circumstance) + barThicknessHalf}
                  fill="rgb(58, 88, 161)"
                />
                <text x={xScale(d.value) + 10} y={yScale(d.circumstance) + barThickness} fontSize="small" fill="rgb(58, 88, 161)">{Math.round(d.value)}%</text>
                <text x={0}  y={yScale(d.circumstance) + barThickness + margin.bar}>{d.circumstance}</text>
              </Group>
            )
          )}
        </Group>
      </svg>
    </>
  );
}

export default CircumstancesChart;
