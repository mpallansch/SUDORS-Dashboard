import { useEffect } from 'react';  
import * as d3 from 'd3';

import data from '../data/type-of-drug.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const { width, height } = params;
  const margin = 50;
  const doubleMargin = margin * 2;
  const adjustedWidth = width + doubleMargin;
  const adjustedHeight = height + doubleMargin;

  useEffect(() => {
    // Gets element reference
    let chartEl = d3.select('#cause-chart');

    // Removes old SVG element
    chartEl.selectAll('*').remove();

    // Creates new SVG element
    let svg = chartEl.append('svg')
      .attr('width', adjustedWidth)
      .attr('height', adjustedHeight)
    .append('g')
      .attr('transform',
          'translate(' + margin + ', ' + margin + ')');;

    // X scale
    let x = d3.scaleBand()
      .range([ 0, width - doubleMargin ])
      .domain(data.map(d => d.opioid))
      .padding(0.2);
    let xHalfBandwidth = x.bandwidth() / 2;

    // X axis
    svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', 'medium');

    // Y scale
    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([ height, 0]);

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y)
        .tickValues([100, 75, 50, 25, 0])
        .tickFormat(num => num + '%'))
      .attr('font-size', 'medium');

    // Begins adding elements to SVG
    let bars = svg.selectAll('mybar')
      .data(data)
      .enter();

    // Adds bars
    bars.append('rect')
        .attr('x', d => x(d.opioid))
        .attr('y', d => y(d.present))
        .attr('width', x.bandwidth())
        .attr('height', d => height - y(d.present))
        .attr('fill', 'rgb(198, 209, 230)');

    // Adds circles
    bars.append('circle')
        .attr('cx', d => x(d.opioid) + xHalfBandwidth)
        .attr('cy', d => y(d.cause))
        .attr('r', 5)
        .attr('fill', 'rgb(58, 88, 161)');

    // Adds line
    let lineFunc = d3.line()
      .x(d => x(d.opioid) + xHalfBandwidth)
      .y(d => y(d.cause));
    svg.append('path')
      .attr('d', lineFunc(data))
      .attr('stroke-width', '3')
      .attr('stroke', 'rgb(58, 88, 161)')
      .attr('fill', 'none');
  });

  return (
    <>
      <h2 id="cause-chart-header">What drugs<sup>1</sup> were identified?</h2>
      <div id="cause-chart-legend">
        <span><svg id="present-indicator"><rect width="100%" height="100%" fill="rgb(198, 209, 230)" /></svg>% with drug present</span>
        <span><svg id="cause-indicator" viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="rgb(58, 88, 161)"></circle><line x1="0" x2="100" y1="50" y2="50" stroke-width="25" stroke="rgb(58, 88, 161)"/></svg>% with drug listed as cause of death</span>
      </div>
      <div id="cause-chart"></div>
    </>
  );
}

export default CauseChart;
