import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';
import { scaleBand, scaleLinear } from '@visx/scale';

import raw from '../data/drug-combination.json';

import { countCutoff } from '../constants.json';

import '../css/DrugCombinationChart.css';

function DrugCombinationChart(params) {

  const { width: rawWidth, height, state } = params;
  const data = raw[state].combinations;
  const illicitValue = raw[state].illicit;
  const width = Math.max(data.length * 55, rawWidth);
  const barPadding = 0.45;
  const margin = {top: 20, bottom: 200, left: 140, right: 0};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const drugs = ['IMFs', 'Heroin', 'Rx Opioids', 'Cocaine', 'Meth'];
  const tableElHeight = margin.bottom / drugs.length - 5;
  const halfTableElHeight = tableElHeight / 2;
  const quarterTableElHeight = halfTableElHeight / 2;

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
    range: [ adjustedHeight, 0 ]
  });

  return width > 0 && (
    <>
      <div id="cause-chart">
        <div id="horizontal-scroll">
          <svg width={width} height={height}>
            <Group top={margin.top} left={margin.left}>
              {data.map(d => (
                  <Group key={`group-${d.drugCombination}`}>
                    <Bar
                      key={`cause-bar-${d.drugCombination}`}
                      x={xScale(d.drugCombination)}
                      y={yScale(d.percent)}
                      width={xScale.bandwidth()}
                      height={adjustedHeight - yScale(d.percent)}
                      fill="rgb(58, 88, 161)"
                      data-tip={`Percent: ${d.deaths <= countCutoff ? '< ' + d.percent.toFixed(1) : d.percent.toFixed(1)}%<br/>
                      Deaths: ${d.deaths <= countCutoff ? `< ${countCutoff}` : d.deaths}`}
                    />
                    <text
                      x={xScale(d.drugCombination) + (xScale.bandwidth() / 2)}
                      y={yScale(d.percent)}
                      dy={-5}
                      textAnchor="middle"
                      fontSize="small">
                      {d.deaths <= countCutoff ? '<' + d.percent.toFixed(1) : d.percent.toFixed(1)}%
                    </text>
                    {drugs.map((drug, i) => (
                      <>
                        <rect 
                          x={xScale(d.drugCombination) - barOffset} 
                          y={adjustedHeight + (tableElHeight * i)} 
                          width={barWidth} 
                          height={tableElHeight} 
                          stroke="lightgray" 
                          fill="white"/>
                        {d.drugCombination.charAt(i) === '1' && (
                          <rect
                            x={xScale(d.drugCombination) + halfXBandwidth - barOffset} 
                            y={adjustedHeight + quarterTableElHeight + (tableElHeight * i)} 
                            width={halfBarWidth} 
                            height={halfTableElHeight}
                            fill="rgb(58, 88, 161)"
                          />
                        )}
                      </>
                    ))}
                  </Group>
                )
              )}
            </Group>
          </svg>
        </div>
        <svg id="table-header" width={margin.left + xScale(data[0].drugCombination) - quarterBarWidth} height={height}>
          <Text
            x={margin.left / 2} 
            y={10} 
            width={margin.left}
            verticalAnchor="start"
            textAnchor="middle"
            fontSize="xx-large"
          >{`${illicitValue.toFixed(1)}%`}</Text>
          <Text 
            x={5} 
            y={50} 
            width={margin.left}
            verticalAnchor="start">of drug overdose deaths involved one or more illicit drugs</Text>
          {illicitValue.toFixed(1)}%
          <Group top={adjustedHeight + margin.top} left={xScale(data[0].drugCombination) - quarterBarWidth}>
            {drugs.map((drug, i) => {
                const y = i * tableElHeight;
                const width = margin.left + 7;

                return (
                  <>
                    <rect 
                      x={0} 
                      y={y} 
                      width={width} 
                      height={tableElHeight} 
                      stroke="lightgray" 
                      fill="white"
                    />
                    <Text 
                      x={margin.left / 2} 
                      y={y + halfTableElHeight} 
                      width={width} 
                      height={tableElHeight} 
                      textAnchor="middle" 
                      dominantBaseline="middle">
                        {drug}
                    </Text>
                  </>
              )})}
            </Group>
        </svg>
      </div>
    </>
  );
}

export default DrugCombinationChart;
