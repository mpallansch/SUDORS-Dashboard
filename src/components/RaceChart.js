import '../css/RaceChart.css';

function RaceChart(params) {
  
  const { width, height } = params;

  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  return width > 0 && (
    <>
      <svg
        id="race-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}
        style={{
          marginTop: margin.top,
          marginLeft: margin.left
        }}>
          <rect x={0} y={0} width={adjustedWidth} height={adjustedHeight} fill="#712177"></rect>
          <text x={0} y={15} fill="white">Race Chart</text>
      </svg>
    </>
  );
}

export default RaceChart;
