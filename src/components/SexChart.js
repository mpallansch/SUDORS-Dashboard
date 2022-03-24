import { useState, useEffect } from 'react'; 
import { Group } from '@visx/group';
import { Pie, Bar } from '@visx/shape';
import { Text } from '@visx/text';
import { AxisBottom } from '@visx/axis';
import { scaleLinear, scaleBand } from '@visx/scale';

import DataTable from './DataTable';
import Utils from '../shared/Utils';
import { rateCutoff, rateCutoffLabel, countCutoff } from '../constants.json';

import '../css/SexChart.css';

function SexChart(params) {
  const { data, dataRates, width, height, metric, state, colorScale, el, accessible } = params;
  
  const [ animated, setAnimated ] = useState(false);

  const margin = {top: 10, bottom: 30, left: metric === 'rate' ? 65 : 10, right: 10};
  const adjustedHeight = height - margin.top - margin.bottom;
  const adjustedWidth = width - margin.left - margin.right;
  const halfWidth = adjustedWidth / 2;
  const halfHeight = adjustedHeight / 2;
  const pieRadius = Math.min(halfWidth, halfHeight);
  const nfObject = new Intl.NumberFormat('en-US');

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
  }, [state, metric]);
  
  const caps = (string) => {
    return string.charAt(0).toUpperCase() + string.substring(1, string.length);
  };
  
  const xScale = scaleBand({
    range: [ 0, adjustedWidth ],
    domain: dataRates.sort((a,b) => (a.rate > b.rate) ? -1 : 1).map(d => caps(d.sex)),
    padding: 0.2
  });

  const yScale = scaleLinear({
    domain: [ 0, Math.max(...(dataRates).map(d => parseFloat(d.rate)))],
    range: [ 0, adjustedHeight - 35 ]
  });

  return width > 0 && (
    <svg 
      width={width}
      height={height}
      margin={{
        marginTop: margin.top,
        marginLeft: margin.left
      }}>
      {metric === 'rate' && (
        <Group top={margin.top} left={margin.left}>
          {data.map(d => {
            let rate = 0;
            if(dataRates) rate = parseFloat(dataRates[0].sex === d.sex.toLowerCase() ? dataRates[0].rate : dataRates[1].rate);

            return(
              <Group key={`bar-container-${d.sex}`}>
                { // render data bar
                d.count > rateCutoff && (
                  <path
                    className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                    style={{
                      'transition': animated ? 'transform 1s ease-in-out' : '',
                      'transformOrigin': `0px ${adjustedHeight}px`
                    }}
                    key={`bar-${d.sex}`}
                    d={Utils.verticalBarPath(xScale(d.sex), adjustedHeight - yScale(rate), xScale.bandwidth(), yScale(rate), xScale.bandwidth() * .1)}
                    fill={colorScale[d.sex]}
                    data-tip={`<strong>${d.sex}</strong><br/>
                    Deaths: ${d.count < countCutoff ? `< ${countCutoff}` : Number(d.count).toLocaleString()}<br/>
                    Percent: ${d.percent || 0}%<br/>
                    Age-adjusted rate: ${rate <= rateCutoff ? rateCutoffLabel : rate.toFixed(1)}`}
                  ></path>
                )}
                { // render suppressed bar
                d.count <= rateCutoff && (
                  <Bar 
                    className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                    style={{
                      'transition': animated ? 'transform 1s ease-in-out' : '',
                      'transformOrigin': `0px ${adjustedHeight}px`
                    }}
                    key={`bar-${d.sex}`}
                    x={xScale(d.sex)}
                    y={adjustedHeight - yScale(rate)}
                    width={xScale.bandwidth()}
                    height={yScale(rate)}
                    fill="black"
                  />
                )}
                <text
                  key={`bar-label-${d.sex}`}
                  x={xScale(d.sex) + xScale.bandwidth() / 2}
                  y={adjustedHeight - yScale(rate)}
                  textAnchor="middle"
                  dy={-15}
                >{d.count <= rateCutoff ? rateCutoffLabel : rate.toFixed(1)}</text>
              </Group>
            )}
          )}
          <AxisBottom
            top={adjustedHeight}
            scale={xScale}
          >
            {axisBottom => (
              <g className="visx-group visx-axis visx-axis-bottom">
                {axisBottom.ticks.map(tick => (
                    <g 
                      key={`tick-${tick.value}`}
                      className="visx-group visx-axis-tick">
                      <text key={`tick-label-${tick.value}`} textAnchor="middle" fontSize="medium">
                        <tspan x={tick.to.x} y={tick.to.y} dy="15">{tick.value}</tspan>
                      </text>
                    </g>
                  )
                )}
              </g>
            )}
          </AxisBottom>
        </Group>
      )}
      {metric !== 'rate' && (
        <Pie
          data={data}
          pieValue={d => d.percent}
          outerRadius={pieRadius}
          innerRadius={({data}) => {
            return pieRadius * .5
          }}
          color={d => d > 50 ? 'red' : 'blue'}
          padAngle={.05}
        >
          {(pie) => (
            <Group top={halfHeight} left={halfWidth}>
              {pie.arcs.map((arc, index) => {
                  const [ centroidX, centroidY ] = pie.path.centroid(arc);
                  let rate = 'Unavailable';
                  if(dataRates) rate = (dataRates[0].sex === arc.data.sex.toLowerCase() ? dataRates[0].rate : dataRates[1].rate);
                  if(arc.data.count <= rateCutoff) rate = rateCutoffLabel;

                  arc.data.rate = rate.toFixed ? rate.toFixed(1) : rate;
                  
                  return (
                    <g 
                      key={`arc-${index}`} 
                      className="animated-pie"
                    >
                      <path d={pie.path(arc)} 
                        className={`animated-pie-intro ${animated ? 'animated' : ''}`}
                        fill={colorScale[arc.data.sex]}
                        data-tip={`<strong>${arc.data.sex}</strong><br/>
                          Deaths: ${arc.data.count < countCutoff ? `< ${countCutoff}` : Number(arc.data.count).toLocaleString()}<br/>
                          Percent: ${arc.data.percent || 0}%<br/>
                          Age-adjusted rate: ${arc.data.count <= rateCutoff ? rateCutoffLabel : arc.data.rate}`}
                      />
                      <text
                        className={`animated-pie-text ${animated ? 'animated' : ''}`}
                        fill="white"
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize="medium"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {arc.data.percent}%
                      </text>
                    </g>
                  )
                }
              )}
            </Group>
          )}
        </Pie>
      )}
    </svg>
  );
}

export default SexChart;
