import React, { useState } from 'react';
import { styled } from '../theme/stitches.config.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import IconButton from './IconButton';

const AccordionBody = styled.div({
  padding: '$2 $3',
  borderBottom: '$1 solid $gray400',
  backgroundColor: '$gray200',
  fontFamily: '$mono',
});

const AccordionHeader = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontWeight: '$2',
  fontFamily: '$roboto',
  height: '$7',
  borderBottom: '$1 solid $gray400',
  padding: '$0 $2 $0 $3',
  pointerEvents: 'auto',
  '&:hover': {
    cursor: 'pointer',
  },
});

const Accordion = ({ children, expandedDefault, label }) => {
  const [expanded, setExpanded] = useState(expandedDefault)

  const handleAccordionHeaderClick = () => {
    setExpanded(!expanded);
  };  

  return (
    <div>
      <AccordionHeader onClick={handleAccordionHeaderClick}>
        {label}
        <IconButton variant='ghost'>
          <FontAwesomeIcon icon={ 
            expanded ? ['fas', 'angle-up'] : ['fas', 'angle-down']
          }/>
        </IconButton>
      </AccordionHeader>
      {expanded && (
        <AccordionBody>
          {children}
        </AccordionBody>
      )}
    </div>
  );
};

export default Accordion;
