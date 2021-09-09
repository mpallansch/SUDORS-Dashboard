import React, { useState } from 'react';
import { Group } from '@visx/group';
import { AlbersUsa } from '@visx/geo';
import { scaleQuantize } from '@visx/scale';
import * as topojson from 'topojson-client';
import topology from '../geo/usa-topo.json';
import abbreviations from '../geo/abbreviations.json';

import data from '../data/map.json';

import '../css/Map.css';

function Map(params) {

  const [ compare, setCompare ] = useState('all');

  const { width, height, setState } = params;
  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom - 100;
  const smallWidth = (adjustedWidth - ((margin.left + margin.right) * 2)) / 2 - 10;
  const smallHeight = (adjustedHeight - ((margin.top + margin.bottom) * 6)) / 2 - 30;

  const unitedStates = topojson.feature(topology, topology.objects.states).features;
  const colorsPalettes = {
    'All': ["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"],
    'Heroin': ['#82E0AA', '#58D68D', '#2ECC71', '#2ECC71', '#28B463'],
    'IMFs': ['#F0B27A','#E59866','#E67E22','#CA6F1E','#A04000'],
    'Benzos': ['#D2B4DE','#A569BD','#8E44AD','#6C3483','#5B2C6F'],
    'Rx Opioids': ['#F5B7B1','#F1948A','#EC7063','#E74C3C','#B03A2E'],
    'Meth': ['#AEB6BF','#5D6D7E','#34495E','#2E4053','#212F3C']
  };

  const map = (small, drug) => {
    const mapWidth = small ? smallWidth : adjustedWidth;
    const mapHeight = small ? smallHeight : adjustedHeight;
    const legendSize = small ? 10 : 25;

    const centerX = mapWidth / 2;
    const centerY = mapHeight / 2 - 5;
    const scale = Math.min(mapWidth * 1.3, mapHeight * 1.8);

    const colors = colorsPalettes[drug];
    const colorsReverse = [...colors].reverse();

    const colorScale = scaleQuantize({
      domain: [data[drug].min, data[drug].max],
      range: colors
    });

    return (
      <div className="inline-map-container">
        <div className="map-header">
          <span>{small ? drug : ''}</span>
        </div>
        <svg 
          width={mapWidth}
          height={mapHeight} 
          style={{
            marginTop: margin.top, 
            marginLeft: margin.left,
            marginRight: margin.right,
            marginBottom: margin.bottom
          }}>
          <AlbersUsa
            data={unitedStates}
            scale={scale}
            translate={[centerX, centerY]}
          >
            {({ features }) => 
                features.map(({ feature, path }, i) => {
                  const state = abbreviations[feature.properties.iso.replace(/US-/g,'')];
                  const deaths = data[drug][state].deaths;

                  return (
                    <React.Fragment key={`map-feature-${i}`}>
                      <path
                        key={`map-feature-${i}`}
                        d={path || ''}
                        fill={colorScale(deaths)}
                        stroke={'black'}
                        strokeWidth={0.5}
                        onClick={() => {setState(state)}}
                      />
                    </React.Fragment>
                  );
                })
              }
          </AlbersUsa>
          <Group>
            {colorsReverse.map((color, i) => (
              <rect key={`color-indicator-${drug}-${i}`} x={mapWidth - (i * legendSize) - 50} y={mapHeight - legendSize} width={legendSize} height={legendSize} fill={color}></rect>
            ))}
          </Group>
        </svg>
      </div>
    )
  };

  return width > 0 && (
    <>
      <div className="compare-buttons">
        <button className={`${compare === 'all' && 'active'}`} onClick={() => setCompare('all')}>All Substances</button> | 
        <button className={`${compare === 'compare' && 'active'}`} onClick={() => setCompare('compare')}>Compare Substances</button>
      </div>
      <div className="block-shadow">
        {compare === 'all' ?
          map(false, 'All')
        : (
          <>
            {map(true, 'All')}
            {map(true, 'Heroin')}
            {map(true, 'IMFs')}
            {map(true, 'Benzos')}
            {map(true, 'Rx Opioids')}
            {map(true, 'Meth')}
          </>
        ) }
      </div>
    </>
  );
}

export default Map;
