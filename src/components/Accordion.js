import React, { useState } from 'react';
import styled from 'styled-components';
// import { ChevronUpIcon, ChevronDownIcon } from '../assets/Icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AccordionBody = styled.div`
  margin-top: ${props => props.theme.tokens.space.$2};
  padding: ${props => props.theme.tokens.space.$2} 
    ${props => props.theme.tokens.space.$3};
  border-bottom: ${props => props.theme.border};
  background-color: ${props => props.theme.tokens.colors.$gray1};
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  path {
    fill: ${props => props.theme.tokens.colors.$gray3}
  }
  pointer-events: auto;
  :hover {
    cursor: pointer;
    path {
      fill: ${props => props.theme.tokens.colors.$gray4}
    }
  }
`;

const AccordionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  height: ${props => props.theme.tokens.space.$7};
  border-bottom: ${props => props.theme.border};
  padding: ${props => props.theme.tokens.space.$2} 
    ${props => props.theme.tokens.space.$3};
  pointer-events: auto;
  :hover {
    cursor: pointer;
  }
`;

const StyledAccordion = styled.div`

`;

const Accordion = ({ children, expandedDefault, label }) => {
  const [expanded, setExpanded] = useState(expandedDefault)

  const handleAccordionHeaderClick = () => {
    setExpanded(!expanded);
  };  

  return (
    <StyledAccordion>
      <AccordionHeader onClick={handleAccordionHeaderClick}>
        {label}
        <StyledFontAwesomeIcon icon={ 
          expanded ? ['fas', 'angle-down'] : ['fas', 'angle-right']
        }/>
      </AccordionHeader>
      {expanded && (
        <AccordionBody expanded={expanded}>
          {children}
        </AccordionBody>
      )}
    </StyledAccordion>
  );
};

export default Accordion;
