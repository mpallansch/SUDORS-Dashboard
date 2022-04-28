import { useState, useEffect } from 'react';
import { Bar, Circle } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import { countCutoff } from '../constants.json';

import '../css/DrugCombinationChart.css';
import DataTable from './DataTable';

function DrugCombinationChart(params) {

  const drugs = ['Illicitly manufactured fentanyls', 'Heroin', 'Prescription opioids', 'Cocaine', 'Methamphetamine'];

  const viewportCutoff = 600;

  const { data, width, height, accessible, colorScale, allStatesMax } = params;

  const margin = {top: 10, bottom: 10, left: 0, right: 0, bar: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const barThickness = 6;
  const barThicknessHalf = barThickness / 2;

  const xScale = scaleLinear({
    domain: [0, allStatesMax * 1.1],
    range: [ 0, adjustedWidth - 95 ]
  });

  const yScale = scaleBand({
    range: [ adjustedHeight, 0 ],
    domain: data.sort((a, b) => a.percent > b.percent ? 1 : -1).map(d => d.drugCombination),
    padding: 0.2
  });

  let labelOverrides = {'drugCombination': 'Overdose death involving:', 'deaths': 'Number of deaths', 'percent': 'Percent of deaths'};

  return width > 0 && (
    <>
      <div id="drug-combination-chart">
        {accessible ? (
            <DataTable 
              data={data}
              xAxisKey={'drugCombination'}
              labelOverrides={labelOverrides}
              suffixes={{'percent': '%'}}
              transforms={{
                percent: num => num.toFixed ? num.toFixed(1) : num
              }}
              caption={'Drug combinations involved in overdose deaths'}
            />
          ) : (
            <svg width={width} height={height}>
              <Group top={margin.top} left={margin.left}>
                {data.map(d => (
                    <Group key={`group-${d.drugCombination}`}>
                      <Bar 
                        key={`bar-${d.drugCombination}`}
                        x={0}
                        y={yScale(d.drugCombination)}
                        width={xScale(d.percent)}
                        height={barThickness}
                        fill={colorScale.Combination}
                      />
                      <Circle
                        key={`point-${d.drugCombination}`}
                        r={11}
                        cx={xScale(d.percent)}
                        cy={yScale(d.drugCombination) + barThicknessHalf}
                        fill={colorScale.Combination}
                        data-tip={`<strong>${d.drugCombination}</strong><br/>
                        Deaths: ${d.deaths < countCutoff ? `< ${countCutoff}` : Number(d.deaths).toLocaleString()}<br/>
                        Percent: ${d.percent ? d.percent.toFixed(1) : 0}%`}
                      />
                      <text x={(xScale(d.percent) || 0) + 15} y={yScale(d.drugCombination) + barThickness + 2} fontWeight="bold" fontSize="medium" fill={colorScale.Combination}>{d.percent}%</text>
                      <Text width={adjustedWidth} x={0}  y={yScale(d.drugCombination) + barThickness + margin.bar} verticalAnchor="start">{d.drugCombination}</Text>
                    </Group>
                  )
                )}
              </Group>
            </svg>
          )
        }
      </div>
    </>
  );
}

export default DrugCombinationChart;