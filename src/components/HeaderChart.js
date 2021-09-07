import { LinePath } from '@visx/shape';
import { scaleLinear, scaleOrdinal } from '@visx/scale';

import '../css/HeaderChart.css';

function HeaderChart(params) {
  
  const { width, height } = params;

  const margin = {top: 10, bottom: 10, left: 0, right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  return width > 0 && (
    <>
      <svg
        id="header-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}
        style={{
          marginTop: margin.top,
          marginLeft: margin.left
        }}>
          <rect x={0} y={0} width={adjustedWidth} height={adjustedHeight} fill="#712177"></rect>
          <text x={0} y={15} fill="white">Header Chart</text>
      </svg>
    </>
  );
}

export default HeaderChart;
