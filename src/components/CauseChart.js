import { Bar, Circle, LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';
import { curveLinear } from '@visx/curve';

import raw from '../data/causes.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const { width, height, state } = params;
  const data = raw[state];
  const margin = {top: 20, bottom: 70, left: 70, right: 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    range: [ 0, adjustedWidth ],
    domain: data.map(d => d.opioid),
    padding: 0.2
  });
  const xOffset = xScale.bandwidth() / 2;

  const yScale = scaleLinear({
    domain: [0, 100],
    range: [ adjustedHeight, 0 ]
  });

  return width > 0 && (
    <>
      <div id="cause-chart">
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
            {data.map(d => (
                <Group key={`group-${d.opioid}`}>
                  <Bar 
                    className="bar"
                    key={`bar-${d.opioid}`}
                    x={xScale(d.opioid)}
                    y={yScale(d.present)}
                    width={xScale.bandwidth()}
                    height={adjustedHeight - yScale(d.present)}
                    fill="rgb(198, 209, 230)"
                  />
                  <Circle
                    className="point"
                    key={`point-${d.opioid}`}
                    r={5}
                    cx={xScale(d.opioid) + xOffset}
                    cy={yScale(d.cause)}
                    fill="rgb(58, 88, 161)"
                  />
                </Group>
              )
            )}
            <LinePath
              className={`line`}
              curve={curveLinear}
              data={data}
              x={d => xScale(d.opioid) + xOffset}
              y={d => yScale(d.cause)}
              stroke="rgb(58, 88, 161)"
              strokeWidth={3}
            />
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
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

export default CauseChart;
