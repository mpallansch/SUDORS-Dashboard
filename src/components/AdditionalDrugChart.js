import { BarGroup } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

import raw from '../data/additional-drugs.json';

import { countCutoff } from '../constants.json';

import '../css/AdditionalDrugChart.css';

function AdditionalDrugChart(params) {

  const viewportCutoff = 600;

  const { width, height, state } = params;
  const data = raw[state];
  const margin = {top: 10, left: 50, right: 20, bottom: 70};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const groups = data.map(d => d.cause);

  const xScale = scaleBand({
    domain: groups,
    range:[0, adjustedWidth],
    padding: 0.1
  });

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [ adjustedHeight, margin.top ]
  });

  const colorScale = scaleOrdinal({
    domain: groups,
    range: ['rgb(113, 129, 167)','rgb(150, 160, 185)', 'rgb(108, 56, 111)', 'rgb(76, 140, 126)', 'rgb(132, 178, 170)'],
  });

  return width > 0 && (
    <>
      <div id="additional-drug-chart">
        <svg width={width} height={height}>
          <Group top={margin.top} left={margin.left}>
            <AxisLeft
              scale={yScale}
              tickValues={[0, 25, 50, 75, 100]}
              tickFormat={num => num + '%'}
              tickLabelProps={() => ({
                fontSize: 'medium',
                textAnchor: 'end',
                transform: 'translate(-10, 5)'
              })}
              tickTransform={`translate(${adjustedWidth}, 0)`}
              tickStroke="lightgray"
              tickLength={adjustedWidth}
              hideAxisLine
            />
            {data.map(d => {
              let subGroup = [...groups];
              subGroup.splice(subGroup.indexOf(d.cause) , 1);

              const x1Scale = scaleBand({
                domain: subGroup,
                range: [0, xScale.bandwidth()]
              });

              return (
                <BarGroup 
                  className="bar"
                  key={`bar-group-${d.cause}`}
                  data={[d]}
                  keys={subGroup}
                  height={adjustedHeight}
                  x0={d => d.cause}
                  x0Scale={xScale}
                  x1Scale={x1Scale}
                  yScale={yScale}
                  color={colorScale}
                  data-tip={`<strong>${d.cause}</strong><br/>
                    ${Object.keys(d).map(key => 
                      key !== 'cause' && key !== 'undefined' && key.indexOf('-Count') === -1 ? 
                        `${key}: ${d[`${key}-Count`] <= countCutoff ? `&lt; ${countCutoff}` : d[`${key}-Count`]} (${d[key]}%)<br/>` :
                        ''
                      ).join('')
                    }
                  `}
                />
              );
            })}
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
              tickLabelProps={(label, index, props) => ({
                fontSize: 'medium',
                textAnchor: width < viewportCutoff ? 'end' : 'middle',
                transform: width < viewportCutoff ? `rotate(-45, ${props[index].to.x}, ${props[index].to.y})` : 'translate(0, 10)',
                dominantBaseline: 'end'
              })}
              hideAxisLine
              hideTicks
            />
          </Group>
        </svg>
      </div>
    </>
  );
}

export default AdditionalDrugChart;