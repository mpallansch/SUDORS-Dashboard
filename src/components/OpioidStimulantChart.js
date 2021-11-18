import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';

import raw from '../data/opioid-stimulant.json';

import { countCutoff } from '../constants.json';

import '../css/OpioidStimulantChart.css'; 

const rad2Deg = Math.PI / 180.0;
const twoPi = 2 * Math.PI;

const pointOnArc = (center, R, angle) => {
  var radians = (angle - 90) * rad2Deg;

  return [center[0] + R * Math.cos(radians), center[1] + R * Math.sin(radians)];
};

const arc = (center, R, start, end, w, corner) => {
  let points = void 0;

  let innerR = R - w;
  let circumference = Math.abs(end - start);
  corner = Math.min(w / 2, corner);

  if (360 * (corner / (Math.PI * (R - w))) > Math.abs(start - end)) {
    corner = circumference / 360 * innerR * Math.PI;
  }

  // inner and outer radiuses
  let innerR2 = innerR + corner;
  let outerRadius = R - corner;

  // butts corner points
  let oStart = pointOnArc(center, outerRadius, start);
  let oEnd = pointOnArc(center, outerRadius, end);

  let iStart = pointOnArc(center, innerR2, start);
  let iEnd = pointOnArc(center, innerR2, end);

  let iSection = 360 * (corner / (twoPi * innerR));
  let oSection = 360 * (corner / (twoPi * R));

  // arcs endpoints
  let iArcStart = pointOnArc(center, innerR, start + iSection);
  let iArcEnd = pointOnArc(center, innerR, end - iSection);

  let oArcStart = pointOnArc(center, R, start + oSection);
  let oArcEnd = pointOnArc(center, R, end - oSection);

  let arcSweep1 = circumference > 180 + 2 * oSection ? 1 : 0;
  let arcSweep2 = circumference > 180 + 2 * iSection ? 1 : 0;

  points = [
  // begin path
  "M", oStart[0], oStart[1],
  // outer start corner
  "A", corner, corner, 0, 0, 1, oArcStart[0], oArcStart[1],
  // outer main arc
  "A", R, R, 0, arcSweep1, 1, oArcEnd[0], oArcEnd[1],
  // outer end corner
  "A", corner, corner, 0, 0, 1, oEnd[0], oEnd[1],
  // end butt
  "L", iEnd[0], iEnd[1],
  // inner end corner
  "A", corner, corner, 0, 0, 1, iArcEnd[0], iArcEnd[1],
  // inner arc
  "A", innerR, innerR, 0, arcSweep2, 0, iArcStart[0], iArcStart[1],
  // inner start corner
  "A", corner, corner, 0, 0, 1, iStart[0], iStart[1], "Z" // end path
  ];

  return points.join(' ');
};

function OpioidStimulantChart(params) {

  const viewportCutoff2 = 450;
  const viewportCutoff1 = 350;

  const { width, height, state } = params;
  const textSize = width < viewportCutoff2 ? (width < viewportCutoff1 ? 200 : 225) : 320;
  const data = raw[state];
  const keys = Object.keys(data[0]).filter(key => key.indexOf('Percent') !== -1);
  const remaining = width - textSize;
  const radius = Math.min(remaining, (height / 2));
  const padding = (remaining - radius) / 2;

  const comboScale = scaleBand({
    range: [ (radius / 4), radius ],
    domain: keys.sort((a, b) => {
      if(data[0][a] < data[0][b]){
        return -1;
      } else if(data[0][a] > data[0][b]){
        return 1;
      } else {
        return 0;
      }
    }),
    padding: 0.5
  });

  const curveScale = scaleLinear({
    domain: [ 0, 100 ],
    range: [ comboScale.bandwidth() * 2, 270 ]
  });

  const colorScale = scaleOrdinal({
    domain: keys,
    range: ['rgb(58, 88, 161)', 'rgb(116,148,194)', '#88c3ea', 'rgb(220,237,201)']
  })

  return width > 0 && (
    <>
      <div id="cause-chart">
        <svg width={width} height={height}>
          {keys.map(key => {
            const name = data[0][key.replace('Percent', 'Name')];
            const rawCount = data[0][key.replace('Percent', 'Count')];
            const rawPercent = data[0][key];

            let count, percent;
            if(rawCount <= countCutoff){
              count = '< ' + countCutoff;
              percent = '< ' + rawPercent.toFixed(1)
            } else {
              count = rawCount;
              percent = rawPercent.toFixed(1);
            }

            return (
              <Group key={key}>
                <Text 
                  x={padding + textSize - 10} 
                  y={(height / 2) - comboScale(key)} 
                  verticalAnchor="start" 
                  textAnchor="end"
                  fontSize={width < viewportCutoff2 ? '0.85em' : '1.05em'}
                  style={{
                    transformOrigin: `${padding + textSize - 10}px ${(height / 2) - comboScale(key)}px`,
                    transform: `rotate(${width < viewportCutoff1 ? '-30' : '0'}deg)`
                  }}>
                    {`${name} - ${percent}%`}
                </Text>
                <path 
                  d={arc([padding + textSize, (height / 2)], comboScale(key), 0, curveScale(rawPercent), comboScale.bandwidth(), comboScale.bandwidth() / 2)} 
                  fill={colorScale(key)}
                  data-tip={`<strong>${name}</strong><br/>
                  Percent: ${percent}<br/>
                  Deaths: ${count}`}/>
              </Group>
            )
          })}
        </svg>
      </div>
    </>
  );
}

export default OpioidStimulantChart;
