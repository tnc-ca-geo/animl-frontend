import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronUpIcon, ChevronDownIcon } from '../assets/Icons'

const AccordionBody = styled.div`
  margin-top: 10;
  padding: 10px 20px;
  border-bottom: ${props => props.theme.border};
  background-color: ${props => props.theme.tokens.colors.$gray1};
`;

const Chevron = styled.div`
  svg g {
    fill: ${props => props.theme.tokens.colors.$gray3}
  }
  :hover {
    svg g {
      fill: ${props => props.theme.tokens.colors.$gray4}
    }
  }
`

const AccordionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  height: 50px;  
  border-bottom: ${props => props.theme.border};
  padding: 0px 20px;
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
        <Chevron>
          {expanded ? (<ChevronDownIcon/>) : (<ChevronUpIcon/>)}
        </Chevron>
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
