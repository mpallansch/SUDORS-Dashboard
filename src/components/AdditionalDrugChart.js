import { useEffect } from 'react';  
import * as d3 from 'd3';

import data from '../data/additional-drugs.json';

import '../css/AdditionalDrugChart.css';

function AdditionalDrugChart(params) {

  const { width, height } = params;
  const margin = {top: 10, left: 70, right: 20, bottom: 70};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const groups = data.map(d => d.cause);

  useEffect(() => {
    // Gets element reference
    let chartEl = d3.select('#additional-drug-chart');

    // Removes old SVG element
    chartEl.selectAll('*').remove();

    // Creates new SVG element
    let svg = chartEl.append('svg')
      .attr('width', width)
      .attr('height', height)
    .append('g')
      .attr('transform',
          'translate(' + margin.left + ', ' + margin.top + ')');;

    // X scale
    let x = d3.scaleBand()
      .domain(groups)
      .range([0, adjustedWidth])
      .padding([0.2]);

    // X axis
    svg.append('g')
      .attr('transform', 'translate(0,' + adjustedHeight + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', 'medium');
    svg.append('text')
    .style('text-anchor', 'middle')
    .attr('x', adjustedWidth / 2)
    .attr('y', height - 25)
    .text("Drug listed as cause of death");

    // Y scale
    let y = d3.scaleLinear()
      .domain([0, 100])
      .range([ adjustedHeight, margin.top ]);

    // Y axis
    svg.append('g')
      .call(d3.axisLeft(y)
        .tickValues([100, 75, 50, 25, 0])
        .tickFormat(num => num + '%'))
      .attr('font-size', 'medium');

    // Subgroups
    let xSubgroups = {};
    groups.forEach(group => {
      let subGroup = [...groups];
      subGroup.splice(subGroup.indexOf(group) , 1);
      xSubgroups[group] = d3.scaleBand()
        .domain(subGroup)
        .range([0, x.bandwidth()])
        .padding([0.05]);
    })

    // Color palette
    let color = d3.scaleOrdinal()
      .domain(groups)
      .range(['rgb(30, 23, 103)','rgb(113, 129, 167)','rgb(150, 160, 185)', 'rgb(108, 56, 111)', 'rgb(76, 140, 126)', 'rgb(132, 178, 170)']);

    // Begins adding elements to SVG
    svg.append('g')
      .selectAll('g')
      // Enter in data = loop group per group
      .data(data)
      .enter()
      .append('g')
        .attr('transform', d => 'translate(' + x(d.cause) + ',0)')
      .selectAll('rect')
      .data(d => groups.map(key => {return {cause: d.cause, key: key, value: d[key]}}))
      .enter().append('rect')
        .attr('x', d => xSubgroups[d.cause](d.key))
        .attr('y', d => y(d.value))
        .attr('width', d => xSubgroups[d.cause].bandwidth())
        .attr('height', d => adjustedHeight - y(d.value))
        .attr('fill', d => color(d.key));
  });

  return (
    <>
      <h2 id="additional-drug-chart-header"></h2>
      <div id="additional-drug-chart-legend">
        
      </div>
      <div id="additional-drug-chart"></div>
    </>
  );
}

export default AdditionalDrugChart;
