import React from 'react';
import moment from 'moment-timezone';
import { styled } from '../theme/stitches.config.js';

const Label = styled('label', {
  fontSize: '$3',
  fontWeight: '$5',
  color: '$textDark',
  marginBottom: '$2',
  display: 'block',
});

const DateTimeInput = styled('input', {
  fontSize: '$3',
  fontFamily: '$sourceSansPro',
  color: '$textMedium',
  padding: '$2 $3',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: '$border',
  backgroundColor: '#FFFFFF',
  borderRadius: '$1',
  width: '100%',
  '&:focus': {
    outline: 'none',
    borderColor: '$blue500',
    boxShadow: '0 0 0 1px $blue500',
  },
  '&::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
  },
});

const HelperText = styled('div', {
  fontSize: '$2',
  color: '$textLight',
  marginTop: '$2',
});

const DateTimePicker = ({ datetime, onDateTimeChange }) => {
  // Convert datetime to format for datetime-local input (YYYY-MM-DDTHH:mm:ss)
  const formatForInput = (date) => {
    if (!date) return '';
    const m = moment(date);
    // Format: YYYY-MM-DDTHH:mm:ss
    return m.format('YYYY-MM-DDTHH:mm:ss');
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    // Parse the datetime-local value and convert to Date
    const newDateTime = moment(value).toDate();
    onDateTimeChange(newDateTime);
  };

  return (
    <>
      <Label htmlFor="datetime-input">Date and Time</Label>
      <DateTimeInput
        id="datetime-input"
        type="datetime-local"
        step="1"
        value={formatForInput(datetime)}
        onChange={handleChange}
      />
      <HelperText>
        Type or use the picker to select date and time
      </HelperText>
    </>
  );
};

export default DateTimePicker;
