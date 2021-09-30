import { Circle } from '@visx/shape';

import raw from '../data/interventions.json';

import '../css/HeaderWaffleChart.css';

function HeaderWaffleChart(params) {

  const { width, height, state } = params;

  const data = raw[state];

  const margin = {top: height - width > 0 ? (height - width) / 2 : 0, bottom: 0, left: 0, right: 0, dot: 3};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const dotWidth = (adjustedWidth - (margin.dot * 5)) / 4;
  const dotRadius = dotWidth / 2;
  const oneThroughFour = [1,2,3,4];

  const rowCutoff = Math.ceil(4 - (data / 25));
  const colCutoff =  4 - Math.ceil((data % 25) / 6.25);

  return width > 0 && (
    <>
      <svg
        id="header-waffle-chart" 
        width={adjustedWidth} 
        height={adjustedHeight}
        style={{marginTop: margin.top}}>
        {oneThroughFour.map(rowIndex => {
          return oneThroughFour.map(colIndex => {
            const active = rowIndex > rowCutoff || (rowIndex === rowCutoff && colIndex > colCutoff);

            return (
              <Circle 
                key={`waffle-point-${rowIndex}-${colIndex}`}
                r={dotRadius}
                cx={colIndex * (dotWidth + margin.dot) - margin.dot}
                cy={rowIndex * (dotWidth + margin.dot) - margin.dot}
                fill={active ? '#712177' : 'white'}
                stroke={!active ? '#b890bb' : 'none'}
                strokeWidth={!active ? 2 : 0}
              />
            );
          })
        })}
      </svg>
    </>
  );
}

export default HeaderWaffleChart;
