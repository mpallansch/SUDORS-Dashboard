import React, { useState } from 'react';
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

const unitedStates = topojson.feature(topology, topology.objects.states).features;
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
const colors = ['#67a9cf','#3690c0','#02818a','#016c59','#014636'];
const notAvailableColor = '#EEE';

function Map(params) {

  const [ drug, setDrug ] = useState('All');

  const { width, setState, state: globalState } = params;
  const height = Math.min(width * 0.75, 450);
  const margin = {top: 10, bottom: 20, left: 10, right: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const scale = Math.min(adjustedWidth * .8, adjustedHeight * 1.2);
  const centerX = adjustedWidth / 2 + (scale * 1.8);
  const centerY = adjustedHeight / 2 + (scale * .75);

  const legendSize = scale * 0.05;
  const labelOffset = scale * .065;

  const colorScale = scaleQuantize({
    domain: [rateData[drug].max, rateData[drug].min],
    range: colors
  });

  const scaleIncrement = Math.round((rateData[drug].max - rateData[drug].min) / colors.length);
  const legendWidth = legendSize * colors.length;

  return width > 0 && (
    <>
      <select onChange={(e) => {setDrug(e.target.value)}}>
        <option value="All">All Substances</option>
        <option>Heroin</option>
        <option>IMFs</option>
        <option>Cocaine</option>
        <option>Rx Opioids</option>
        <option>Meth</option>
      </select>
      <div className="inline-map-container">
        <svg 
          width={adjustedWidth}
          height={adjustedHeight} 
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
            {colors.map((color, i) => {
              const x = adjustedWidth + (i * legendSize) - legendWidth - 50;

              return (
                <>
                  <rect 
                    key={`color-indicator-${drug}-${i}`} 
                    x={x} 
                    y={adjustedHeight - (legendSize * 2)} 
                    width={legendSize} 
                    height={legendSize} 
                    fill={color}
                    style={{borderRadius: '5px'}}>
                  </rect>
                  <text 
                    x={x + legendSize} 
                    y={adjustedHeight}
                    textAnchor="middle"
                    fontSize={scale * 0.03}
                  >{scaleIncrement * i + rateData[drug].min}</text>
                </>
              )}
            )}
            <text 
              x={adjustedWidth - legendWidth - 50} 
              y={adjustedHeight}
              textAnchor="middle"
              fontSize={scale * 0.03}
            >{0}</text>
          </Group>
        </svg>
      </div>
    </>
  );
}

export default Map;
