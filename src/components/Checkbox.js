import React from 'react';
import { styled } from '../theme/stitches.config';

const CheckboxContainer = styled.div({
  display: 'inline-block',
  verticalAlign: 'middle',
});

const Icon = styled.svg({
  fill: 'none',
  stroke: 'white',
  strokeWidth: '3px',
});

// Hide checkbox visually but remain accessible to screen readers.
// Source: https://polished.js.org/docs/#hidevisually
const HiddenCheckbox = styled.input({
  border: '0',
  clip: 'rect(0 0 0 0)',
  clippath: 'inset(50%)',
  height: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: '0',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: '1px',
});

const StyledCheckbox = styled.div({
  display: 'inline-block',
  width: '14px',
  height: '14px',
  borderRadius: '3px',
  border: '1px solid',
  transition: 'all 150ms',

  ':hover': {
    cursor: 'pointer',
  },

  [`& ${HiddenCheckbox}`]: {
    ':focus': {
      boxShadow: '0 0 0 3px #B7F5FF',
    },
  },

  variants: {
    checked: {
      true: {
        background: '$hiContrast',
        borderColor: '$hiContrast',
        [`& ${Icon}`]: {
          visibility: 'visible',
        },
      },
      false: {
        background: '$gray200',
        borderColor: '$gray400',
        [`& ${Icon}`]: {
          visibility: 'hidden',
        },
      },
    },
  },
});

// adapted from:
// https://medium.com/@colebemis/building-a-checkbox-component-with-react-and-styled-components-8d3aa1d826dd

const Checkbox = ({ className, checked, ...props }) => (
  <CheckboxContainer className={className}>
    <HiddenCheckbox type='checkbox' checked={checked} {...props} />
    <StyledCheckbox checked={checked}>
      <Icon viewBox="0 0 24 24">
        <polyline points="20 4 9 15 4 10" />
      </Icon>
    </StyledCheckbox>
  </CheckboxContainer>
);

export default Checkbox;
