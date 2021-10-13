import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { Text } from '@visx/text';

import raw from '../data/interventions.json';
import rawCircumstances from '../data/circumstances.json';

import '../css/WaffleChart.css';

function WaffleChart(params) {

  const { width, height, state, header } = params;

  const data = raw[state];

  const inHome = rawCircumstances[state].home;

  let margin = {top: header ? (height - width > 0 ? (height - width) / 2 : 0) : 0, bottom: 0, left: 0, right: 0, dot: 3};
  const adjustedWidth = (width - margin.left - margin.right) / (header ? 1 : 2);
  const adjustedHeight = header ? height - margin.top - margin.bottom : adjustedWidth;
  if(header && width > adjustedHeight){
    margin.left = (width - adjustedWidth) / 2;
  }
  const dotWidth = (adjustedWidth - (margin.dot * (header ? 5 : 11))) / (header ? 4 : 10);
  const dotRadius = dotWidth / 2;
  const arrayList = header ? [1,2,3,4] : [1,2,3,4,5,6,7,8,9,10];

  const rowCutoff = header ? Math.ceil(4 - (data / 25)) : Math.ceil(10 - (inHome / 10));
  const colCutoff = header ?  4 - Math.ceil((data % 25) / 6.25) : 10 - Math.ceil((inHome % 10) / 10);

  return width > 0 && (
    <>
      <svg
        id="waffle-chart" 
        width={width} 
        height={header ? height : adjustedHeight}>
        <Group top={margin.top} left={margin.left}>
          {arrayList.map(rowIndex => {
            return arrayList.map(colIndex => {
              const active = rowIndex > rowCutoff || (rowIndex === rowCutoff && colIndex >= colCutoff);
              const fill = active ? (header ? '#712177' : 'rgb(58, 88, 161)') : 'white';
              const stroke = !active ? (header ? '#b890bb' : 'rgb(198, 209, 230)') : 'none';

              return (
                <Circle 
                  key={`waffle-point-${rowIndex}-${colIndex}`}
                  r={dotRadius}
                  cx={colIndex * (dotWidth + margin.dot) - dotRadius}
                  cy={rowIndex * (dotWidth + margin.dot) - dotRadius}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={!active ? 2 : 0}
                />
              );
            })
          })}
        </Group>
        {!header && (
          <>
            <Text 
              x={(adjustedWidth * 1.5) + margin.left} 
              y={adjustedWidth / 2 - 20}
              fontSize={adjustedWidth / 3}
              fill="rgb(58, 88, 161)"
              textAnchor="middle">{Math.round(inHome)}%</Text>
            <Text 
              x={(adjustedWidth * 1.5) + margin.left} 
              y={adjustedWidth * .7}
              width={adjustedWidth / 1.5}
              fontSize={adjustedWidth / 12}
              fontWeight="bold"
              fill="rgb(158, 169, 190)"
              textAnchor="middle">of cases occured at home/apartment</Text>
          </>
        )}
      </svg>
    </>
  );
}

export default WaffleChart;
