import { Circle } from '@visx/shape';

import data from '../data/circumstances.json';

import '../css/HomeChart.css';

function HomeChart(params) {

  const roundedValue = Math.round(data.home);

  const { width, height } = params;
  const margin = {top: 10, bottom: 10, left: 50, right: 10, dot: 3};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = Math.min(adjustedHeight, (width - margin.left - margin.right) / 2);
  const dotWidth = (adjustedWidth - (margin.dot * 11)) / 10;
  const dotRadius = dotWidth / 2;
  const oneThroughTen = [0,1,2,3,4,5,6,7,8,9];

  return width > 0 && (
    <>
      <svg
        id="home-chart" 
        width={adjustedWidth} 
        height={adjustedHeight} 
        style={{ 
          marginTop: margin.top,
          marginLeft: margin.left,
          marginRight: margin.right,
          marginBottom: margin.bottom,
        }}>
        {oneThroughTen.map(rowIndex => {
          return oneThroughTen.map(colIndex => {
            const rowCutoff = Math.ceil(10 - (roundedValue / 10)) - 1;
            const colCutoff = 10 - (roundedValue % 10);

            return (
              <Circle 
                key={`waffle-point-${rowIndex}-${colIndex}`}
                r={dotRadius}
                cx={colIndex * (dotWidth + margin.dot) + margin.dot + dotRadius}
                cy={rowIndex * (dotWidth + margin.dot) + margin.dot + dotRadius}
                fill={rowIndex < rowCutoff || (rowIndex === rowCutoff && colIndex < colCutoff) ? 'rgb(198, 209, 230)' : 'rgb(58, 88, 161)'}
              />
            );
          })
        })}
      </svg>
      <span className="data-bite-container" style={{width: adjustedWidth}}>
        <div className="data-bite">
          {roundedValue}%
        </div>
        <span>
          of deaths occured in the decedent's home
        </span>
      </span>
    </>
  );
}

export default HomeChart;
