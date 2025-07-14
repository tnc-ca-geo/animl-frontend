import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger
} from '../../components/NavigationMenu.jsx';

import ObjectPanel from './statsComponents/ObjectPanel';
import ImagePanel from './statsComponents/ImagePanel';
import BurstsPanel from './statsComponents/BurstsPanel';
import IndependentDetectionsPanel from './statsComponents/IndependentDetectionsPanel'

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
        }
      },
    },
  },
});

const ImagesStatsModal = ({ open }) => {
  const [activePanel, setActivePanel] = useState("objects");

  return (
    <div>
      <NavMenu>
        <MenuList>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel("objects")} active={activePanel === "objects"}>
              Objects
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel("images")} active={activePanel === "images"}>
              Images
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger onClick={() => setActivePanel("bursts")} active={activePanel === "bursts"}>
              Bursts
            </Trigger>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Trigger
              onClick={() => setActivePanel("independent-detections")}
              active={activePanel === "independent-detections"}
            >
              Independent Detections
            </Trigger>
          </NavigationMenuItem>
        </MenuList>
      </NavMenu>
      <StatsDash>
        {activePanel === "objects" && <ObjectPanel open={open} />}
        {activePanel === "images" && <ImagePanel open={open} />}
        {activePanel === "bursts" && <BurstsPanel open={open} />}
        {activePanel === "independent-detections" && <IndependentDetectionsPanel />}
      </StatsDash>
    </div>
  );
};
export default ImagesStatsModal;
