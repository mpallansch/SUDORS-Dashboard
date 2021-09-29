import { LinePath } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveLinear } from '@visx/curve'; 

import raw from '../data/time.json';

import '../css/HeaderLineChart.css';

function HeaderLineChart(params) {
  
  const { width, height, state } = params;

  const data = raw[state];

  const margin = {top: 10, bottom: 10, left: 0, right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleBand({
    domain: data.map(d => d.month),
    range: [ 0, adjustedWidth ],
    padding: 0.2
  });

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [0, Math.max(...data.map(d => d.value))]
  });

  return width > 0 && (
    <>
      <svg
        id="header-line-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}
        style={{
          marginTop: margin.top,
          marginLeft: margin.left
        }}>
        <LinePath
            className={`line`}
            curve={curveLinear}
            data={data}
            x={d => xScale(d.month)}
            y={d => yScale(d.value)}
            stroke="#712177"
            strokeWidth={3}
          />
      </svg>
    </>
  );
}

export default HeaderLineChart;
