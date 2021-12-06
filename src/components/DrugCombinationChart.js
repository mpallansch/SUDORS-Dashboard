import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/drug-combination.json';

import { countCutoff } from '../constants.json';

import '../css/DrugCombinationChart.css';

function DrugCombinationChart(params) {

  const viewportCutoff = 600;

  const { width: rawWidth, height, state } = params;
  const data = raw[state].combinations;
  const width = Math.max(data.length * 110, rawWidth);
  const barPadding = 0.45;
  const margin = {top: 40, bottom: 200, left: rawWidth < viewportCutoff ? 175 : 280, right: 0};
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
  const radius = quarterBarWidth / 2;
  const halfXBandwidth = xScale.bandwidth() / 2;

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.percent))],
    range: [ adjustedHeight - 35, 0 ]
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
        <div id="horizontal-scroll">
          <svg width={width} height={height}>
            <Group top={margin.top} left={margin.left}>
              {data.map((d, i) => (
                  <Group key={`group-${d.drugCombination}`}>
                    <Bar
                      key={`cause-bar-${d.drugCombination}`}
                      x={xScale(d.drugCombination) + radius}
                      y={yScale(d.percent)}
                      width={quarterBarWidth}
                      height={adjustedHeight - Math.min(yScale(d.percent), adjustedHeight)}
                      fill="rgb(77,126,119)"
                      data-tip={`Percent: ${d.deaths <= countCutoff ? '< ' + d.percent.toFixed(1) : d.percent.toFixed(1)}%<br/>
                      Deaths: ${d.deaths <= countCutoff ? `< ${countCutoff}` : d.deaths}`}
                    />
                    <circle
                      cx={xScale(d.drugCombination) + quarterBarWidth}
                      cy={yScale(d.percent)}
                      r={radius}
                      fill="rgb(77,126,119)"
                      style={{
                        pointerEvents: 'none'
                      }}
                    ></circle>
                    <Text
                      x={xScale(d.drugCombination) + halfXBandwidth}
                      y={yScale(d.percent)}
                      dy={15}
                      style={{
                        transformOrigin: `${xScale(d.drugCombination) + halfXBandwidth}px ${yScale(d.percent)}px`,
                        transform: 'rotate(-90deg)',
                        pointerEvents: 'none'
                      }}
                      fill="white"
                      textAnchor="middle"
                      verticalAnchor="middle"
                      fontSize="small"
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
                      x={margin.left / 2} 
                      y={y + halfTableElHeight} 
                      width={width} 
                      height={tableElHeight} 
                      fill={colors[drug]}
                      textAnchor="middle" 
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
      </div>
    </>
  );
}

export default DrugCombinationChart;
