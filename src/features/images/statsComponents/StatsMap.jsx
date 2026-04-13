import React, { useMemo, useState } from 'react';
import MapGL, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { TriangleAlert, X } from 'lucide-react';
import { styled } from '../../../theme/stitches.config.js';
import Callout from '../../../components/Callout.jsx';
import { MAPBOX_TOKEN } from '../../../config.js';

const MapContainer = styled('div', {
  width: '100%',
  height: '450px',
  borderRadius: '$2',
  overflow: 'hidden',
  position: 'relative',
});

const EmptyStateOverlay = styled('div', {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 1,
  pointerEvents: 'none',
});

const PopupContent = styled('div', {
  fontFamily: '$roboto',
  fontSize: '$3',
  lineHeight: '1.6',
  color: '$textDark',
  minWidth: '160px',
  maxWidth: '240px',
  maxHeight: '200px',
  overflowY: 'auto',
});

const PopupTitle = styled('div', {
  fontWeight: '$5',
  fontSize: '$4',
  marginBottom: '$1',
  borderBottom: '1px solid $border',
  paddingBottom: '$1',
});

const PopupRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$3',
  padding: '1px 0',
});

const PopupLabelDot = styled('span', {
  display: 'inline-block',
  width: '10px',
  height: '10px',
  borderRadius: '$round',
  flexShrink: 0,
  marginRight: '$1',
});

const PopupLabelName = styled('span', {
  color: '$textMedium',
  flex: 1,
});

const PopupCount = styled('span', {
  fontFamily: '$mono',
  fontWeight: '$4',
});

const WarningButton = styled('button', {
  position: 'absolute',
  bottom: '$2',
  left: '$2',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  gap: '$1',
  padding: '$1 $2',
  backgroundColor: '$backgroundLight',
  color: '$warningText',
  border: 'none',
  borderRadius: '$2',
  fontFamily: '$roboto',
  fontSize: '$2',
  fontWeight: '$4',
  cursor: 'pointer',
});

const WarningPanel = styled('div', {
  position: 'absolute',
  bottom: 'calc($2 + 32px + $2)',
  left: '$2',
  zIndex: 2,
  backgroundColor: 'white',
  borderRadius: '$2',
  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
  padding: '$3',
  minWidth: '240px',
  maxWidth: '320px',
  maxHeight: '260px',
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const WarningPanelHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '$2',
});

const WarningPanelTitle = styled('p', {
  fontFamily: '$roboto',
  fontSize: '$3',
  fontWeight: '$5',
  color: '$textDark',
  margin: 0,
  lineHeight: '1.4',
});

const WarningPanelClose = styled('button', {
  flexShrink: 0,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  color: '$textMedium',
  display: 'flex',
  alignItems: 'center',
  '&:hover': { color: '$textDark' },
});

const CameraIdList = styled('ul', {
  margin: 0,
  paddingLeft: '$4',
  overflowY: 'auto',
  fontFamily: '$mono',
  fontSize: '$2',
  color: '$textMedium',
  lineHeight: '1.8',
  flex: 1,
});

const MapStyleSelector = styled('div', {
  position: 'absolute',
  top: '$2',
  left: '$2',
  zIndex: 2,
  display: 'flex',
  gap: '4px',
});

const MapStyleButton = styled('button', {
  padding: '4px 8px',
  fontFamily: '$roboto',
  fontSize: '$2',
  fontWeight: '$4',
  border: 'none',
  borderRadius: '$2',
  cursor: 'pointer',
  backgroundColor: 'rgba(0,0,0,0.45)',
  color: 'white',
  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: '$textDark',
        borderColor: 'transparent',
        fontWeight: '$5',
      },
    },
  },
});

const MAP_STYLES = [
  {
    id: 'satellite-streets',
    label: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-streets-v11',
  },
  { id: 'dark', label: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'light', label: 'Light', url: 'mapbox://styles/mapbox/light-v11' },
];

const MIN_SIZE = 30;
const MAX_SIZE = 72;

function calcMarkerSize(count, minCount, maxCount) {
  if (minCount === maxCount) return (MIN_SIZE + MAX_SIZE) / 2;
  // sqrt scaling for perceptual area accuracy
  const t = (Math.sqrt(count) - Math.sqrt(minCount)) / (Math.sqrt(maxCount) - Math.sqrt(minCount));
  return MIN_SIZE + t * (MAX_SIZE - MIN_SIZE);
}

/**
 * Renders an SVG donut marker.
 * labelCounts: { [labelName]: count }
 * labels: project labels array [{ _id, name, color }]
 * size: diameter in px
 */
function DonutMarker({ labelCounts, projectLabels, size }) {
  const entries = Object.entries(labelCounts).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  const r = size / 2;
  const innerR = r * 0.25; // donut hole radius
  const cx = r;
  const cy = r;

  // Build arc paths
  const arcs = [];
  let startAngle = -Math.PI / 2; // start at top

  for (const [labelName, count] of entries) {
    const fraction = count / total;
    const angle = fraction * 2 * Math.PI;
    const endAngle = startAngle + angle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle);
    const iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle);
    const iy2 = cy + innerR * Math.sin(startAngle);
    const largeArc = angle > Math.PI ? 1 : 0;

    const projLabel = projectLabels.find((l) => l.name === labelName);
    const color = projLabel?.color || '#aaaaaa';

    arcs.push(
      <path
        key={labelName}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`}
        fill={color}
        stroke="white"
        strokeWidth="0"
      />,
    );

    startAngle = endAngle;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        display: 'block',
      }}
    >
      {arcs}
    </svg>
  );
}

/**
 * StatsMap — renders a Mapbox map with donut markers for each deployment.
 *
 * Props:
 *   deploymentStats: { [deploymentId]: { [labelName]: count } } | null
 *   labels: array of project label objects [{ _id, name, color }]
 *   cameraConfigs: project.cameraConfigs array
 */
export default function StatsMap({ deploymentStats, projectLabels, cameraConfigs }) {
  const [popupDeployment, setPopupDeployment] = useState(null);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [activeStyleId, setActiveStyleId] = useState('satellite-streets');

  // Join deployment stats with locations from cameraConfigs.
  // Filters out deployments without coordinates (includes default deployments).
  const deploymentMarkers = useMemo(() => {
    if (!deploymentStats || !cameraConfigs) return [];

    const markers = [];
    for (const config of cameraConfigs) {
      for (const dep of config.deployments) {
        const coords = dep.location?.geometry?.coordinates;
        if (!coords || coords.length !== 2) continue;

        const labelCounts = deploymentStats[String(dep._id)];
        if (!labelCounts) continue;

        const total = Object.values(labelCounts).reduce((s, v) => s + v, 0);
        markers.push({
          deploymentId: String(dep._id),
          name: dep.name,
          coordinates: coords, // [lng, lat]
          labelCounts,
          total,
        });
      }
    }
    return markers;
  }, [deploymentStats, cameraConfigs]);

  const initialViewState = useMemo(() => {
    if (deploymentMarkers.length === 0) {
      return { longitude: 0, latitude: 20, zoom: 1 };
    }
    if (deploymentMarkers.length === 1) {
      const [lng, lat] = deploymentMarkers[0].coordinates;
      return { longitude: lng, latitude: lat, zoom: 7 };
    }
    const bounds = new LngLatBounds();
    deploymentMarkers.forEach(({ coordinates: [lng, lat] }) => bounds.extend([lng, lat]));
    return {
      bounds: [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ],
      fitBoundsOptions: { padding: 60, maxZoom: 12 },
    };
  }, [deploymentMarkers]);

  const { minCount, maxCount } = useMemo(() => {
    if (deploymentMarkers.length === 0) return { minCount: 0, maxCount: 0 };
    const totals = deploymentMarkers.map((d) => d.total);
    return { minCount: Math.min(...totals), maxCount: Math.max(...totals) };
  }, [deploymentMarkers]);

  const isEmpty = deploymentMarkers.length === 0;

  // Cameras where every deployment is the default (editable === false) — no custom deployments
  const unconfiguredCameraIds = useMemo(() => {
    if (!cameraConfigs) return [];
    return cameraConfigs
      .filter((config) => config.deployments.every((dep) => dep.editable === false))
      .map((config) => config._id);
  }, [cameraConfigs]);

  return (
    <MapContainer>
      {isEmpty && (
        <EmptyStateOverlay>
          <Callout type="info" title="No custom Deployments found">
            <p>
              Create{' '}
              <a
                href="https://docs.animl.camera/fundamentals/camera-and-deployment-management"
                target="_blank"
                rel="noopener noreferrer"
              >
                Deployments
              </a>{' '}
              to add lat/long coordinates and visualize your data on the map
            </p>
          </Callout>
        </EmptyStateOverlay>
      )}
      <MapGL
        initialViewState={initialViewState}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLES.find((s) => s.id === activeStyleId).url}
        style={{ width: '100%', height: '100%' }}
        logoPosition="bottom-right"
        reuseMaps
      >
        <NavigationControl position="top-right" />
        {deploymentMarkers.map((dep) => {
          const [lng, lat] = dep.coordinates;
          const size = calcMarkerSize(dep.total, minCount, maxCount);
          return (
            <Marker
              key={dep.deploymentId}
              longitude={lng}
              latitude={lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupDeployment(dep);
              }}
              style={{ cursor: 'pointer' }}
            >
              <DonutMarker
                labelCounts={dep.labelCounts}
                projectLabels={projectLabels}
                size={size}
              />
            </Marker>
          );
        })}
        {popupDeployment && (
          <Popup
            longitude={popupDeployment.coordinates[0]}
            latitude={popupDeployment.coordinates[1]}
            onClose={() => setPopupDeployment(null)}
            closeOnClick={false}
            dynamicPosition={true}
            offset={
              popupDeployment
                ? calcMarkerSize(popupDeployment.total, minCount, maxCount) / 2 + 4
                : 12
            }
          >
            <PopupContent>
              <PopupTitle>{popupDeployment.name}</PopupTitle>
              {Object.entries(popupDeployment.labelCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([labelName, count]) => {
                  const projLabel = projectLabels.find((l) => l.name === labelName);
                  return (
                    <PopupRow key={labelName}>
                      <span>
                        <PopupLabelDot style={{ backgroundColor: projLabel?.color || '#aaa' }} />
                        <PopupLabelName>{labelName}</PopupLabelName>
                      </span>
                      <PopupCount>{count.toLocaleString('en-US')}</PopupCount>
                    </PopupRow>
                  );
                })}
            </PopupContent>
          </Popup>
        )}
      </MapGL>
      <MapStyleSelector>
        {MAP_STYLES.map((style) => (
          <MapStyleButton
            key={style.id}
            active={activeStyleId === style.id}
            onClick={() => setActiveStyleId(style.id)}
          >
            {style.label}
          </MapStyleButton>
        ))}
      </MapStyleSelector>
      {unconfiguredCameraIds.length > 0 && (
        <>
          {isWarningOpen && (
            <WarningPanel>
              <WarningPanelHeader>
                <WarningPanelTitle>
                  Please create{' '}
                  <a
                    href="https://docs.animl.camera/fundamentals/camera-and-deployment-management"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Deployments
                  </a>{' '}
                  for the following Cameras and add location coordinates to visualize them on the
                  map:
                </WarningPanelTitle>
                <WarningPanelClose onClick={() => setIsWarningOpen(false)}>
                  <X size={14} />
                </WarningPanelClose>
              </WarningPanelHeader>
              <CameraIdList>
                {unconfiguredCameraIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </CameraIdList>
            </WarningPanel>
          )}
          <WarningButton onClick={() => setIsWarningOpen((o) => !o)}>
            <TriangleAlert size={14} />
            {unconfiguredCameraIds.length} Camera
            {unconfiguredCameraIds.length !== 1 ? 's' : ''} not shown
          </WarningButton>
        </>
      )}
    </MapContainer>
  );
}
