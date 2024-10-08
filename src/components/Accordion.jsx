import React, { useState } from 'react';
import { styled } from '../theme/stitches.config.js';
import { ChevronRightIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import IconButton from './IconButton.jsx';
import { indigo } from '@radix-ui/colors';

export const SelectedCount = styled('span', {
  background: indigo.indigo4,
  fontSize: '$2',
  fontWeight: '$5',
  color: indigo.indigo11,
  padding: '2px $2',
  borderRadius: '$2',
});

export const Label = styled('span', {
  marginRight: '$4',

  variants: {
    bold: {
      true: {
        fontWeight: '$4',
      },
    },
  },
});

const AccordionBody = styled('div', {
  borderBottom: '1px solid $border',
  backgroundColor: '$backgroundDark',
  fontFamily: '$mono',
  '& > div': {
    padding: '$2 $3',
  },
});

const ExpandButton = styled('div', {
  paddingRight: '$2',
});

export const AccordionHeader = styled('div', {
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
export const AccordionHeaderNoHover = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontWeight: '$3',
  fontFamily: '$sourceSansPro',
  height: '$7',
  borderBottom: '1px solid $border',
  color: '$textDark',
  backgroundColor: '$backgroundLight',
  padding: '$0 $2 $0 $2',
  position: 'relative',
});

const Accordion = (props) => {
  const [expanded, setExpanded] = useState(props.expandedDefault);
  const expandOnHeaderClick = props.expandOnHeaderClick || false;

  const handleAccordionHeaderClick = () => {
    if (expandOnHeaderClick) {
      setExpanded(!expanded);
    }
  };

  const handleExpandButtonClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <AccordionHeader onClick={handleAccordionHeaderClick}>
        <ExpandButton onClick={handleExpandButtonClick}>
          <IconButton variant="ghost">
            {expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </IconButton>
        </ExpandButton>
        {props.label && <Label bold={props.boldLabel}>{props.label}</Label>}
        {props.selectedCount > 0 && <SelectedCount>{props.selectedCount}</SelectedCount>}
        {props.headerButtons}
      </AccordionHeader>
      {expanded && <AccordionBody>{props.children}</AccordionBody>}
    </div>
  );
};

export default Accordion;
