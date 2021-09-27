import React, { useState, useEffect } from 'react';
import { Group } from '@visx/group';
import { CustomProjection } from '@visx/geo';
import { scaleQuantize } from '@visx/scale';
import * as topojson from 'topojson-client';
import topology from '../geo/usa-topo.json';
import abbreviations from '../geo/abbreviations.json';

import countData from '../data/map.json';
import rateData from '../data/age-adjusted-drug-rates.json';

import { countCutoff, rateCutoff } from '../constants.json';

import '../css/Map.css';

function Map(params) {

  const [ compare, setCompare ] = useState('all');

  const labelExceptions = {
    'ME': 3,
    'WI': 4,
    'MI': 4,
    'WA': 5,
    'MT': 5,
    'ND': 5,
    'MN': 5,
    'VT': 5
  };

  const { width, setState, state: globalState } = params;
  const height = compare === 'all' ? Math.min(width * 0.75, 450) : (width * 1.1);
  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;
  const smallWidth = (adjustedWidth - ((margin.left + margin.right) * 2)) / 2 - 10;
  const smallHeight = (adjustedHeight - ((margin.top + margin.bottom) * 6)) / 3 - 5;

  const unitedStates = topojson.feature(topology, topology.objects.states).features;
  const colorsPalettes = {
    'All': ["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"],
    'Heroin': ['#82E0AA', '#58D68D', '#2ECC71', '#2ECC71', '#28B463'],
    'IMFs': ['#F0B27A','#E59866','#E67E22','#CA6F1E','#A04000'],
    'Cocaine': ['#D2B4DE','#A569BD','#8E44AD','#6C3483','#5B2C6F'],
    'Rx Opioids': ['#F5B7B1','#F1948A','#EC7063','#E74C3C','#B03A2E'],
    'Meth': ['#AEB6BF','#5D6D7E','#34495E','#2E4053','#212F3C']
  };
  const notAvailableColor = '#EEE';

  const map = (small, drug) => {
    const mapWidth = small ? smallWidth : adjustedWidth;
    const mapHeight = small ? smallHeight : adjustedHeight;

    const scale = Math.min(mapWidth * .8, mapHeight * 1.2);
    const centerX = mapWidth / 2 + (scale * 1.8);
    const centerY = mapHeight / 2 + (scale * .75);

    const legendSize = scale * 0.05;

    const fullLabelOffset = scale * .065;
    const smallLabelOffset = fullLabelOffset;
    const labelOffset = small ? smallLabelOffset : fullLabelOffset;

    const colors = colorsPalettes[drug];
    const colorsReverse = [...colors].reverse();

    const colorScale = scaleQuantize({
      domain: [rateData[drug].min, rateData[drug].max],
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
          <CustomProjection
            data={unitedStates}
            scale={scale}
            translate={[centerX, centerY]}
          >
            {({ features }) => 
                features.map(({ feature, path }, i) => {
                  const abbr = feature.properties.iso.replace(/US-/g,'');
                  const state = abbreviations[abbr];
                  const datum = rateData[drug][state];
                  const countDatum = countData[drug][state];
                  const color = datum ? colorScale(datum.rate) : notAvailableColor;
                  const center = path.replace(/M/g, '').split('L')[labelExceptions[abbr] || 0].split(',');

                  return (
                    <React.Fragment key={`map-feature-${i}`}>
                      <path
                        key={`map-feature-${i}`}
                        tabIndex="-1"
                        d={path || ''}
                        fill={color}
                        stroke={'#FFF'}
                        strokeWidth={scale * 0.01} 
                        opacity={globalState === 'United States' || globalState === state ? 1 : 0.9}
                        onClick={() => {
                          if(datum){
                            if(globalState === state){
                              setState('United States');
                            } else {
                              setState(state);
                            }
                          }
                        }}
                        data-tip={datum ? `<strong>${state}</strong><br/>
                        Rate: ${datum.rate <= rateCutoff ? `< ${rateCutoff}` : datum.rate}<br/>
                        Deaths: ${countDatum.deaths <= countCutoff ? `< ${countCutoff}` : countDatum.deaths}` : 'Data unavailable'}
                      />
                      <text
                        x={center[0]}
                        y={parseInt(center[1]) + labelOffset}
                        textAnchor="middle"
                        fontSize={scale * 0.03}
                        opacity={globalState === 'United States' || globalState === state ? 1 : 0.3}
                        pointerEvents="none"
                      >{abbr}</text>
                    </React.Fragment>
                  );
                })
              }
          </CustomProjection>
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
      <div className="block-shadow" style={{ height }}>
        {compare === 'all' ?
          map(false, 'All')
        : (
          <>
            {map(true, 'All')}
            {map(true, 'Heroin')}
            {map(true, 'IMFs')}
            {map(true, 'Cocaine')}
            {map(true, 'Rx Opioids')}
            {map(true, 'Meth')}
          </>
        ) }
      </div>
    </>
  );
}

export default Map;
