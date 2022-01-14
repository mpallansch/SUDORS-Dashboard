import { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/drug-combination.json';

import { countCutoff } from '../constants.json';

import '../css/DrugCombinationChart.css';
import DataTable from './DataTable';
import Utils from '../shared/Utils';

function DrugCombinationChart(params) {

  const viewportCutoff = 600;

  const [ animated, setAnimated ] = useState(false);

  const { width: rawWidth, height, state, el, accessible } = params;
  const data = raw[state].combinations;
  const width = Math.max(data.length * 110, rawWidth);
  const barPadding = 0.45;
  const margin = {top: 10, bottom: 200, left: rawWidth < viewportCutoff ? 175 : 280, right: 20};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const drugs = ['Illicitly manufactured fentanyls', 'Heroin', 'Prescription opioids', 'Cocaine', 'Methamphetamine'];
  const tableElHeight = margin.bottom / drugs.length - 5;
  const halfTableElHeight = tableElHeight / 2;

  const xScale = scaleBand({
    range: [ 0, adjustedWidth ],
    domain: data.map(d => d.drugCombination),
    padding: barPadding
  });

  const barOffset = xScale.bandwidth() * barPadding;
  const barWidth = xScale.bandwidth() * (1 + (barPadding * 2));
  const halfBarWidth = barWidth / 2;
  const quarterBarWidth = halfBarWidth / 2;
  const halfXBandwidth = xScale.bandwidth() / 2;

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.percent))],
    range: [ adjustedHeight - 60, 0 ]
  });

  const colors = {
    'Any Opioids': 'rgb(58, 88, 161)',
    'Methamphetamine': 'rgb(75, 131, 13)',
    'Heroin': 'rgb(251, 171, 24)',
    'Prescription opioids': 'rgb(0, 124, 145)',
    'Cocaine': 'rgb(0, 105, 92)',
    'Illicitly manufactured fentanyls': 'rgb(187, 77, 0)'
  };

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

  const listDrugs = (drugCombination) => {
    let drugCombinationNames = [];
    for(let i = 0; i < drugCombination.length; i++){
      if(drugCombination.charAt(i) === '1') {
        if(width < viewportCutoff){
          if(drugs[i] === 'Illicitly manufactured fentanyls'){
            drugCombinationNames.push('IMFs');
          } else if(drugs[i] === 'Prescription opioids'){
            drugCombinationNames.push('Rx Opioids');
          } else if(drugs[i] === 'Methamphetamine') {
            drugCombinationNames.push('Meth');
          } else {
            drugCombinationNames.push(drugs[i]);
          }
        } else {
          drugCombinationNames.push(drugs[i]);
        }
      }
    }
    
    return [
      drugCombinationNames.slice(0, -1).join(', '), 
      drugCombinationNames.slice(-1)[0]
    ].join(drugCombinationNames.length < 2 ? '' : 
      drugCombinationNames.length === 2 ? ' and ' : ', and ')
  };

  let labelOverrides = {};

  data.forEach(d => labelOverrides[d.drugCombination] = listDrugs(d.drugCombination));

  return width > 0 && (
    <>
      <div id="drug-combination-chart">
        {accessible ? (
            <DataTable 
              data={data}
              xAxisKey={'drugCombination'}
              labelOverrides={labelOverrides}
            />
          ) : (
            <>
              <div id="horizontal-scroll">
                <svg width={width} height={height}>
                  <Group top={margin.top} left={margin.left}>
                    {data.map((d, i) => (
                        <Group key={`group-${d.drugCombination}`}>
                          <path
                            key={`cause-bar-${d.drugCombination}`}
                            className={`animated-bar vertical ${animated ? 'animated' : ''}`}
                            style={{
                              'transition': animated ? 'transform 1s ease-in-out' : '',
                              'transformOrigin': `0px ${adjustedHeight}px`
                            }}
                            d={Utils.verticalBarPath(xScale(d.drugCombination), yScale(d.percent), halfBarWidth, adjustedHeight - Math.min(yScale(d.percent), adjustedHeight), barWidth * .25)}
                            fill="rgb(77,126,119)"
                            data-tip={d.deaths <= countCutoff ? '* Data suppressed' : `Percent: ${d.percent.toFixed(1)}%<br/>
                            Deaths: ${d.deaths}`}
                          ></path>
                          <Text
                            x={xScale(d.drugCombination) + halfXBandwidth}
                            y={yScale(d.percent)}
                            dy={35}
                            style={{
                              pointerEvents: 'none'
                            }}
                            transform={barWidth > 100 ? '' : `rotate(-90, ${xScale(d.drugCombination) + halfXBandwidth}, ${yScale(d.percent)})`}
                            fill="white"
                            textAnchor="middle"
                            verticalAnchor="middle"
                            fontSize="medium"
                            fontWeight="bold">
                            {`${d.deaths <= countCutoff ? '*' : (d.percent.toFixed(1) + '%')}`}
                          </Text>
                          {drugs.map((drug, j) => (
                            <Group key={`${d.drugCombination}-${drug}`}>
                              <rect 
                                x={xScale(d.drugCombination) - barOffset} 
                                y={adjustedHeight + (tableElHeight * j)} 
                                width={barWidth} 
                                height={tableElHeight} 
                                stroke="rgb(77,126,119)" 
                                fill="white"/>
                              {d.drugCombination.charAt(j) === '1' && (
                                <circle
                                  cx={xScale(d.drugCombination) + halfXBandwidth}
                                  cy={adjustedHeight + halfTableElHeight + (tableElHeight * j)}
                                  r={7}
                                  fill={colors[drug]}
                                ></circle>
                              )}
                              {i === data.length - 1 && (
                                <line
                                  x1={xScale(d.drugCombination) - barOffset + barWidth}
                                  x2={xScale(d.drugCombination) - barOffset + barWidth}
                                  y1={adjustedHeight + (tableElHeight * j)}
                                  y2={adjustedHeight + (tableElHeight * j) + tableElHeight}
                                  strokeWidth="3px"
                                  stroke="rgb(77,126,119)"
                                ></line>
                              )}
                              {j === 0 && (
                                <line
                                  x1={xScale(d.drugCombination) - barOffset}
                                  x2={xScale(d.drugCombination) - barOffset + barWidth}
                                  y1={adjustedHeight + (tableElHeight * j)}
                                  y2={adjustedHeight + (tableElHeight * j)}
                                  strokeWidth="3px"
                                  stroke="rgb(77,126,119)"
                                ></line>
                              )}
                              {j === drugs.length - 1 && (
                                <line
                                  x1={xScale(d.drugCombination) - barOffset}
                                  x2={xScale(d.drugCombination) - barOffset + barWidth}
                                  y1={adjustedHeight + (tableElHeight * j) + tableElHeight}
                                  y2={adjustedHeight + (tableElHeight * j) + tableElHeight}
                                  strokeWidth="3px"
                                  stroke="rgb(77,126,119)"
                                ></line>
                              )}
                            </Group>
                          ))}
                        </Group>
                      )
                    )}
                  </Group>
                </svg>
              </div>
              <svg id="table-header" width={margin.left + xScale(data[0].drugCombination) - quarterBarWidth} height={height}>
                <Group top={adjustedHeight + margin.top} left={xScale(data[0].drugCombination) - quarterBarWidth}>
                  {drugs.map((drug, i) => {
                      const y = i * tableElHeight;
                      const width = margin.left + 7;

                      return (
                        <Group key={`drug-label-${drug}`}>
                          <rect 
                            x={0} 
                            y={y} 
                            width={width} 
                            height={tableElHeight} 
                            stroke="rgb(77,126,119)" 
                            fill="white"
                          />
                          <Text 
                            x={5} 
                            y={y + halfTableElHeight} 
                            width={width} 
                            height={tableElHeight} 
                            fill={colors[drug]}
                            textAnchor="start" 
                            dominantBaseline="middle"
                            fontWeight="bold">
                              {rawWidth < viewportCutoff && drug === 'Illicitly manufactured fentanyls' ? 'IMFs' : drug}
                          </Text>
                        </Group>
                    )})}
                    <rect
                      x={0}
                      y={0}
                      width={margin.left + 10}
                      height={margin.bottom - 25}
                      stroke="rgb(77,126,119)"
                      strokeWidth="3px"
                      fill="transparent"
                    ></rect>
                  </Group>
              </svg>
            </>
          )
        }
      </div>
    </>
  );
}

export default DrugCombinationChart;
