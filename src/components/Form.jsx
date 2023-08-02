import React from 'react';
import { styled } from '../theme/stitches.config';

const textInput = {
  display: 'inherit',
  width: '100%',
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textMedium',
  padding: '$3',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  '&:focus': {
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 0 0 3px $gray3',
    borderColor: '$textDark',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
};

const StyledFormWrapper = styled('div', {
  display: 'block',
  width: '100%',
  label: {
    display: 'inherit',
    width: '100%',
    fontSize: '$3',
    fontWeight: '$3',
    color: '$textDark',
    marginBottom: '$2',
  },
  input: textInput,
  textarea: {
    resize: 'none',
    ...textInput,
  },
  select: {
    ...textInput
  },
  p: {
    color: '$textMedium',
    fontSize: '$3',
  }
});

export const FormWrapper = ({ children }) => (
  <StyledFormWrapper>
    { children }
  </StyledFormWrapper>
);

export const FormSubheader = styled('div', {
  padding: '$3 $0',
  fontWeight: '$5',
});

export const FieldRow = styled('div', {
  paddingBottom: '$3',
  display: 'flex',
});

export const ButtonRow = styled(FieldRow, {
  justifyContent: 'flex-end',
  paddingTop: '$3',
  button: {
    marginRight: '$3',
    '&:last-child': {
      marginRight: '0',
    },
  }
});

export const FormFieldWrapper = styled('div', {
  flexGrow: '1',
  marginBottom: '$3',
  marginLeft: '$3',
  '&:first-child': {
    marginLeft: '0',
  }
});

export const FormError = styled('div', {
  color: '$errorText',
  fontSize: '$3',
  marginTop: '$2',
});

export const HelperText = styled('div', {
  padding: '$3',
  color: '$textDark',
  '& p': {
    marginTop: '$0',
    
    '&:last-child': {
      marginBottom: '$0',
    }
  }
});