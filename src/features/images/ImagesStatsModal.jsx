import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIndependentDetectionStats } from '../tasks/tasksSlice.js';
import { selectActiveFilters } from '../filters/filtersSlice.js';
import { styled } from '../../theme/stitches.config';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '../../components/NavigationMenu.jsx';

import MapView from '../../components/MapView';
import { selectSelectedProject } from '../projects/projectsSlice';

import ObjectPanel from './statsComponents/ObjectPanel';
import ImagePanel from './statsComponents/ImagePanel';
import BurstsPanel from './statsComponents/BurstsPanel';
import IndependentDetectionsPanel from './statsComponents/IndependentDetectionsPanel';
import IndependenceIntervalSelector from './statsComponents/IndependenceIntervalSelector.jsx';

const StatsDash = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  background: '$backgroundDark',
  borderRadius: '5px',
  padding: '10px',
  gap: '10px',
  minWidth: '660px',
});

const NavMenu = styled(NavigationMenu, {
  justifyContent: 'left',
  alignItems: 'center',
  gap: '15px',
  marginBottom: '15px',
  zIndex: 0,
});

const MenuList = styled(NavigationMenuList, {
  background: '$backgroundDark',
});

const Trigger = styled(NavigationMenuTrigger, {
  color: '$textMedium',
  fontSize: '$3',
  '&:hover': {
    color: '$textDark',
  },

  variants: {
    active: {
      true: {
        backgroundColor: '$backgroundLight',
        color: '$hiContrast',
        border: '1px solid $border',
        '&:hover': {
          backgroundColor: '$hiContrast',
          color: '$loContrast',
        },
      },
    },
  },
});

const ImagesStatsModal = () => {
  const dispatch = useDispatch();
  const [activePanel, setActivePanel] = useState('objects');
  const [independenceInterval, setIndependenceInterval] = useState(30);

  const filters = useSelector(selectActiveFilters);
  const selectedProject = useSelector(selectSelectedProject);

  const handleIndependenceIntervalChange = (value) => {
    setIndependenceInterval(value);
    dispatch(fetchIndependentDetectionStats(filters, value));
  };

  const [deploymentLocations, setDeploymentLocations] = useState([]);

  useEffect(() => {
    const camDeploymentLocations = selectedProject.cameraConfigs.reduce((acc, config) => {
      const camDeployment = config.deployments
      .filter((dep) => dep.location) // filter for camera deployments where location is not null
      .map((dep) => ({
        id: config._id,
        location: dep.location,
        deploymentId: dep._id
      }));
      return acc.concat(camDeployment)
    }, [])

    setDeploymentLocations(camDeploymentLocations);
  }, [selectedProject, setDeploymentLocations])
 
  return (
    <div>
      <NavMenu>
        <MenuList>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel('objects')} active={activePanel === 'objects'}>
              Objects
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel('images')} active={activePanel === 'images'}>
              Images
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel('bursts')} active={activePanel === 'bursts'}>
              Bursts
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger
              onClick={() => setActivePanel('independent-detections')}
              active={activePanel === 'independent-detections'}
            >
              Independent Detections
            </Trigger>
          </NavigationMenuItem>
        </MenuList>
        {activePanel === 'independent-detections' && (
          <IndependenceIntervalSelector
            onValueChange={handleIndependenceIntervalChange}
            value={independenceInterval}
          />
        )}
      </NavMenu>
      <StatsDash>
        {activePanel === 'objects' && <ObjectPanel />}
        {activePanel === 'images' && <ImagePanel />}
        {activePanel === 'bursts' && <BurstsPanel />}
        {activePanel === 'independent-detections' && (
          <IndependentDetectionsPanel
            independenceInterval={independenceInterval}
            filters={filters}
          />
        )}
        <MapView coordinates={deploymentLocations?.map((dep) => dep.location.geometry.coordinates) || []} />
      </StatsDash>
    </div>
  );
};
export default ImagesStatsModal;
