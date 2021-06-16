import React from 'react';
import { styled } from '../theme/stitches.config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from './IconButton';

const PanelTitle = styled.span({
  // marginLeft: '$2',
});

const StyledHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $2 $0 $3',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  fontWeight: '$5',
  color: '$hiContrast',
});

const PanelHeader = ({ children, title, handlePanelClose, className }) => (
  <StyledHeader className={className}>
    {title &&
      <PanelTitle>
        {title}
      </PanelTitle>
    }
    { children }
    <IconButton
      variant='ghost'
      onClick={handlePanelClose}>
      <FontAwesomeIcon 
        icon={['fas', 'times']}
      />
    </IconButton>
  </StyledHeader>
);

export default PanelHeader;
