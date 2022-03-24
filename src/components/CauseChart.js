import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import Utils from '../shared/Utils';
import DataTable from './DataTable';
import { countCutoff } from '../constants.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(false);

  const { data, width, height, el, state, accessible, colorScale } = params;

  const margin = {top: 20, bottom: width < viewportCutoff ? 120 : 140, left: 70, right: 20};
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
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top + 50){
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

  let labelOverrides = {
    'causeCount': 'Number of deaths',
    'causePercent': 'Percent of deaths',
    'Illicitly manufactured fentanyls': '    Illicitly manufactured fentanyls',
    'Prescription opioids': '    Prescription opioids',
    'Methamphetamine': '    Methamphetamine',
    'Cocaine': '    Cocaine',
    'Heroin': '    Heroin',
    'opioid': 'Drug'
  };

  if(width < viewportCutoff){
    labelOverrides['Illicitly manufactured fentanyls'] = '    IMFs';
    labelOverrides['Prescription opioids'] = '    Rx Opioids';
    labelOverrides['Methamphetamine'] = '    Meth';
  }

  return width > 0 && (
    <>
      <div id="cause-chart">
        {accessible ? (
          <DataTable 
            data={[...data.map(d => d.opioid.indexOf('Any') !== -1 ? {...d, background: true} : d)]}
            xAxisKey={'opioid'}
            orderedKeys={['causeCount', 'causePercent']}
            labelOverrides={labelOverrides}
            suffixes={{'causePercent': '%'}}
            caption={'Overdose deaths by drug'}
            customBackground={true}
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
                      d={Utils.verticalBarPath(xScale(d.opioid), yScale(d.causePercent), xScale.bandwidth(), adjustedHeight - yScale(d.causePercent), xScale.bandwidth() * .1)}
                      fill={colorScale[d.opioid]}
                      data-tip={`<strong>${d.opioid}</strong><br/>
                      Deaths: ${d.causeCount < countCutoff ? `< ${countCutoff}` : Number(d.causeCount).toLocaleString()}<br/>
                      Percent: ${d.causePercent.toFixed(1)}%`}
                    ></path>
                  </Group>
                )
              )}
              <AxisBottom
                top={adjustedHeight}
                scale={xScale}
                tickStroke="none"
                tickFormat={label => width < viewportCutoff && labelOverrides[label] ? labelOverrides[label].trim() : label}
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
