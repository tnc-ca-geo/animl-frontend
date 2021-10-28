import React, { useState } from 'react';
import { styled } from '../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from './IconButton';

const SelectedCount = styled('span', {
  background: '#003bd73d',  // TODO: come up with system for semi-opaque color tokens 
  fontSize: '$2',
  fontWeight: '$5',
  color: '$blue500',
  padding: '$1 $2',
  borderRadius: '$2',
});

const Label = styled('span', {
  marginRight: '$3',
});

const AccordionBody = styled('div', {
  // padding: '$2 $3',
  borderBottom: '1px solid $gray400',
  backgroundColor: '$gray200',
  fontFamily: '$mono',
  '& > div': {
    padding: '$2 $3'
  }
});

const ExpandButton = styled('div', {
  paddingRight: '$2',
})

const AccordionHeader = styled('div', {
  display: 'flex',
  alignItems: 'center',
  // justifyContent: 'space-between',
  fontWeight: '$3',
  fontFamily: '$sourceSansPro',
  height: '$7',
  borderBottom: '1px solid $gray400',
  padding: '$0 $2 $0 $2',
  pointerEvents: 'auto',
  '&:hover': {
    cursor: 'pointer',
  },
});

const Accordion = (props) => {
  const [expanded, setExpanded] = useState(props.expandedDefault);

  const handleAccordionHeaderClick = () => {
    setExpanded(!expanded);
  };  

  return (
    <div>
      <AccordionHeader onClick={handleAccordionHeaderClick}>
        <ExpandButton>
          <IconButton variant='ghost'>
            <FontAwesomeIcon icon={ 
              expanded ? ['fas', 'angle-down'] : ['fas', 'angle-right']
            }/>
          </IconButton>
        </ExpandButton>
        {props.label &&
          <Label>{props.label}</Label>
        }
        {(props.selectedCount > 0) &&
          <SelectedCount>{props.selectedCount}</SelectedCount>
        }
        {props.headerButtons}
      </AccordionHeader>
      {expanded && (
        <AccordionBody>
          {props.children}
        </AccordionBody>
      )}
    </div>
  );
};

export default Accordion;
