import React from 'react';
import { styled } from '../../theme/stitches.config';
import { colCounts } from './ImagesGrid.jsx';
import { SmallScreensFiltersMenu } from '../filters/SmallScreensFiltersMenu.jsx';
import { MoveLeft } from 'lucide-react';
import { violet, mauve } from '@radix-ui/colors';

const FloatingToolbarContainer = styled('div', {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  display: 'flex',
  justifyContent: 'space-around',
  background: '$backgroundLight',
  borderRadius: '$2',
  zIndex: '$1',
  boxShadow: '0 16px 32px hsl(206deg 12% 5% / 25%), 0 3px 5px hsl(0deg 0% 0% / 10%)',
  border: '1px solid $border',
  overflow: 'hidden',
});

const Separator = styled('div', {
  width: '1px',
  backgroundColor: mauve.mauve6,
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
  padding: '$2',
  flex: '1',
  '&:hover': {
    cursor: 'pointer',
  },
  '&:first-child': {
    borderTopLeftRadius: '1000000px',
    borderBottomLeftRadius: '1000000px',
  },
  '&:last-child': {
    borderTopRightRadius: '1000000px',
    borderBottomLeftRadius: '1000000px',
  },
});

export const FloatingToolbar = ({ colCount, setColCount }) => (
  <FloatingToolbarContainer>
    {colCount === colCounts.single && (
      <>
        <FloatingToolbarItem
          onClick={() => setColCount(colCounts.middle)}
          active={colCount === colCounts.middle}
        >
          <MoveLeft />
        </FloatingToolbarItem>
        <Separator />
      </>
    )}
    <SmallScreensFiltersMenu />
  </FloatingToolbarContainer>
);
