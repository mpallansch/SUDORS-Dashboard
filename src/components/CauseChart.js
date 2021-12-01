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
  const margin = {top: 20, bottom: width < viewportCutoff ? 80 : 30, left: 70, right: 20};
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

  const colors = {
    'Any Opioids': 'rgb(58, 88, 161)',
    'Methamphetamine': 'rgb(75, 131, 13)',
    'Heroin': 'rgb(251, 171, 24)',
    'Prescription opioids': 'rgb(0, 124, 145)',
    'Cocaine': 'rgb(0, 105, 92)',
    'Illicitly manufactured fentanyls': 'rgb(187, 77, 0)'
  };

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
                    key={`cause-bar-${d.opioid}`}
                    x={xScale(d.opioid)}
                    y={yScale(d.cause)}
                    width={xScale.bandwidth()}
                    height={adjustedHeight - yScale(d.cause)}
                    fill={colors[d.opioid]}
                    data-tip={`<strong>${d.opioid}</strong><br/>
                    Percent Present: ${d.present.toFixed(1)}%<br/>
                    Deaths Present: ${d.presentCount <= countCutoff ? `< ${countCutoff}` : d.presentCount}<br/>
                    Percent Cause: ${d.cause.toFixed(1)}%<br/>
                    Deaths Cause: ${d.causeCount <= countCutoff ? `< ${countCutoff}` : d.causeCount}`}
                  />
                </Group>
              )
            )}
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
