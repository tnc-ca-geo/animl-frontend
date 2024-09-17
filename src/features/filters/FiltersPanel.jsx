import React from 'react';
import { useSelector } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import { selectUserCurrentRoles } from '../auth/authSlice.js';
import { hasRole, QUERY_COMMENTS_ROLES, QUERY_WITH_CUSTOM_FILTER } from '../auth/roles.js';
import PanelHeader from '../../components/PanelHeader.jsx';
import StyledScrollArea from '../../components/ScrollArea.jsx';
import DeploymentFilter from './DeploymentFilter.jsx';
import ReviewFilter from './ReviewFilter.jsx';
import DateFilter from './DateFilter.jsx';
import LabelFilter from './LabelFilter.jsx';
import CustomFilter from './CustomFilter.jsx';
import FiltersPanelFooter from './FiltersPanelFooter.jsx';
import { CommentsFilter } from './CommentsFilter.jsx';


const PanelBody = styled('div', {
  backgroundColor: '$backgroundLight',
  height: 'calc(100% - $7 - $7)', // 2x $7's to account for header + footer
  // overflowY: 'scroll',
  position: 'absolute',
  width: '100%',
});

const StyledFiltersPanel = styled('div', {
  position: 'relative',
  borderRight: '1px solid $border',
  flexGrow: '0',
  flexShrink: '0',
  flexBasis: '330px',
  height: 'calc(100vh - $8 - 1px)', // to account for navbar + border
  overflowY: 'hidden',
});


const FiltersPanel = ({ toggleFiltersPanel }) => {
  const userRoles = useSelector(selectUserCurrentRoles);

  return (
    <StyledFiltersPanel>
      <PanelHeader 
        title='Filters'
        handlePanelClose={toggleFiltersPanel}
      >
      </PanelHeader>
      <PanelBody>
        <StyledScrollArea>
          <DeploymentFilter/>
          <LabelFilter/>
          <ReviewFilter/>
          <DateFilter type='created'/>
          <DateFilter type='added'/>
          {hasRole(userRoles, QUERY_COMMENTS_ROLES) &&
            <CommentsFilter />
          }
          {hasRole(userRoles, QUERY_WITH_CUSTOM_FILTER) &&
            <CustomFilter />
          }
        </StyledScrollArea>
      </PanelBody>
      <FiltersPanelFooter />
    </StyledFiltersPanel>
  );
}

export default FiltersPanel;
