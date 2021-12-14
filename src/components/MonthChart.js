import { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/time.json';

import Utils from '../shared/Utils';
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

  const data = raw[state].month;
  const dataQuarter = raw[state].quarter;
  const margin = {top: 10, bottom: (header ? 10 : 50), left: (header ? 0 : 80), right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;

  const xScale = scaleBand({
    domain: header ? dataQuarter.map(d => d.quarter) : data.map(d => d.month),
    range: [ header ? 5 : 0, adjustedWidth ],
    padding: header ? 0 : 0.35
  });

  const halfBandwidth = xScale.bandwidth() / 2;

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [ 0, Math.max(...(header ? dataQuarter : data).map(d => d.value)) * (header ? 1.3 : 1)]
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

  return width > 0 && (
    <>
      <div id="month-chart">
        <svg width={width} height={height}>
        
          <Group top={margin.top} left={margin.left}>
            {header && (
              <>
                {dataQuarter.map(d => (
                    <>
                      <circle
                        key={`point-${d.quarter}`}
                        r={3}
                        cx={xScale(d.quarter)}
                        cy={yScale(d.value)}
                        fill="#712177"
                      />
                      <rect
                        x={xScale(d.quarter)}
                        y={0}
                        width={xScale.bandwidth()}
                        height={adjustedHeight}
                        fill="transparent"
                        data-tip={`<strong>Q${d.quarter + 1} 2020</strong><br/>Deaths: ${d.value}`}
                      />
                    </>
                ))} 
                <LinePath 
                  data={dataQuarter}
                  x={d => xScale(d.quarter)}
                  y={d => yScale(d.value)}
                  stroke="#712177"
                  strokeWidth="2"
                  pointerEvents="none"
                />
              </>
            )}

            {!header && (
              <>
                <AxisLeft
                  scale={yScale}
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'end',
                    transform: 'translate(-5, 5)'
                  })}
                  label="Count"
                  labelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle'
                  })}
                  labelOffset={60}
                />

                {data.map(d => (
                  <Group key={`group-${d.month}`} className="animate-bars">
                    {d.value >= countCutoff && (
                      <path
                        key={`cause-bar-${d.month}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        d={Utils.verticalBarPath(xScale(d.month), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), 15)}
                        fill={colorScale.Primary}
                        data-tip={`<strong>${monthMappingFull[d.month]}</strong><br/>Deaths: ${d.value}`}
                      ></path>
                    )}
                    {d.value < countCutoff && (
                      <text
                        x={xScale(d.month) + halfBandwidth}
                        y={adjustedHeight - 5}
                        fill="black"
                        textAnchor="middle"
                      >*</text>
                    )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  numTicks={width < viewportCutoff ? 6 : null}
                  tickFormat={(monthNum) => monthMapping[monthNum]}
                  tickStroke="transparent"
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle',
                    transform: 'translate(0, 10)'
                  })}
                />
              </>
            )}
          </Group>
        </svg>
      </div>
    </>
  );
}

export default MonthChart;
