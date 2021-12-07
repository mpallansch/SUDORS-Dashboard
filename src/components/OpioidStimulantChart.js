import { BarStackHorizontal } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

import raw from '../data/opioid-stimulant.json';

import { countCutoff } from '../constants.json';

import '../css/OpioidStimulantChart.css';

function OpioidStimulantChart(params) {

  const { width, height, state } = params;
  const data = raw[state];
  const keys = Object.keys(data[0]).filter(key => key.indexOf('Percent') !== -1);
  const margin = {top: 10, bottom: 40, left: 20, right: 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, 100],
    range: [0, adjustedWidth]
  });

  const yScale = scaleBand({
    domain: [1,1],
    range: [1,1]
  });

  const colorScale = scaleOrdinal({
    domain: keys,
    range: ['rgb(58, 88, 161)', 'rgb(116,148,194)', '#88c3ea', 'rgb(220,237,201)']
  })

  return width > 0 && (
    <>
      <div id="cause-chart">
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <BarStackHorizontal
              data={data}
              keys={keys}
              yScale={yScale}
              xScale={xScale}
              color={colorScale}
              y={() => 1}>
              {barStacks =>
                barStacks.map(barStack =>
                  barStack.bars.map(bar => {
                    const name = bar.bar.data[bar.key.replace('Percent', 'Name')];
                    const rawCount = bar.bar.data[bar.key.replace('Percent', 'Count')];
                    const rawPercent = bar.bar.data[bar.key];
                    const percent = rawPercent.toFixed(1);
                    const cornerRadius = 25;
                    const xEnd = bar.x + bar.width;
                    const yEnd = bar.y + adjustedHeight;

                    let count;
                    if(rawCount <= countCutoff){
                      count = '< ' + countCutoff;
                    } else {
                      count = rawCount;
                    }

                    return (
                      <Group key={`barstack-horizontal-${barStack.index}-${bar.index}`}>
                        <path 
                          d={barStack.index === 0 ? 
                            `M${bar.x + cornerRadius} ${bar.y}
                              L${xEnd} ${bar.y}
                              L${xEnd} ${yEnd}
                              L${bar.x + cornerRadius} ${yEnd}
                              C${bar.x} ${yEnd}, ${bar.x} ${yEnd}, ${bar.x} ${yEnd - cornerRadius}
                              L${bar.x} ${bar.y + cornerRadius}
                              C${bar.x} ${bar.y}, ${bar.x} ${bar.y}, ${bar.x + cornerRadius} ${bar.y}` : 
                          (barStack.index === (barStacks.length - 1) ? 
                            `M${bar.x} ${bar.y}
                              L${xEnd - cornerRadius} ${bar.y}
                              C${xEnd} ${bar.y}, ${xEnd} ${bar.y}, ${xEnd} ${bar.y + cornerRadius}
                              L${xEnd} ${yEnd - cornerRadius}
                              C${xEnd} ${yEnd}, ${xEnd} ${yEnd}, ${xEnd - cornerRadius} ${yEnd}
                              L${bar.x} ${yEnd}
                              L${bar.x} ${bar.y}` : 
                            `M${bar.x} ${bar.y} 
                              L${xEnd} ${bar.y} 
                              L${xEnd} ${yEnd}
                              L${bar.x} ${yEnd}
                              L${bar.x} ${bar.y}`)
                          }
                          fill={bar.color}
                          data-tip={`${name}<br/>
                          Count: ${count}<br/>
                          Percent: ${percent}%`}
                        />
                        {bar.width > 50 && (
                          <text
                            x={bar.x + (bar.width / 2)}
                            y={bar.y + (adjustedHeight / 2) + 5}
                            textAnchor="middle"
                            fill={bar.key === 'nPercent' || bar.key === 'sPercent' ? 'black' : 'white'}
                          >{percent}%</text>
                        )}
                      </Group>
                  )}),
                )
              }
            </BarStackHorizontal>
            <AxisBottom
              top={adjustedHeight + 10}
              scale={xScale}
              tickValues={[0, 25, 50, 75, 100]}
              tickFormat={val => val + '%'}
              tickLabelProps={() => ({
                fontSize: 'medium',
                textAnchor: 'middle',
                transform: 'translate(0, 10)'
              })}
            />
          </Group>
        </svg>
      </div>
    </>
  );
}

export default OpioidStimulantChart;