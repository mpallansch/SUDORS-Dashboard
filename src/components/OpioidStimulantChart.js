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
  const margin = {top: 10, bottom: 30, left: 20, right: 20};
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

                    let count, percent;
                    if(rawCount <= countCutoff){
                      count = '< ' + countCutoff;
                      percent = '< ' + rawPercent.toFixed(1)
                    } else {
                      count = rawCount;
                      percent = rawPercent.toFixed(1);
                    }

                    return (
                      <Group key={`barstack-horizontal-${barStack.index}-${bar.index}`}>
                        <rect
                          x={bar.x}
                          y={bar.y}
                          width={bar.width}
                          height={adjustedHeight}
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
              top={adjustedHeight}
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
