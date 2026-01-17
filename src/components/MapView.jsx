import React, {useRef, createContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_CONFIG } from '../config';

/**
 * RESOURCES
 * https://github.com/mapbox/tutorials/blob/main/dynamic-markers-react/src/Map.jsx
 * https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/#:~:text=This%20advanced%20example%20uses%20Mapbox,while%20the%20map%20view%20changes.
 */
function donutSegment(start, end, r, r0, color) {
  if (end - start === 1) end -= 0.00001;
  const a0 = 2 * Math.PI * (start - 0.25);
  const a1 = 2 * Math.PI * (end - 0.25);
  const x0 = Math.cos(a0),
      y0 = Math.sin(a0);
  const x1 = Math.cos(a1),
      y1 = Math.sin(a1);
  const largeArc = end - start > 0.5 ? 1 : 0;

  // draw an SVG path
  return `<path d="M ${r + r0 * x0} ${r + r0 * y0} L ${r + r * x0} ${
      r + r * y0
  } A ${r} ${r} 0 ${largeArc} 1 ${r + r * x1} ${r + r * y1} L ${
      r + r0 * x1
  } ${r + r0 * y1} A ${r0} ${r0} 0 ${largeArc} 0 ${r + r0 * x0} ${
      r + r0 * y0
  }" fill="${color}" />`;
}

function DonutMarker({map, feature, isActive, onClick}) {
  const {
    geometry,
    properties
  } = feature
  const colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];
  // a ref for the mapboxgl.Marker instance
  const markerRef = useRef(null);
  // a ref for an element to hold the marker's content
  const contentRef = useRef(document.createElement("div"));

  const offsets = [];

  const counts = [ // @TODO: HARDCODED FOR NOW
      0, 3, 0, 4, 0
  ];

  let total = 0;
  for (const count of counts) {
      offsets.push(total);
      total += count;
  }

  const fontSize =
  total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
  const r =
    total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
  const r0 = Math.round(r * 0.6);
  const w = r * 2;

  let html = `<div>
  <svg width="${w}" height="${w}" viewbox="0 0 ${w} ${w}" text-anchor="middle" style="font: ${fontSize}px sans-serif; display: block">`;

  for (let i = 0; i < counts.length; i++) {
    html += donutSegment(
        offsets[i] / total,
        (offsets[i] + counts[i]) / total,
        r,
        r0,
        colors[i]
    );
  }

  html += `<circle cx="${r}" cy="${r}" r="${r0}" fill="white" />
    <text dominant-baseline="central" transform="translate(${r}, ${r})">
        ${total.toLocaleString()}
    </text>
    </svg>
    </div>`;


  // instantiate the marker on mount, remove it on unmount
  useEffect(() => {
    markerRef.current = new mapboxgl.Marker(contentRef.current)
        .setLngLat([geometry.coordinates[0], geometry.coordinates[1]])
        .addTo(map);

    return () => {
        markerRef.current.remove();
    };
  }, []); 

  return (
    <>
        {createPortal(
            <div dangerouslySetInnerHTML={{ __html: html }} />,
            contentRef.current
        )}
    </>
  );
}

export default function MapView() {

  const mapRef = useRef()
  const mapContainerRef = useRef()

  const [earthquakeData, setEarthquakeData] = useState()
  const [activeFeature, setActiveFeature] = useState()

  // @TODO: Mockdata for now but to be removed so camera deployment and stats could replace this
  const getBboxAndFetch = React.useCallback(async () => {
      const bounds = mapRef.current.getBounds()

      try {
          const data = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&endtime=2024-01-30&minlatitude=${bounds._sw.lat}&maxlatitude=${bounds._ne.lat}&minlongitude=${bounds._sw.lng}&maxlongitude=${bounds._ne.lng}`)
              .then(d => d.json())

          setEarthquakeData(data)
      } catch (error) {
          console.error(error)
      }
  }, [])

  useEffect(() => {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      mapRef.current = new mapboxgl.Map({
          container: mapContainerRef.current,
          center: [124, -1.98], // @TODO: These values are just hardcoded for now
          minZoom: 5.5,
          zoom: 5.5
      });

      mapRef.current.on('load', () => {
          getBboxAndFetch()
      })

      mapRef.current.on('moveend',  () => {
          getBboxAndFetch()
      })

      return () => {
          mapRef.current.remove()
      }
  }, [])

  const handleMarkerClick = (feature) => {
      setActiveFeature(feature)
  }

  return (
      <>
          <div id='map-container' ref={mapContainerRef} style={{height: '100%', flex: '0 0 40vw'}} />
          {mapRef.current && earthquakeData && earthquakeData.features?.map((feature) => {
              return (
                  <DonutMarker
                      key={feature.id}
                      map={mapRef.current}
                      feature={feature}
                      isActive={activeFeature?.id === feature.id}
                      onClick={handleMarkerClick}
                  />
              )
          })}
      </>
  )
}