import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { Text } from '@visx/text';

import raw from '../data/interventions.json';

import '../css/WaffleChart.css';

function WaffleChart(params) {

  const { width, height, state, header } = params;

  const data = raw[state];

  const numDots = header ? 4 : 10;
  const rowValue = 100 / numDots;
  const colValue = 100 / Math.pow(numDots, 2);

  let margin = {top: header ? (height - width > 0 ? (height - width) / 2 : 0) : 0, bottom: 0, left: 0, right: 0, dot: 3};
  const adjustedWidth = (width - margin.left - margin.right) / (header ? 1 : 2);
  const adjustedHeight = header ? height - margin.top - margin.bottom : adjustedWidth;
  if(header && width > adjustedHeight){
    margin.left = (width - adjustedWidth) / 2;
  }
  const dotWidth = (adjustedWidth - (margin.dot * (numDots + 1))) / numDots;
  const dotRadius = dotWidth / 2;
  let rowList = [];
  let colList = [];
  for(let i = numDots - 1; i >= 0; i--){
    rowList.push(i);
  }
  for(let i = 1; i <= numDots; i++){
    colList.push(i);
  }

  return width > 0 && (
    <>
      <svg
        id="waffle-chart" 
        width={width} 
        height={header ? height : adjustedHeight}>
        <Group top={margin.top} left={margin.left}>
          {rowList.map(rowIndex => {
            return colList.map(colIndex => {
              const value = (rowIndex * rowValue) + (colIndex * colValue);
              const active = value > data;
              const fill = active ? 'white' : (header ? '#712177' : 'rgb(58, 88, 161)');
              const stroke = !active ? 'none' : (header ? '#b890bb' : 'rgb(198, 209, 230)');

              return (
                <Circle 
                  key={`waffle-point-${rowIndex}-${colIndex}`}
                  r={dotRadius}
                  cx={adjustedWidth - (colIndex * (dotWidth + margin.dot) - dotRadius)}
                  cy={adjustedHeight - ((rowIndex + 1) * (dotWidth + margin.dot) - dotRadius) - margin.top}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={active ? 2 : 0}
                />
              );
            })
          })}
        </Group>
        {!header && (
          <>
            <Text 
              x={adjustedWidth + margin.left + 20} 
              y={adjustedWidth / 2 - 20}
              fontSize={adjustedWidth / 3}
              fill="rgb(58, 88, 161)">{Math.round(data) + '%'}</Text>
            <Text 
              x={adjustedWidth + margin.left + 20} 
              y={adjustedWidth / 2 - 10}
              width={adjustedWidth / 1.5}
              fontSize={adjustedWidth / 12}
              fontWeight="bold"
              verticalAnchor="start"
              fill="rgb(58, 88, 161)">of drug overdoses had at least one opportunity for intervention</Text>
          </>
        )}
      </svg>
    </>
  );
}

export default WaffleChart;
