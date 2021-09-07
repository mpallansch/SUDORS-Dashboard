import { Group } from '@visx/group';
import { Pie } from '@visx/shape';

import '../css/SexChart.css';

function SexChart(params) {
  
  const { width, height } = params;

  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;
  const halfHeight = adjustedHeight / 2;
  const pieRadius = Math.min(halfWidth, halfHeight);

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
          data={[{value: 70}, {value: 30}]}
          pieValue={d => d.value}
          outerRadius={pieRadius}
          innerRadius={pieRadius * .5}
          color={d => d > 50 ? 'red' : 'blue'}
          color
        >
          {(pie) => (
            <Group top={halfHeight} left={halfWidth}>
              {pie.arcs.map((arc, index) => (
                  <g key={`arc-${index}`}>
                    <path d={pie.path(arc)} fill={arc.data.value < 50 ? 'rgb(58, 88, 161)' : 'rgb(198, 209, 230)'} />
                  </g>
                )
              )}
            </Group>
          )}
        </Pie>
      </svg>
    </>
  );
}

export default SexChart;
