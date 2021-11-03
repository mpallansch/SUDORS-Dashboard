import { useState } from 'react'; 
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { Text } from '@visx/text'

import raw from '../data/sex.json';
import rawRates from '../data/age-adjusted-sex-rates.json';

import { countCutoff, rateCutoff, rateCutoffLabel } from '../constants.json';

import '../css/SexChart.css';

function SexChart(params) {
  const [active, setActive] = useState(null);
  const { width, height, state, colorScale } = params;

  const data = raw[state];
  const dataRates = rawRates[state];

  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;
  const halfHeight = adjustedHeight / 2;
  const pieRadius = Math.min(halfWidth, halfHeight);
  const nfObject = new Intl.NumberFormat('en-US');

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
          data={data}
          pieValue={d => d.percent}
          outerRadius={pieRadius}
          innerRadius={({data}) => {
            const size = active && active.percent === data.percent ? .45 : .5;
            return pieRadius * size
          }}
          color={d => d > 50 ? 'red' : 'blue'}
          padAngle={.05}
        >
          {(pie) => (
            <Group top={halfHeight} left={halfWidth}>
              {pie.arcs.map((arc, index) => {
                  const [ centroidX, centroidY ] = pie.path.centroid(arc);
                  let rate = 'Unavailable';
                  if(dataRates) rate = (dataRates[0].sex === arc.data.sex.toLowerCase() ? dataRates[0].rate : dataRates[1].rate);
                  if(rate <= rateCutoff) rate = rateCutoffLabel;
                  
                  arc.data.rate = rate.toFixed(1)
                  
                  return (
                    <g 
                      key={`arc-${index}`} 
                      className="animated-pie"
                    >
                      <path d={pie.path(arc)} fill={colorScale[arc.data.sex]}
                        // data-tip={
                        //   `<strong>${arc.data.sex}</strong><br/>
                        //   Deaths: ${arc.data.count <= countCutoff ? `< ${countCutoff}` : arc.data.count}<br/>
                        //   Rate: ${rate}`} 
                          onMouseEnter={() => setActive(arc.data)} 
                          onMouseLeave={() => setActive(null)} 
                      />
                      <text
                        fill={arc.data.sex === 'Female' ? 'black' : 'white'}
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize="medium"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {arc.data.percent}%
                      </text>
                      {active ? (
                        <>
                          <Text textAnchor="middle" dy={-10} fontWeight="bold" fontSize={22}>{`${nfObject.format(active.count)}`}</Text>
                          <Text textAnchor="middle" dy={8} fontSize={14}>{`${active.sex} Deaths`}</Text>
                          <Text textAnchor="middle" dy={24} fontSize={14}>{`Rate: ${active.rate}`}</Text>
                        </>
                      ) : (
                        <>
                          <Text textAnchor="middle" dy={-10} fontWeight="bold" fontSize={22}>{
                              // Sum all counts in the data
                              nfObject.format(data.map(item=> item.count).reduce( (prev, curr) => prev + curr, 0 ) )
                            }</Text>
                          <Text textAnchor="middle" dy={8} fontSize={14}>Total Deaths</Text>
                        </>
                      ) }
                      
                    </g>
                  )
                }
              )}
            </Group>
          )}
        </Pie>
        
      </svg>
    </>
  );
}

export default SexChart;
