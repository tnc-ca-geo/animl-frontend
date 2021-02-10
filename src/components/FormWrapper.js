import React from 'react';
import { styled } from '../theme/stitches.config.js';

const textInput = {
  display: 'inherit',
  width: '100%',
  fontSize: '$3',
  fontFamily: '$roboto',
  color: '$gray700',
  padding: '$3',
  boxSizing: 'border-box',
  border: '$1 solid',
  borderColor: '$gray400',
  borderRadius: '$1',
  transition: 'all 0.2s ease',
  ':focus': {
    outline: 'none',
    boxShadow: '0 0 0 3px $blue200',
    borderColor: '$blue500',
  }
};

const StyledFormWrapper = styled.div({
  display: 'block',
  width: '100%',
  label: {
    display: 'inherit',
    width: '100%',
    fontSize: '$3',
    fontWeight: '$3',
    color: '$hiContrast',
    marginBottom: '$2',
  },
  input: textInput,
  textarea: {
    resize: 'none',
    ...textInput,
  },
  p: {
    color: '$blue700',
  }
});

const FormWrapper = ({ children }) => (
  <StyledFormWrapper>
    { children }
  </StyledFormWrapper>
);

export default FormWrapper;