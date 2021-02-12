import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectSelectedView } from './viewsSlice';
import { selectLoupeOpen } from '../loupe/loupeSlice';
import SidebarNav from '../views/SidebarNav';
import FiltersPanel from '../filters/FiltersPanel';
import ImagesPanel from '../images/ImagesPanel';
import Loupe from '../loupe/Loupe';

const ViewExplorerWrapper = styled.div({
  display: 'flex',
});

const ViewExplorerBody = styled.div({
  display: 'flex',
  flexGrow: 1,
});

export function ViewExplorer() {
  const selectedView = useSelector(selectSelectedView);
  const loupeOpen = useSelector(selectLoupeOpen);

  return (
    <ViewExplorerWrapper>
      <SidebarNav view={selectedView} />
      <ViewExplorerBody>
        <FiltersPanel expandedDefault={true} />
        <ImagesPanel />
        <Loupe expanded={loupeOpen} />
      </ViewExplorerBody>
    </ViewExplorerWrapper>
  );
};
