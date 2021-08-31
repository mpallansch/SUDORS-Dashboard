import { useEffect } from 'react';  
import * as d3 from 'd3';

import data from '../data/causes.json';

import '../css/CauseChart.css';

function CauseChart(params) {

  const { width, height } = params;
  const margin = {top: 10, left: 70, right: 20, bottom: 70};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .range([ 0, adjustedWidth ])
    .domain(data.map(d => d.opioid))
    .padding(0.2);
  const xHalfBandwidth = x.bandwidth() / 2;

  // Y scale
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([ adjustedHeight, margin.top ]);

  useEffect(() => {
    // Gets element reference
    let chartEl = d3.select('#cause-chart');

    // Removes old SVG element
    chartEl.selectAll('*').remove();

    // Creates new SVG element
    let svg = chartEl.append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
        .attr('transform',
            'translate(' + margin.left + ', ' + margin.top + ')');;

    // X axis
    svg.append('g')
      .call(xAxis);

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y)
        .tickValues([100, 75, 50, 25, 0])
        .tickFormat(num => num + '%'))
      .attr('font-size', 'medium');

    // Begins adding elements to SVG
    let bars = svg.selectAll('bar')
      .data(data)
      .enter();

    // Adds bars
    bars.append('rect')
        .attr('x', d => x(d.opioid))
        .attr('y', d => y(d.present))
        .attr('width', x.bandwidth())
        .attr('height', d => adjustedHeight - y(d.present))
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
      .attr('class','line-chart')
      .attr('d', lineFunc(data))
      .attr('strokeWidth', '3')
      .attr('stroke', 'rgb(58, 88, 161)')
      .attr('fill', 'none');
  });

  const xAxis = (g) => {
    return g.attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + adjustedHeight + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', 'medium');
  };

  const selectChange = (e) => {
    let svg = d3.select('#cause-chart svg');
    let gx = svg.select('.x-axis');
    let bar = svg.selectAll('rect');
    let circle = svg.selectAll('circle');
    let path = svg.selectAll('.line-chart');

    x.domain(data.sort((a, b) => {
      if(e.target.value === 'Descending'){
        if(a.present < b.present){
          return 1;
        } else if(b.present < a.present) {
          return -1;
        } else {
          return 0;
        }
      } else {
        if(a.present > b.present){
          return 1;
        } else if(b.present > a.present) {
          return -1;
        } else {
          return 0;
        }
      }
    }).map(d => d.opioid));

    const t = svg.transition()
        .duration(750);

    bar.data(data, d => d.opioid)
        .order()
      .transition(t)
        .delay((d, i) => i * 20)
        .attr("x", d => x(d.opioid));

    circle.data(data, d => d.opioid)
        .order()
      .transition(t)
        .delay((d, i) => i * 20)
        .attr("cx", d => x(d.opioid) + xHalfBandwidth);

    let lineFunc = d3.line()
      .x(d => x(d.opioid) + xHalfBandwidth)
      .y(d => y(d.cause));
    path
      .attr('opacity', '0')
      .attr('d', lineFunc(data))
      .transition(t)
        .attr('opacity', '1');

    gx.transition(t)
        .call(xAxis)
      .selectAll(".tick")
        .delay((d, i) => i * 20);
  };

  return (
    <>
      <select onChange={selectChange}>
        <option>Descending</option>
        <option>Ascending</option>
      </select>
      <div id="cause-chart"></div>
    </>
  );
}

export default CauseChart;
