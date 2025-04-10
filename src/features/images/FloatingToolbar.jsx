import React from 'react';
import { styled } from '../../theme/stitches.config';
import { colCounts } from './ImagesGrid.jsx';
import { SmallScreensFiltersMenu } from '../filters/SmallScreensFiltersMenu.jsx';
import { Grid3x3, Grid2x2, Square } from 'lucide-react';
import { violet } from '@radix-ui/colors';

const FloatingToolbarContainer = styled('div', {
  position: 'fixed',
  width: '70vw',
  bottom: '10dvh',
  display: 'flex',
  justifyContent: 'space-around',
  background: '$backgroundLight',
  borderRadius: '1000000px',
  margin: '0 auto',
  left: '50%',
  transform: 'translateX(-50%)',
  overflow: 'hidden',
  zIndex: '$1',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  border: '1px solid $border',
});

const FloatingToolbarItem = styled('div', {
  display: 'grid',
  placeItems: 'center',
  variants: {
    active: {
      true: {
        backgroundColor: violet.violet5,
        color: violet.violet11,
      },
    },
  },
  height: '$5',
  padding: '$1',
  flex: '1',
  '&:hover': {
    cursor: 'pointer',
  },
});

export const FloatingToolbar = ({ colCount, setColCount }) => {
  return (
    <FloatingToolbarContainer>
      <SmallScreensFiltersMenu />
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.most)}
        active={colCount === colCounts.most}
      >
        <Grid3x3 />
      </FloatingToolbarItem>
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.middle)}
        active={colCount === colCounts.middle}
      >
        <Grid2x2 />
      </FloatingToolbarItem>
      <FloatingToolbarItem
        onClick={() => setColCount(colCounts.single)}
        active={colCount === colCounts.single}
      >
        <Square />
      </FloatingToolbarItem>
    </FloatingToolbarContainer>
  );
};
