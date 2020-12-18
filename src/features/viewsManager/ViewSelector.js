import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { styled } from '../../theme/stitches.config.js';
import {
  selectViews,
  fetchViews,
 } from './viewsSlice';
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
  ':last-child': {
    paddingRight: '$1',
  },
  ':not(:first-child)': {
    paddingLeft: '$3',
  },
  ':hover': {
    borderColor: '$gray700',
    cursor: 'pointer',
  },
});

const Breadcrumbs = styled.div({
  fontSize: '$4',
  fontWeight: '$5',
  color: '$gray600',
});

const ViewNavigation = styled.div({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
})

const StyledViewNav = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '$0 $4',
  backgroundColor: '$loContrast',
});

const ViewNav = () => {
  const views = useSelector(selectViews);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!views.length) {
      dispatch(fetchViews());
    }
  }, [views, dispatch]);

  const handleViewNavClick = () => {
    setExpanded(!expanded);
  };  

  return (
    <StyledViewNav>
      {/*<ControlGroup>
        <IconButton variant='ghost' disabled>
          <FontAwesomeIcon icon={['fas', 'save']} />
        </IconButton>
        <IconButton variant='ghost' disabled>
          <FontAwesomeIcon icon={['fas', 'cog']} />
        </IconButton>
        <IconButton variant='ghost' disabled>
          <FontAwesomeIcon icon={['fas', 'redo']} />
      </IconButton>
      </ControlGroup>*/}
      <ViewNavigation onClick={handleViewNavClick}>
        <Breadcrumbs>
          <Crumb>
            Santa Cruz Island
          </Crumb>
          /
          <Crumb>
            Biosecurity network
          </Crumb>
        </Breadcrumbs>
        <IconButton variant='ghost'>
          <FontAwesomeIcon icon={ 
            expanded ? ['fas', 'angle-up'] : ['fas', 'angle-down']
          }/>
        </IconButton>
      </ViewNavigation>
      {/*<ControlGroup>
        <IconButton variant='ghost' disabled>
          <FontAwesomeIcon icon={['fas', 'list-ul']} />
        </IconButton>
        <IconButton variant='ghost' disabled>
          <FontAwesomeIcon icon={['fas', 'grip-horizontal']} />
        </IconButton>
      </ControlGroup>*/}
    </StyledViewNav>
  );
}

export default ViewNav;

