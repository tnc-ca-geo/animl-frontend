import React from 'react';
import { useSelector } from 'react-redux';
import { styled, keyframes } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, QUERY_WITH_CUSTOM_FILTER } from '../auth/roles.js';
import StyledScrollArea from '../../components/ScrollArea.jsx';
import DeploymentFilter from './DeploymentFilter.jsx';
import ReviewFilter from './ReviewFilter.jsx';
import DateFilter from './DateFilter.jsx';
import LabelFilter from './LabelFilter.jsx';
import TagFilter from './TagFilter.jsx';
import CustomFilter from './CustomFilter.jsx';
import FiltersPanelFooter from './FiltersPanelFooter.jsx';
import * as Dialog from '@radix-ui/react-dialog';
import { Filter, X } from 'lucide-react';
import { violet } from '@radix-ui/colors';
import IconButton from '../../components/IconButton.jsx';

const openOverlayAnimation = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const closeOverlayAnimation = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});

const animateOverlayOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': {
      animation: `${openOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
    '&[data-state="closed"]': {
      animation: `${closeOverlayAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

const openMenuAnimation = keyframes({
  from: { transform: 'translateY(80dvh)' },
  to: { transform: 'translateY(0)' },
});

const closeMenuAnimation = keyframes({
  from: { transform: 'translateY(0)' },
  to: { transform: 'translateY(80dvh)' },
});

const animateMenuOpenClose = {
  '@media (prefers-reduced-motion: no-preference)': {
    '&[data-state="open"]': { animation: `${openMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)` },
    '&[data-state="closed"]': {
      animation: `${closeMenuAnimation} 0.4s cubic-bezier(0.32,0.72,0,1)`,
    },
  },
};

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
  padding: '$1',
  flex: '1',
  '&:hover': {
    cursor: 'pointer',
  },
});

const Overlay = styled(Dialog.Overlay, {
  zIndex: '$4',
  position: 'fixed',
  height: '100dvh',
  width: '100vw',
  top: '0',
  left: '0',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0,0,0,.8)',
  ...animateOverlayOpenClose,
});

const PanelBody = styled('div', {
  backgroundColor: '$backgroundLight',
  height: 'calc(100% - $7 - $7)', // 2x $7's to account for header + footer
  position: 'absolute',
  width: '100%',
});

const StyledFiltersPanel = styled(Dialog.Content, {
  zIndex: '$6',
  width: '100vw',
  height: '80dvh',
  position: 'fixed',
  left: 0,
  top: '20dvh',
  borderRadius: '$3 $3 0 0',
  backgroundColor: '$backgroundLight',
  '&:focus': { outline: 'none' },
  transformOrigin: 'top right',
  ...animateMenuOpenClose,
});

const StyledPanelHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '$0 $2 $0 $3',
  height: '$7',
  borderTopLeftRadius: '$3',
  borderTopRightRadius: '$3',
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundLight',
  fontWeight: '$5',
  color: '$textDark',
});

const PanelTitle = styled('span', {
  flex: '1',
});

const CloseButton = styled(IconButton, {
  borderRadius: '$2',
});

export const SmallScreensFiltersMenu = () => {
  const userRoles = useSelector(selectUserCurrentRoles);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <FloatingToolbarItem>
          <Filter />
        </FloatingToolbarItem>
      </Dialog.Trigger>
      <Dialog.Portal>
        <StyledFiltersPanel>
          <StyledPanelHeader>
            <PanelTitle>Filters</PanelTitle>
            <Dialog.Close asChild>
              <CloseButton variant="ghost">
                <X />
              </CloseButton>
            </Dialog.Close>
          </StyledPanelHeader>
          <PanelBody>
            <StyledScrollArea>
              <DeploymentFilter />
              <LabelFilter />
              <TagFilter />
              <ReviewFilter />
              <DateFilter type="created" />
              <DateFilter type="added" />
              {hasRole(userRoles, QUERY_WITH_CUSTOM_FILTER) && <CustomFilter />}
            </StyledScrollArea>
          </PanelBody>
          <FiltersPanelFooter areActionsDisabled={true} />
        </StyledFiltersPanel>
        <Overlay />
      </Dialog.Portal>
    </Dialog.Root>
  );
};
