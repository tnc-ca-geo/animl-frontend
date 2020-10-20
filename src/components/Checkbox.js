import React from 'react';
import styled from 'styled-components';

const CheckboxContainer = styled.div`
  display: inline-block;
  vertical-align: middle;
`

const Icon = styled.svg`
  fill: none;
  stroke: white;
  stroke-width: 3px;
`
// Hide checkbox visually but remain accessible to screen readers.
// Source: https://polished.js.org/docs/#hidevisually
const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  border: 0;
  clip: rect(0 0 0 0);
  clippath: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`
const StyledCheckbox = styled.div`
  display: inline-block;
  width: 14px;
  height: 14px;
  background: ${props => (props.checked
    ? props.theme.tokens.colors.$gray4
    : props.theme.tokens.colors.$gray1)};
  border-radius: 3px;
  border: 1px solid;
  border-color: ${props => (props.checked
    ? props.theme.tokens.colors.$gray4
    : props.theme.tokens.colors.$gray3)};
  transition: all 150ms;

  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px #B7F5FF;
  }

  ${Icon} {
    visibility: ${props => (props.checked ? 'visible' : 'hidden')};
  }
`
// adapted from:
// https://medium.com/@colebemis/building-a-checkbox-component-with-react-and-styled-components-8d3aa1d826dd

const Checkbox = ({ className, checked, ...props }) => (
  <CheckboxContainer className={className}>
    <HiddenCheckbox checked={checked} {...props} />
    <StyledCheckbox checked={checked}>
      <Icon viewBox="0 0 24 24">
        <polyline points="20 4 9 15 4 10" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);

export default Checkbox;
