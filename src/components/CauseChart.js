import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/causes.json';

import Utils from '../shared/Utils';
import DataTable from './DataTable';
import { countCutoff } from '../constants.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(false);

  const { width, height, state, el, accessible, colorScale } = params;
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

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().bottom - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if(animated) {
      setAnimated(false);
      setTimeout(() => {
        setAnimated(true);
      }, 50);
    } // eslint-disable-next-line
  }, [state]);

  return width > 0 && (
    <>
      <div id="cause-chart">
        {accessible ? (
          <DataTable 
            data={data}
            xAxisKey={'opioid'}
          />
        ) : (
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
                      className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : '',
                        'transformOrigin': `0px ${adjustedHeight}px`
                      }}
                      d={Utils.verticalBarPath(xScale(d.opioid), yScale(d.cause), xScale.bandwidth(), adjustedHeight - yScale(d.cause), xScale.bandwidth() * .35)}
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
                tickStroke="none"
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
        )}
      </div>
    </>
  );
}

export default CauseChart;
