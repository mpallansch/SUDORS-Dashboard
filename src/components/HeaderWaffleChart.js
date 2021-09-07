import { Circle } from '@visx/shape';

import '../css/HeaderWaffleChart.css';

function HeaderWaffleChart(params) {

  const roundedValue = 90;
  
  const { width, height } = params;

  const margin = {top: 20, bottom: 0, left: 0, right: 0, dot: 3};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const dotWidth = (adjustedWidth - (margin.dot * 5)) / 4;
  const dotRadius = dotWidth / 2;
  const oneThroughFour = [1,2,3,4];

  return width > 0 && (
    <>
      <svg
        id="header-waffle-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}>
        {oneThroughFour.map(rowIndex => {
          return oneThroughFour.map(colIndex => {
            const rowCutoff = Math.ceil((roundedValue / 25));
            const colCutoff =  3 - (roundedValue % 25) / 4;

            return (
              <Circle 
                key={`waffle-point-${rowIndex}-${colIndex}`}
                r={dotRadius}
                cx={colIndex * (dotWidth + margin.dot) - margin.dot}
                cy={rowIndex * (dotWidth + margin.dot) - margin.dot}
                fill={rowIndex > rowCutoff || (rowIndex === rowCutoff && colIndex > colCutoff) ? 'rgb(198, 209, 230)' : 'rgb(58, 88, 161)'}
              />
            );
          })
        })}
      </svg>
    </>
  );
}

export default HeaderWaffleChart;
