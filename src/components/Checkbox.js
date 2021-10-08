import React from 'react';
import { styled } from '../theme/stitches.config';

const CheckboxContainer = styled('div', {
  display: 'inline-block',
  verticalAlign: 'middle',
});

const SVGIcon = styled('svg', {
  position: 'absolute',
  top: '1px',
  fill: 'none',
  stroke: 'white',
  strokeWidth: '3px',
});

// Hide checkbox visually but remain accessible to screen readers.
// Source: https://polished.js.org/docs/#hidevisually
const HiddenCheckbox = styled('input', {
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

const StyledCheckbox = styled('div', {
  position: 'relative',
  display: 'inline-block',
  width: '14px',
  height: '14px',
  borderRadius: '$1',
  border: '1px solid',
  transition: 'all 150ms',

  '&:hover': {
    cursor: 'pointer',
  },

  [`& ${HiddenCheckbox}`]: {
    '&:focus': {
      boxShadow: '0 0 0 3px #B7F5FF',
    },
  },

  background: '$loContrast',
  borderColor: '$gray600',
  [`& ${SVGIcon}`]: {
    visibility: 'hidden',
  },

  variants: {
    checked: {
      true: {
        // background: '$hiContrast',
        // borderColor: '$hiContrast',
        background: '$gray600',
        [`& ${SVGIcon}`]: {
          visibility: 'visible',
        },
      },
      false: {
        '&:hover': {
          background: '$gray300',
        },
      }
    },

    active: {
      true: {
        background: '$hiContrast',
        borderColor: '$hiContrast',
      },

    }
  },
});

// adapted from:
// https://medium.com/@colebemis/building-a-checkbox-component-with-react-and-styled-components-8d3aa1d826dd

const Checkbox = ({ className, checked, active, ...props }) => (
  <CheckboxContainer className={className}>
    <HiddenCheckbox type='checkbox' checked={checked} {...props} />
    <StyledCheckbox checked={checked} active={active}>
      <SVGIcon viewBox="0 0 24 24">
        <polyline points="20 4 9 15 4 10" />
      </SVGIcon>
    </StyledCheckbox>
  </CheckboxContainer>
);

export default Checkbox;
