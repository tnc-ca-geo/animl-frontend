import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import MapGL, { Marker, Popup, NavigationControl } from 'react-map-gl';
import { LngLatBounds } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { styled } from '../../theme/stitches.config.js';
import { indigo } from '@radix-ui/colors';
import { selectLatestSnapshot } from './adminSlice';
import { MAPBOX_TOKEN } from '../../config';

const MapContainer = styled('div', {
  width: '100%',
  height: '400px',
  borderRadius: '$2',
  overflow: 'hidden',
  marginBottom: '$3',
});

const EmptyState = styled('p', {
  color: '$textLight',
  textAlign: 'center',
  padding: '$6 0',
  margin: 0,
});

const MarkerDot = styled('div', {
  width: '14px',
  height: '14px',
  borderRadius: '$round',
  backgroundColor: indigo.indigo11,
  border: '2px solid white',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
  '&:hover': {
    transform: 'scale(1.3)',
  },
});

const PopupContent = styled('div', {
  fontFamily: '$roboto',
  fontSize: '$3',
  lineHeight: '1.6',
  color: '$textDark',
  minWidth: '160px',
});

const PopupTitle = styled('div', {
  fontWeight: '$5',
  fontSize: '$4',
  marginBottom: '$1',
  borderBottom: '1px solid $border',
  paddingBottom: '$1',
});

const PopupStat = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '$3',
});

const PopupLabel = styled('span', {
  color: '$textMedium',
});

const PopupValue = styled('span', {
  fontFamily: '$mono',
  fontWeight: '$4',
});

const capitalize = (str) => {
  if (!str) return '—';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatNumber = (n) => {
  if (n == null) return '—';
  return n.toLocaleString('en-US');
};

const ProjectMap = () => {
  const snapshot = useSelector(selectLatestSnapshot);
  const [selectedProject, setSelectedProject] = useState(null);

  const projectsWithLocation = useMemo(() => {
    if (!snapshot?.projects) return [];
    return snapshot.projects.filter(
      (p) => p.location?.geometry?.coordinates && p.location.geometry.coordinates.length === 2,
    );
  }, [snapshot]);

  const initialViewState = useMemo(() => {
    if (projectsWithLocation.length === 0) {
      return { longitude: 0, latitude: 20, zoom: 1 };
    }

    if (projectsWithLocation.length === 1) {
      const [lng, lat] = projectsWithLocation[0].location.geometry.coordinates;
      return { longitude: lng, latitude: lat, zoom: 5 };
    }

    const bounds = new LngLatBounds();
    projectsWithLocation.forEach((p) => {
      const [lng, lat] = p.location.geometry.coordinates;
      bounds.extend([lng, lat]);
    });

    return {
      bounds: [
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getEast(), bounds.getNorth()],
      ],
      fitBoundsOptions: { padding: 60, maxZoom: 12 },
    };
  }, [projectsWithLocation]);

  if (!MAPBOX_TOKEN) {
    return <EmptyState>Map unavailable — Mapbox access token not configured.</EmptyState>;
  }

  return (
    <>
      {projectsWithLocation.length === 0 ? (
        <EmptyState>No projects with location data match the current filters.</EmptyState>
      ) : (
        <MapContainer>
          <MapGL
            initialViewState={initialViewState}
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: '100%', height: '100%' }}
            reuseMaps
          >
            <NavigationControl position="top-right" />
            {projectsWithLocation.map((project) => {
              const [lng, lat] = project.location.geometry.coordinates;
              return (
                <Marker
                  key={project.projectId}
                  longitude={lng}
                  latitude={lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedProject(project);
                  }}
                >
                  <MarkerDot />
                </Marker>
              );
            })}
            {selectedProject && (
              <Popup
                longitude={selectedProject.location.geometry.coordinates[0]}
                latitude={selectedProject.location.geometry.coordinates[1]}
                anchor="bottom"
                onClose={() => setSelectedProject(null)}
                closeOnClick={false}
                offset={12}
              >
                <PopupContent>
                  <PopupTitle>{selectedProject.projectName}</PopupTitle>
                  <PopupStat>
                    <PopupLabel>Type</PopupLabel>
                    <PopupValue>{capitalize(selectedProject.type)}</PopupValue>
                  </PopupStat>
                  <PopupStat>
                    <PopupLabel>Stage</PopupLabel>
                    <PopupValue>{capitalize(selectedProject.stage)}</PopupValue>
                  </PopupStat>
                  <PopupStat>
                    <PopupLabel>Images</PopupLabel>
                    <PopupValue>{formatNumber(selectedProject.imageCount)}</PopupValue>
                  </PopupStat>
                  <PopupStat>
                    <PopupLabel>Cameras</PopupLabel>
                    <PopupValue>{formatNumber(selectedProject.cameraCount)}</PopupValue>
                  </PopupStat>
                  <PopupStat>
                    <PopupLabel>Users</PopupLabel>
                    <PopupValue>{formatNumber(selectedProject.userCount)}</PopupValue>
                  </PopupStat>
                </PopupContent>
              </Popup>
            )}
          </MapGL>
        </MapContainer>
      )}
    </>
  );
};

export default ProjectMap;
