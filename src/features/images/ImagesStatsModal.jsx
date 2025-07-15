import React, { useState } from 'react';
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

import ObjectPanel from './statsComponents/ObjectPanel';
import ImagePanel from './statsComponents/ImagePanel';
import BurstsPanel from './statsComponents/BurstsPanel';
import IndependentDetectionsPanel from './statsComponents/IndependentDetectionsPanel';
import SelectField from '../../components/SelectField.jsx';

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

const intervalOptions = [
  { value: 1, label: '1 min' },
  { value: 2, label: '2 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

const ImagesStatsModal = () => {
  const dispatch = useDispatch();
  const [activePanel, setActivePanel] = useState('objects');
  const [independenceInterval, setIndependenceInterval] = useState(30);

  const intervalValue = intervalOptions.find(({ value }) => value === independenceInterval);

  const filters = useSelector(selectActiveFilters);

  const handleIndependenceIntervalChange = (value) => {
    setIndependenceInterval(value);
    dispatch(fetchIndependentDetectionStats(filters, value));
  };

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
          <>
            <label htmlFor="independence-interval">Independence Interval</label>
            <SelectField
              name="independence-interval"
              value={intervalValue}
              onChange={(_, { value }) => handleIndependenceIntervalChange(value)}
              options={intervalOptions}
              onBlur={() => {}}
              isSearchable={false}
            />
          </>
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
      </StatsDash>
    </div>
  );
};
export default ImagesStatsModal;
