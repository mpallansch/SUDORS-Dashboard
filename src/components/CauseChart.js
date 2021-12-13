import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/causes.json';

import Utils from '../shared/Utils';
import { countCutoff } from '../constants.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const viewportCutoff = 600;

  const { width, height, state, colorScale } = params;
  const data = raw[state];
  const margin = {top: 20, bottom: width < viewportCutoff ? 220 : 140, left: 70, right: 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    range: [ 0, adjustedWidth ],
    domain: data.map(d => d.opioid),
    padding: 0.2
  });

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
                  <path
                    key={`cause-bar-${d.opioid}`}
                    d={Utils.verticalBarPath(xScale(d.opioid), yScale(d.cause), xScale.bandwidth(), adjustedHeight - yScale(d.cause), 20)}
                    fill={colorScale[d.opioid]}
                    data-tip={`<strong>${d.opioid}</strong><br/>
                    Percent Present: ${d.present.toFixed(1)}%<br/>
                    Deaths Present: ${d.presentCount <= countCutoff ? `< ${countCutoff}` : d.presentCount}<br/>
                    Percent Cause: ${d.cause.toFixed(1)}%<br/>
                    Deaths Cause: ${d.causeCount <= countCutoff ? `< ${countCutoff}` : d.causeCount}`}
                  ></path>
                </Group>
              )
            )}
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
              tickLabelProps={(label, index, props) => ({
                fontSize: 'medium',
                textAnchor: 'end',
                transform: `rotate(-${width < viewportCutoff ? 65 : 30}, ${props[index].to.x}, ${props[index].to.y})`,
                dy: 5,
                dominantBaseline: 'end'
              })}
            />
          </Group>
        </svg>
      </div>
    </>
  );
}

export default CauseChart;
