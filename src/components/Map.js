import React from 'react';
import { AlbersUsa } from '@visx/geo';
import { scaleQuantize } from '@visx/scale';
import { geoCentroid } from 'd3-geo';
import * as topojson from 'topojson-client';
import topology from '../geo/usa-topo.json';
import abbreviations from '../geo/abbreviations.json';

import data from '../data/map.json';

import '../css/Map.css';

function Map(params) {

  const { width, height, setState } = params;
  const margin = {top: 10, bottom: 10, left: 10, right: 10};
  const adjustedWidth = width - margin.left - margin.right;
  const adjustedHeight = height - margin.top - margin.bottom;

  const centerX = adjustedWidth / 2;
  const centerY = adjustedHeight / 2;
  const scale = Math.min(adjustedWidth * 1.3, adjustedHeight * 2);

  const unitedStates = topojson.feature(topology, topology.objects.states).features;

  const colorScale = scaleQuantize({
    domain: [data.min, data.max],
    range: ["#85C1E9", "#5DADE2", "#3498DB", "#2E86C1", "#2874A6"]
  });

  return width > 0 && (
    <>
      <svg width={adjustedWidth} height={adjustedHeight} style={{marginTop: margin.top, marginLeft: margin.left}}>
        <AlbersUsa
          data={unitedStates}
          scale={scale}
          translate={[centerX, centerY - 25]}
        >
          {({ features }) => 
              features.map(({ feature, path }, i) => {
                const state = abbreviations[feature.properties.iso.replace(/US-/g,'')];
                const deaths = data[state].deaths;

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
      </svg>
    </>
  );
}

export default Map;
