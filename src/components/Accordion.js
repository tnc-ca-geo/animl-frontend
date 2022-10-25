import React, { useState } from 'react';
import { styled } from '../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from './IconButton';
import { indigo } from '@radix-ui/colors';


const SelectedCount = styled('span', {
  background: indigo.indigo4,
  fontSize: '$2',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $2',
  borderRadius: '$2',
});

const Label = styled('span', {
  marginRight: '$4',
});

const AccordionBody = styled('div', {
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundDark',
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
  fontWeight: '$3',
  fontFamily: '$sourceSansPro',
  height: '$7',
  borderBottom: '1px solid $border',
  color: '$textDark',
  backgroundColor: '$backgroundLight',
  padding: '$0 $2 $0 $2',
  pointerEvents: 'auto',
  position: 'relative',
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
