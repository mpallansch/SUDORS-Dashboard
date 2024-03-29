import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/causes.json';

import { countCutoff } from '../constants.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const viewportCutoff = 600;

  const { width, height, state } = params;
  const data = raw[state];
  const margin = {top: 20, bottom: 80, left: 70, right: 20};
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
                  <Bar 
                    className="bar"
                    key={`bar-${d.opioid}`}
                    x={xScale(d.opioid)}
                    y={yScale(d.present)}
                    width={xScale.bandwidth()}
                    height={adjustedHeight - yScale(d.present)}
                    fill="rgb(198, 209, 230)"
                    data-tip={`<strong>${d.opioid}</strong><br/>
                    Percent Present: ${d.present}%<br/>
                    Deaths Present: ${d.presentCount <= countCutoff ? `< ${countCutoff}` : d.presentCount}<br/>
                    Percent Cause: ${d.cause}%<br/>
                    Deaths Cause: ${d.causeCount <= countCutoff ? `< ${countCutoff}` : d.causeCount}`}
                  />
                  <line 
                    x1={xScale(d.opioid)} 
                    y1={yScale(d.cause)} 
                    x2={xScale(d.opioid) + xScale.bandwidth()} 
                    y2={yScale(d.cause)} 
                    stroke="rgb(58, 88, 161)"
                    strokeDasharray="10 5" 
                    strokeWidth="5" />
                </Group>
              )
            )}
            {width}
            <AxisBottom
              top={adjustedHeight}
              scale={xScale}
              tickLabelProps={(label, index, props) => ({
                fontSize: 'medium',
                textAnchor: width < viewportCutoff ? 'end' : 'middle',
                transform: width < viewportCutoff ? `rotate(-45, ${props[index].to.x}, ${props[index].to.y})` : 'translate(0, 10)',
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
