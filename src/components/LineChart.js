import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { scaleLinear, scaleBand } from '@visx/scale';
import { curveLinear } from '@visx/curve'; 

import raw from '../data/time.json';

import '../css/LineChart.css';

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

function LineChart(params) {
  
  const { width, height, state, header } = params;

  const data = raw[state];

  const margin = {top: 10, bottom: (header ? 10 : 50), left: (header ? 0 : 60), right: 0};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const incrementWidth = adjustedWidth / data.length;

  const xScale = scaleBand({
    domain: data.map(d => d.month),
    range: [ 0, adjustedWidth ],
    padding: 0.2
  });

  const yScale = scaleLinear({
    range: [ adjustedHeight, 0 ],
    domain: [0, Math.max(...data.map(d => d.value))]
  });

  return width > 0 && (
    <>
      <svg
        id="header-line-chart" 
        width={width} 
        height={height}>
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
          {!header && (
            <>
              {data.map((d, i) => (
                <rect 
                  key={`click-area-${d.month}`}
                  x={i * (incrementWidth)} 
                  y={0} 
                  width={incrementWidth} 
                  height={adjustedHeight}
                  fill="transparent"
                  data-tip={`${monthMapping[d.month]}: ${d.value}`} />
                )
              )}
            </>
          )}
          <LinePath
            className={`line`}
            curve={curveLinear}
            data={data}
            x={d => xScale(d.month)}
            y={d => yScale(d.value)}
            stroke={header ? '#712177' : 'rgb(58, 88, 161)'}
            strokeWidth={3}
            style={{pointerEvents: 'none'}}
          />
          {!header && (
            <AxisBottom
              scale={xScale} 
              top={adjustedHeight}
              numTicks={6}
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
    </>
  );
}

export default LineChart;
