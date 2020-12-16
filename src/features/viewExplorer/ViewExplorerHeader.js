import React, { useState } from 'react';
import { styled } from '../../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from '../../components/IconButton';


const ControlGroup = styled.div({
  display: 'flex',
  'button': {
    marginRight: '$1',
  },
});

const Controls = styled.div({
  display: 'flex',
});

const Crumb = styled.span({
  color: '$hiContrast',
  paddingRight: '$3',
  ':not(:first-child)': {
    paddingLeft: '$3',
  },
  ':hover': {
    borderColor: '$gray700',
    cursor: 'pointer',
  },
});

const BreadcrumbContainer = styled.div({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  fontSize: '$4',
  fontWeight: '$5',
  color: '$gray600',
});

const StyledViewExplorerHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  height: '$7',
  backgroundColor: '$loContrast',
  borderBottom: '$1 solid $gray400',
});

const ViewExplorerHeader = () => {
  const [expanded, setExpanded] = useState(false)

  const handleAccordionHeaderClick = () => {
    setExpanded(!expanded);
  };  

  return (
    <StyledViewExplorerHeader>
      <BreadcrumbContainer>
        <Crumb>
          Santa Cruz Island
        </Crumb>
        /
        <Crumb
          onClick={handleAccordionHeaderClick}
        >
          Biosecurity network
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={ 
              expanded ? ['fas', 'angle-up'] : ['fas', 'angle-down']
            }/>
          </IconButton>
        </Crumb>
      </BreadcrumbContainer>
      <Controls>
        <ControlGroup>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'save']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'cog']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'redo']} />
          </IconButton>
        </ControlGroup>
        <ControlGroup>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'list-ul']} />
          </IconButton>
          <IconButton variant='ghost' disabled>
            <FontAwesomeIcon icon={['fas', 'grip-horizontal']} />
          </IconButton>
        </ControlGroup>
      </Controls>
    </StyledViewExplorerHeader>
  );
}

export default ViewExplorerHeader;

