import React from 'react';
import { styled } from '../theme/stitches.config';

const CheckboxContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  // display: 'inline-block',
  // verticalAlign: 'middle',
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
  // transition: 'all 150ms',

  '&:hover': {
    cursor: 'pointer',
    background: '$gray3',
  },

  [`& ${HiddenCheckbox}`]: {
    '&:focus': {
      boxShadow: '0 0 0 3px #B7F5FF',
    },
  },

  background: '$loContrast',
  borderColor: '$gray9',

  // for some reason you need to have variants defined here (even if empty)
  // if you want to use compountVarients
  variants: {
    checked: {},
    active: {},
    indeterminate: {},
  },

  compoundVariants: [
    {
      checked: false,
      indeterminate: false,
      css: {
        background: '$loContrast',
        borderColor: '$gray9',
      },
    },
    {
      checked: true,
      active: true,
      css: {
        background: '$hiContrast',
        borderColor: '$hiContrast',
        '&:hover': {
          background: '$hiContrast',
        },
      },
    },
    {
      checked: true,
      active: false,
      css: {
        background: '$gray6',
        borderColor: '$gray6',
        '&:hover': {
          background: '$gray6',
        },
      },
    },
    {
      indeterminate: true,
      active: true,
      css: {
        background: '$hiContrast',
        borderColor: '$hiContrast',
        '&:hover': {
          background: '$hiContrast',
        },
      },
    },
    {
      indeterminate: true,
      active: false,
      css: {
        background: '$gray6',
        borderColor: '$gray6',
        '&:hover': {
          background: '$gray6',
        },
      },
    },

  ],
});

// adapted from:
// https://medium.com/@colebemis/building-a-checkbox-component-with-react-and-styled-components-8d3aa1d826dd

const Checkbox = ({ className, checked, active, indeterminate, ...props }) => (
  <CheckboxContainer className={className}>
    <HiddenCheckbox type='checkbox' checked={checked} {...props} />
    <StyledCheckbox
      checked={checked}
      active={active}
      indeterminate={indeterminate}
    >
      {checked && 
        <SVGIcon viewBox="0 0 24 24">
          <polyline points="20 4 9 15 4 10" />
        </SVGIcon> 
      }
      {indeterminate && 
        <SVGIcon viewBox="0 0 24 24">
          <line x1="4" y1="10" x2="20" y2="10" />
        </SVGIcon> 
      }
    </StyledCheckbox>
  </CheckboxContainer>
);


export default Checkbox;
