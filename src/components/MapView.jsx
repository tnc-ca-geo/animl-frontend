import React, {useRef, createContext, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_TOKEN, MAP_CONFIG } from '../config';


export default function MapView({coordinates}) {
  const mapContainer = useRef();
  const map = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false)
  // const [lng, setLng] = useState(-74.5);
  // const [lat, setLat] = useState(40);
  const MapContext = createContext(null);
  
  useEffect(() => {
    if (map.current) return // only initialize once
    mapboxgl.accessToken = MAPBOX_TOKEN
    map.current = new mapboxgl.Map({
      ...MAP_CONFIG,
      container: mapContainer.current,
    }).addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left",
    )

    const geojson = {
      type: 'FeatureCollection',
      features: coordinates.map(coord => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coord
        },
        properties: {
          // Add any properties you want to associate with each point here
        }
      }))
    };

    setInitialized(true)

    map.current.on("style.load", () => {

      map.current.addSource('points', {
        type: 'geojson',
        data: geojson
      });

      map.current.addLayer({
        id: 'circles',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-color': '#4264fb',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    
      setMapLoaded(true)
    });
  }, [])

  return (
    <>
      <div ref={mapContainer} style={{height: '100%', flex: '0 0 40vw'}} />
      <MapContext.Provider value={map.current}></MapContext.Provider>
    </>
  )

}