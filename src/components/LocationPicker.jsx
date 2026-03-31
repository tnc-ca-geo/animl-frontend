import React, { useState, useCallback } from 'react';
import MapGL, { Marker, NavigationControl } from 'react-map-gl';
import { SearchBox } from '@mapbox/search-js-react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { styled } from '../theme/stitches.config.js';
import { MAPBOX_TOKEN } from '../config.js';
import { FormFieldWrapper, FormError } from './Form.jsx';

const MapContainer = styled('div', {
  width: '100%',
  height: '300px',
  borderRadius: '$2',
  overflow: 'hidden',
  marginBottom: '$2',
  cursor: 'crosshair',
});

const CoordinateInputs = styled('div', {
  display: 'flex',
  gap: '$3',
});

const MarkerPin = styled('div', {
  width: '16px',
  height: '16px',
  borderRadius: '$round',
  backgroundColor: '$blue500',
  border: '3px solid white',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  transform: 'translate(-50%, -50%)',
});

const FallbackNote = styled('p', {
  color: '$textLight',
  fontSize: '$3',
  margin: '0 0 $2 0',
});

const LocationPicker = ({
  latitude,
  longitude,
  setFieldValue,
  setFieldTouched,
  errors,
  touched,
}) => {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1,
  });

  const hasMarker = latitude !== '' && longitude !== '' && !isNaN(latitude) && !isNaN(longitude);

  const handleSearchRetrieve = useCallback(
    (res) => {
      const feature = res?.features?.[0];
      if (!feature) return;

      const [lng, lat] = feature.geometry.coordinates;
      setFieldValue('latitude', parseFloat(lat.toFixed(6)));
      setFieldValue('longitude', parseFloat(lng.toFixed(6)));
      setFieldTouched('latitude', true);
      setFieldTouched('longitude', true);

      setViewState((prev) => ({
        ...prev,
        longitude: lng,
        latitude: lat,
        zoom: 12,
      }));

      const context = feature.properties?.context;
      if (context?.country?.name) {
        setFieldValue('country', context.country.name);
      }
      if (context?.region?.name) {
        setFieldValue('state_province', context.region.name);
      }
    },
    [setFieldValue, setFieldTouched],
  );

  const handleMapClick = useCallback(
    (e) => {
      const { lng, lat } = e.lngLat;
      setFieldValue('latitude', parseFloat(lat.toFixed(6)));
      setFieldValue('longitude', parseFloat(lng.toFixed(6)));
      setFieldTouched('latitude', true);
      setFieldTouched('longitude', true);
    },
    [setFieldValue, setFieldTouched],
  );

  const handleMarkerDragEnd = useCallback(
    (e) => {
      const { lng, lat } = e.lngLat;
      setFieldValue('latitude', parseFloat(lat.toFixed(6)));
      setFieldValue('longitude', parseFloat(lng.toFixed(6)));
    },
    [setFieldValue],
  );

  const handleLatChange = useCallback(
    (e) => {
      const val = e.target.value;
      setFieldValue('latitude', val === '' ? '' : parseFloat(val) || val);
      if (val !== '' && !isNaN(val) && longitude !== '' && !isNaN(longitude)) {
        setViewState((prev) => ({
          ...prev,
          latitude: parseFloat(val),
          longitude: parseFloat(longitude),
        }));
      }
    },
    [setFieldValue, longitude],
  );

  const handleLngChange = useCallback(
    (e) => {
      const val = e.target.value;
      setFieldValue('longitude', val === '' ? '' : parseFloat(val) || val);
      if (val !== '' && !isNaN(val) && latitude !== '' && !isNaN(latitude)) {
        setViewState((prev) => ({
          ...prev,
          longitude: parseFloat(val),
          latitude: parseFloat(latitude),
        }));
      }
    },
    [setFieldValue, latitude],
  );

  if (!MAPBOX_TOKEN) {
    return (
      <>
        <FallbackNote>Map unavailable — enter coordinates manually.</FallbackNote>
        <CoordinateInputs>
          <FormFieldWrapper>
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={handleLatChange}
              onBlur={() => setFieldTouched('latitude', true)}
            />
            {!!errors.latitude && touched.latitude && <FormError>{errors.latitude}</FormError>}
          </FormFieldWrapper>
          <FormFieldWrapper>
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={handleLngChange}
              onBlur={() => setFieldTouched('longitude', true)}
            />
            {!!errors.longitude && touched.longitude && <FormError>{errors.longitude}</FormError>}
          </FormFieldWrapper>
        </CoordinateInputs>
      </>
    );
  }

  return (
    <>
      <MapContainer>
        <MapGL
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          onClick={handleMapClick}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-v9"
          style={{ width: '100%', height: '100%' }}
          reuseMaps
        >
          <div style={{ padding: '10px' }}>
            <SearchBox
              accessToken={MAPBOX_TOKEN}
              onRetrieve={handleSearchRetrieve}
              theme={{
                cssText: `

                .Input {
                  padding-left: 2.25em !important;
                }
              `,
              }}
            />
          </div>
          <NavigationControl position="bottom-right" />
          {hasMarker && (
            <Marker
              longitude={parseFloat(longitude)}
              latitude={parseFloat(latitude)}
              anchor="center"
              draggable
              onDragEnd={handleMarkerDragEnd}
            >
              <MarkerPin />
            </Marker>
          )}
        </MapGL>
      </MapContainer>
      <CoordinateInputs>
        <FormFieldWrapper>
          <label htmlFor="latitude">Latitude</label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={handleLatChange}
            onBlur={() => setFieldTouched('latitude', true)}
          />
          {!!errors.latitude && touched.latitude && <FormError>{errors.latitude}</FormError>}
        </FormFieldWrapper>
        <FormFieldWrapper>
          <label htmlFor="longitude">Longitude</label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={handleLngChange}
            onBlur={() => setFieldTouched('longitude', true)}
          />
          {!!errors.longitude && touched.longitude && <FormError>{errors.longitude}</FormError>}
        </FormFieldWrapper>
      </CoordinateInputs>
    </>
  );
};

export default LocationPicker;
