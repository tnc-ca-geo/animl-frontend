import React from 'react';
import _ from 'lodash';
import { styled } from '../theme/stitches.config';
import Select from 'react-select';
import { FormError } from './Form';

const StyledSelect = styled(Select, {
  '.react-select__control': {
    padding: '$1 0',
    boxSizing: 'border-box',
    border: '1px solid',
    borderColor: '$gray400',
    borderRadius: '$1',
    cursor: 'pointer',
  },
  '.react-select__value-container': {
    fontSize: '$3',
    fontFamily: '$sourceSansPro',
    color: '$gray700',
    height: '40px',
    paddingLeft: '$3'
  },
  '.react-select__control--is-focused': {
    transition: 'all 0.2s ease',
    boxShadow: '0 0 0 3px $blue200',
    borderColor: '$blue500',
    '&:hover': {
      boxShadow: '0 0 0 3px $blue200',
      borderColor: '$blue500',
    },
  },
  '.react-select__menu': {
    color: '$hiContrast',
    fontSize: '$3',
    '.react-select__option': {
      cursor: 'pointer',
    },
    '.react-select__option--is-selected': {
      color: '$blue500',
      backgroundColor: '$blue200',
    },
    '.react-select__option--is-focused': {
      backgroundColor: '$gray300',
    },
  }
});

const SelectField = ({
  name,
  label,
  value,
  options,
  onChange,
  onBlur,
  error,
  touched,
  isSearchable,
}) => {
  
  const handleChange = (value) => {
    onChange(name, value);
  };

  const handleBlur = () => {
    onBlur(name, true);
  };

  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <StyledSelect
        id={name}
        options={options}
        multi={true}
        onChange={handleChange}
        onBlur={handleBlur}
        value={_.isEmpty(value) ? null : value}
        className='react-select'
        classNamePrefix='react-select'
        isSearchable={isSearchable}
      />
      {!!error &&
        touched && (
          <FormError>
            {error}
          </FormError>
      )}
    </div>
  );
};

export default SelectField;
