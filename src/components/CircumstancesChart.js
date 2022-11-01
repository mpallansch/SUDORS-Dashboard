import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import DataTable from './DataTable';
import { countCutoff } from '../constants.json';

import '../css/CircumstancesChart.css';

function CircumstancesChart(params) {

  const { data, atLeastOneValue, width, height, accessible, colorScale, allStatesMax, toFixed } = params;
  const metric = 'intervention';
  const margin = {top: 10, bottom: 10, left: 0, right: 0, bar: 15};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const barThickness = 6;
  const barThicknessHalf = barThickness / 2;

  const xScale = scaleLinear({
    domain: [0, allStatesMax * 1.1],
    range: [ 0, adjustedWidth - 75 ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data[metric].sort((a, b) => a.circumstance < b.circumstance ? 1 : -1).map(d => d.circumstance),
    padding: 0.2
  });

  return width > 0 && 
    accessible ? (
      <DataTable
        data={[{circumstance: '≥1 potential opportunity for intervention', count: atLeastOneValue.deaths, percent: atLeastOneValue.percent}, ...data[metric].sort((a, b) => a.circumstance < b.circumstance ? -1 : 1).map(d => ({circumstance: `    ${d.circumstance}`, count: d.count, percent: d.percent}))]}
        xAxisKey={'circumstance'}
        orderedKeys={['count', 'percent']}
        labelOverrides={{
          'count': 'Number of Deaths', 
          'percent': 'Percent of deaths', 
          'circumstance': 'Potential opportunity for intervention',
          '    Current treatment for substance use disorder(s)': <>    Current treatment for substance use disorder(s)<sup>j</sup></>,
          '    Potential bystander present': <>    Potential bystander present<sup>k</sup></>,
          '    Recent release from institutional setting': <>    Recent release from institutional setting<sup>l</sup></>
        }}
        suffixes={{
          'percent': '%'
        }}
        transforms={{
          percent: num => toFixed(num)
        }}
        caption={'Circumstances involved in drug deaths'}
      />
    ) : (
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
                  fill={colorScale.Intervention}
                />
                <Circle
                  key={`point-${d.circumstance}`}
                  r={11}
                  cx={xScale(d.percent)}
                  cy={yScale(d.circumstance) + barThicknessHalf}
                  fill={colorScale.Intervention}
                  data-tip={`<strong>${d.circumstance}</strong><br/>
                  Deaths: ${d.count < countCutoff ? `< ${countCutoff}` : Number(d.count).toLocaleString()}<br/>
                  Percent: ${toFixed(d.percent || 0)}%`}
                />
                <text x={(xScale(d.percent) || 0) + 15} y={yScale(d.circumstance) + barThickness + 2} fontWeight="bold" fontSize="medium" fill={colorScale.Intervention}>{toFixed(d.percent)}%</text>
                <foreignObject x={0} y={yScale(d.circumstance) + barThickness + margin.bar} width={adjustedWidth} height="50">
                  <span>{d.circumstance}
                    {d.circumstance === 'Current treatment for substance use disorder(s)' && <> <sup aria-describedby="footnote-j">j</sup></>}
                    {d.circumstance === 'Potential bystander present' && <sup aria-describedby="footnote-k">k</sup>}
                    {d.circumstance === 'Recent release from institutional setting' && <sup aria-describedby="footnote-l">l</sup>}
                  </span>
                </foreignObject>
              </Group>
            )
          )}
        </Group>
      </svg>
    )
}

export default CircumstancesChart;
