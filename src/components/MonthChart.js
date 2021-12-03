import { useState, useEffect } from 'react';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/time.json';

import { countCutoff } from '../constants.json';

import '../css/MonthChart.css';

const monthMappingFull = {
  '37': 'January',
  '38': 'February',
  '39': 'March',
  '40': 'April',
  '41': 'May',
  '42': 'June',
  '43': 'July',
  '44': 'August',
  '45': 'September',
  '46': 'October',
  '47': 'November',
  '48': 'December',
  '49': 'January',
  '50': 'February',
  '51': 'March',
  '52': 'April',
  '53': 'May',
  '54': 'June',
  '55': 'July',
  '56': 'August',
  '57': 'September',
  '58': 'October',
  '59': 'November',
  '60': 'December',
  '61': 'January'
};

const monthMapping = {
  '37': 'Jan',
  '38': 'Feb',
  '39': 'Mar',
  '40': 'Apr',
  '41': 'May',
  '42': 'Jun',
  '43': 'Jul',
  '44': 'Aug',
  '45': 'Sep',
  '46': 'Oct',
  '47': 'Nov',
  '48': 'Dec',
  '49': 'Jan',
  '50': 'Feb',
  '51': 'Mar',
  '52': 'Apr',
  '53': 'May',
  '54': 'Jun',
  '55': 'Jul',
  '56': 'Aug',
  '57': 'Sep',
  '58': 'Oct',
  '59': 'Nov',
  '60': 'Dec',
  '61': 'Jan'
};

function MonthChart(params) {

  const viewportCutoff = 600;

  const { width, height, state, header, colorScale, el } = params;
  const [ animated, setAnimated ] = useState(false);

  const data = raw[state];
  const margin = {top: 10, bottom: (header ? 10 : 50), left: (header ? 0 : 55), right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleBand({
    domain: data.map(d => d.month),
    range: [ 0, adjustedWidth ],
    padding: 0.35
  });

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [0, Math.max(...data.map(d => d.value))]
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
      <div id="month-chart">
        <svg width={width} height={height}>
        
          <Group top={margin.top} left={margin.left}>
            {!header && (
              <AxisLeft
                scale={yScale}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'end',
                  transform: 'translate(-5, 5)'
                })}
              />
            )}
            
            {data.map(d => (
                <Group key={`group-${d.month}`} className="animate-bars">
                  {d.value >= countCutoff && (
                    <Bar
                      key={`cause-bar-${d.month}`}
                      className={`animated-bar-vert ${animated ? 'animated' : ''}`}
                      style={{
                        'transition': animated ? 'transform 1s ease-in-out' : ''
                      }}
                      x={xScale(d.month)}
                      y={yScale(d.value)}
                      width={xScale.bandwidth()}
                      height={adjustedHeight - yScale(d.value)}
                      fill={colorScale.Primary}
                      data-tip={`<strong>${monthMappingFull[d.month]}</strong><br/>Deaths: ${d.value}`}
                    />
                  )}
                  {d.value < countCutoff && (
                    <text
                      x={xScale(d.month)}
                      y={adjustedHeight - 5}
                      fill="black"
                      textAnchor="middle"
                    >*</text>
                  )}
                </Group>
              )
            )}
            {width}
            {!header && (
              <AxisBottom
                top={adjustedHeight}
                scale={xScale}
                numTicks={width < viewportCutoff ? 6 : null}
                tickLabelProps={() => ({
                  fontSize: 'medium',
                  textAnchor: 'middle',
                  transform: 'translate(0, 10)'
                })}
                tickFormat={(monthNum) => monthMapping[monthNum]}
              />
            )}
          </Group>
        </svg>
      </div>
    </>
  );
}

export default MonthChart;
