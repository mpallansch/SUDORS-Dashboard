import { Group } from '@visx/group';
import { Pie } from '@visx/shape';

import raw from '../data/sex.json';

import '../css/SexChart.css';

function SexChart(params) {
  
  const { width, height, state } = params;

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;
  const halfHeight = adjustedHeight / 2;
  const pieRadius = Math.min(halfWidth, halfHeight);

  const colorScale = {
    Male: 'rgb(58, 88, 161)',
    Female: 'rgb(198, 209, 230)'
  };

  return width > 0 && (
    <>
      <svg 
        width={adjustedWidth}
        height={adjustedHeight}
        margin={{
          marginTop: margin.top,
          marginLeft: margin.left
        }}>
        <Pie
          data={data}
          pieValue={d => d.value}
          outerRadius={pieRadius}
          innerRadius={pieRadius * .5}
          color={d => d > 50 ? 'red' : 'blue'}
          color
        >
          {(pie) => (
            <Group top={halfHeight} left={halfWidth}>
              {pie.arcs.map((arc, index) => {
                  const [ centroidX, centroidY ] = pie.path.centroid(arc);

                  return (
                    <g key={`arc-${index}`}>
                      <path d={pie.path(arc)} fill={colorScale[arc.data.sex]} />
                      <text
                        fill="white"
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize="medium"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {arc.data.value}%
                      </text>
                    </g>
                  )
                }
              )}
            </Group>
          )}
        </Pie>
      </svg>
    </>
  );
}

export default SexChart;
