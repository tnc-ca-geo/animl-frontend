import React, { useState } from 'react';
import { styled } from '../theme/stitches.config';

const StyledSelect = styled.select({
  // appearance: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  fontFamily: 'inherit',
  height: '$5',
  fontSize: '$3',
  paddingLeft: '$1',
  borderRadius: '$2',
  color: '$hiContrast',
  ':hover': {
    cursor: 'pointer',
  },
});

const Select = (props) => (
  <StyledSelect
    onChange={props.handleChange}
    value={props.defaultValue}>
    {props.options.map((option, i) => (
      <option
        key={i}
        value={option}
      >
        {option}
      </option>
    ))}
  </StyledSelect>
);

export default Select;
