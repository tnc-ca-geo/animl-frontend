import React from 'react';
import _ from 'lodash';
import Select from 'react-select';
import { FormError } from './Form';
import InfoIcon from './InfoIcon';

// TODO: refactor using radix select primative.
// I don't love the incongruous approach to styling react-select forces

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    height: '55px',
    boxSizing: 'border-box',
    border: '1px solid',
    borderColor: 'var(--colors-border) !important',
    borderRadius: 'var(--radii-1)',
    cursor: 'pointer',
    ...(state.isFocused && {
      transition: 'all 0.2s ease',
      boxShadow: '0 0 0 3px var(--colors-gray3)',
      borderColor: 'var(--hi-contrast)',
      '&:hover': {
        boxShadow: '0 0 0 3px var(--colors-blue200)',
        borderColor: 'var(--colors-blue500)',
      },
    }),
  }),
  input: (provided) => ({
    ...provided,
    'input:focus': {
      boxShadow: 'none !important',
      transition: 'none',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '100%',
    padding: '0px 16px',
    fontSize: 'var(--fontSizes-3)',
    fontFamily: 'var(--fonts-sourceSansPro)',
    color: 'var(--colors-gray7)',
  }),
  menu: (provided) => ({
    ...provided,
    color: 'var(--colors-hiContrast)',
    fontSize: 'var(--fontSizes-3)',
  }),
  option: (provided, state) => ({
    ...provided,
    cursor: 'pointer',
    ...(state.isSelected && {
      color: 'var(--colors-blue500)',
      backgroundColor: 'var(--colors-blue200)',
    }),
    ...(state.isFocused && {
      backgroundColor: 'var(--colors-gray3)',
    }),
  }),
};

const SelectField = ({
  name,
  label,
  tooltip,
  value,
  options,
  onChange,
  onBlur,
  error,
  touched,
  isSearchable,
  isMulti,
  menuPlacement = 'bottom',
}) => {
  const handleChange = (value) => {
    onChange(name, value);
  };

  const handleBlur = () => {
    onBlur(name, true);
  };

  return (
    <div>
      {label && (
        <label htmlFor={name}>
          {label}
          {tooltip && <InfoIcon tooltipContent={tooltip} />}
        </label>
      )}
      <Select
        styles={customStyles}
        inputId={name}
        options={options}
        multi={true}
        onChange={handleChange}
        onBlur={handleBlur}
        value={_.isEmpty(value) ? null : value}
        className="react-select"
        classNamePrefix="react-select"
        isSearchable={isSearchable}
        isMulti={isMulti}
        menuPlacement={menuPlacement}
      />
      {!!error && touched && <FormError>{error}</FormError>}
    </div>
  );
};

export default SelectField;
