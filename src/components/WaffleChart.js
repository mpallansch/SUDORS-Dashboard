import { Group } from '@visx/group';
import { Circle } from '@visx/shape';

import raw from '../data/interventions.json';

import '../css/WaffleChart.css';

function WaffleChart(params) {

  const { width, height, state, header } = params;

  const data = raw[state];

  let margin = {top: header ? (height - width > 0 ? (height - width) / 2 : 0) : 0, bottom: 0, left: 0, right: 0, dot: 3};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = Math.min(width - margin.left - margin.right, adjustedHeight) / (header ? 1 : 2);
  if(width > (adjustedHeight * 2)){
    margin.left = (width - (adjustedWidth * 2)) / 2;
  }
  const dotWidth = (adjustedWidth - (margin.dot * (header ? 5 : 11))) / (header ? 4 : 10);
  const dotRadius = dotWidth / 2;
  const arrayList = header ? [1,2,3,4] : [1,2,3,4,5,6,7,8,9,10];

  const rowCutoff = header ? Math.ceil(4 - (data / 25)) : Math.ceil(10 - (data / 10));
  const colCutoff = header ?  4 - Math.ceil((data % 25) / 6.25) : 10 - Math.ceil((data % 10) / 10);

  return width > 0 && (
    <>
      <svg
        id="waffle-chart" 
        width={width} 
        height={height}>
        <Group top={margin.top} left={margin.left}>
          {arrayList.map(rowIndex => {
            return arrayList.map(colIndex => {
              const active = rowIndex > rowCutoff || (rowIndex === rowCutoff && colIndex > colCutoff);

              return (
                <Circle 
                  key={`waffle-point-${rowIndex}-${colIndex}`}
                  r={dotRadius}
                  cx={colIndex * (dotWidth + margin.dot) - dotRadius}
                  cy={rowIndex * (dotWidth + margin.dot) - dotRadius}
                  fill={active ? '#712177' : 'white'}
                  stroke={!active ? '#b890bb' : 'none'}
                  strokeWidth={!active ? 2 : 0}
                />
              );
            })
          })}
        </Group>
        {!header && <text x={adjustedWidth} y={adjustedWidth / 2 - 10}>Foo</text>}
      </svg>
    </>
  );
}

export default WaffleChart;
