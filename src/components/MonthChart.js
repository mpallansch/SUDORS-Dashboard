import { useState, useEffect } from 'react';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear } from '@visx/scale';

import DataTable from './DataTable';
import Utils from '../shared/Utils';
import { countCutoff } from '../constants.json';

import '../css/MonthChart.css';

let monthMappingFull = {
  '1': 'January',
  '2': 'February',
  '3': 'March',
  '4': 'April',
  '5': 'May',
  '6': 'June',
  '7': 'July',
  '8': 'August',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '0': 'December'
};

let monthMapping = {
  '1': 'Jan',
  '2': 'Feb',
  '3': 'Mar',
  '4': 'Apr',
  '5': 'May',
  '6': 'Jun',
  '7': 'Jul',
  '8': 'Aug',
  '9': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '0': 'Dec'
};

const quarterMapping = {
  '0': 'Jan-March',
  '1': 'Apr-Jun',
  '2': 'Jul-Sept',
  '3': 'Oct-Dec'
}

function MonthChart(params) {

  const viewportCutoff = 600;

  const { data, maxes, year, width, height, header, colorScale, el, accessible, overallMax } = params;
  const [ animated, setAnimated ] = useState(false);

  const dataMonth = data.month;
  const dataQuarter = data.quarter;
  const monthNumMax = Math.max(...data.month.map(datum => datum.month));
  const margin = {top: 10, bottom: (header ? 10 : 50), left: (header ? 0 : 90), right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const quarterKey = 'quarter';

  for(let i = 12; i <= monthNumMax; i++){
    monthMapping[i] = monthMapping[i % 12];
    monthMappingFull[i] = monthMappingFull[i % 12];
  }

  const labelOverrides = {'value': 'Number of deaths', 'month': 'Month of death'};

  dataMonth.sort((a,b) => {
    if(a.month < b.month) return -1;
    if(b.month < a.month) return 1;
    return 0;
  });

  const xScale = scaleBand({
    domain: header ? dataQuarter.map(d => d[quarterKey]) : dataMonth.map(d => d.month),
    range: [ header ? 5 : 0, adjustedWidth ],
    padding: header ? 0 : 0.35
  });

  const getScaleMax = (max) => {
    if(max <= 100){
      return 100;
    }
    if(max <= 350){
      return 350;
    }
    if(max <= 1000){
      return 1000;
    }
    return Math.ceil(overallMax / 1000) * 1000;
  };

  const max = header ? maxes.quarter : maxes.month;
  const scaleMax = getScaleMax(max);

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [ 0, header ? max * 1.3 : scaleMax]
  });

  const halfBandwidth = xScale.bandwidth() / 2;
  const quarterBandwidth = halfBandwidth / 2;
  const halfHeight = adjustedHeight / 2;
  const quarterHeight = halfHeight / 2;

  const onScroll = () => {
    if(el.current && !animated && window.scrollY + window.innerHeight > el.current.getBoundingClientRect().top - document.body.getBoundingClientRect().top){
      window.removeEventListener('scroll', onScroll);
      setAnimated(true);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 50); // eslint-disable-next-line
  }, []);

  return width > 0 && 
    (accessible) ? (
      <DataTable
        data={dataMonth}
        xAxisKey={'month'}
        labelOverrides={{...labelOverrides, ...monthMappingFull}}
        caption={'Drug deaths by month'}
      />
    ) : (
      <div id="month-chart">
        <svg width={width} height={height}>
        
          <Group top={margin.top} left={margin.left}>
            {header && (
              <>
                {dataQuarter.map(d => (
                    <Group key={`point-${d[quarterKey]}`}>
                      <circle
                        r={3}
                        cx={xScale(d[quarterKey])}
                        cy={yScale(d.value)}
                        fill="#712177"
                      />
                      <rect
                        x={xScale(d[quarterKey]) - quarterBandwidth}
                        y={Math.max(0, yScale(d.value) - quarterHeight)}
                        width={halfBandwidth}
                        height={halfHeight}
                        fill="transparent"
                        data-tip={`<strong>${quarterMapping[d[quarterKey]]} ${year}</strong><br/>Deaths: ${Number(d.value).toLocaleString()}`}
                      />
                    </Group>
                ))} 
                <LinePath 
                  data={dataQuarter}
                  x={d => xScale(d[quarterKey])}
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
                  numTicks={6}
                  tickLabelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'end',
                    transform: 'translate(-5, 5)'
                  })}
                  labelProps={() => ({
                    fontSize: 'medium',
                    textAnchor: 'middle'
                  })}
                  labelOffset={60}
                />
                <text x={adjustedHeight / -2} y={-65} textAnchor="middle" transform="rotate(-90)">Count <tspan baselineShift="super" dominantBaseline="auto">†</tspan></text>

                {dataMonth.map(d => (
                  <Group key={`group-${d.month}`} className="animate-bars">
                    {d.value >= countCutoff && (
                      <path
                        key={`cause-bar-${d.month}`}
                        className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                        style={{
                          'transition': animated ? 'transform 1s ease-in-out' : '',
                          'transformOrigin': `0px ${adjustedHeight}px`
                        }}
                        d={Utils.verticalBarPath(xScale(d.month), yScale(d.value), xScale.bandwidth(), adjustedHeight - yScale(d.value), xScale.bandwidth() * .1)}
                        fill={colorScale['Month']}
                        data-tip={`<strong>${monthMappingFull[d.month]}</strong><br/>Deaths: ${Number(d.value).toLocaleString()}`}
                      ></path>
                    )}
                    {d.value < countCutoff && (
                      <text
                        x={xScale(d.month) + halfBandwidth}
                        y={adjustedHeight - 5}
                        fill="black"
                        textAnchor="middle"
                        cursor="default"
                        data-tip="*Data suppressed"
                      >*</text>
                    )}
                  </Group>
                ))}

                <AxisBottom
                  top={adjustedHeight}
                  scale={xScale}
                  tickValues={width < viewportCutoff ? (year === '2021' ? ['61', '64', '68', '72'] : ['49', '52', '56', '60']) : null}
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
	      {!header && <p className="scale-note"><sup>†</sup> Scale of the chart may change based on the data presented</p>}
      </div>
    );
}

export default MonthChart;
